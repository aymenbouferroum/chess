#!/usr/bin/env python3
"""
Stockfish HTTP API for Chess 2.0 Telegram Mini App.
Runs on 127.0.0.1:3848, fronted by nginx at /api/stockfish.

Usage:
    python3 stockfish_server.py

Systemd service: stockfish-api.service
"""

import json
import subprocess
import threading
import time
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

STOCKFISH_PATH = '/usr/games/stockfish'
POOL_SIZE = 3
PORT = 3848
BIND = '127.0.0.1'
ENGINE_TIMEOUT = 15  # seconds
MAX_DEPTH = 30
MAX_MOVETIME = 10000  # ms
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 20  # requests per window per IP

FEN_REGEX = re.compile(
    r'^[rnbqkpRNBQKP1-8/]+ [wb] [KQkq-]+ [a-h1-8-]+ \d+ \d+$'
)


class RateLimiter:
    def __init__(self, window=RATE_LIMIT_WINDOW, max_requests=RATE_LIMIT_MAX):
        self.window = window
        self.max_requests = max_requests
        self.requests = {}  # ip -> [timestamps]
        self.lock = threading.Lock()

    def allow(self, ip):
        now = time.time()
        with self.lock:
            if ip not in self.requests:
                self.requests[ip] = []
            # Prune old entries
            self.requests[ip] = [t for t in self.requests[ip] if now - t < self.window]
            if len(self.requests[ip]) >= self.max_requests:
                return False
            self.requests[ip].append(now)
            return True


class StockfishProcess:
    def __init__(self):
        self.lock = threading.Lock()
        self.proc = None
        self._spawn()

    def _spawn(self):
        if self.proc:
            try:
                self.proc.kill()
            except Exception:
                pass
        self.proc = subprocess.Popen(
            [STOCKFISH_PATH],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            bufsize=1,
        )
        self._read_until('uciok', init=True)

    def _read_until(self, token, timeout=10, init=False):
        if init:
            self.proc.stdin.write('uci\n')
            self.proc.stdin.flush()
        deadline = time.time() + timeout
        while time.time() < deadline:
            line = self.proc.stdout.readline().strip()
            if token in line:
                return line
        raise TimeoutError(f'Timeout waiting for {token}')

    def analyze(self, fen, skill_level, depth, movetime):
        with self.lock:
            try:
                return self._do_analyze(fen, skill_level, depth, movetime)
            except Exception:
                # Respawn on any failure
                try:
                    self._spawn()
                except Exception:
                    pass
                return None

    def _do_analyze(self, fen, skill_level, depth, movetime):
        proc = self.proc
        if proc.poll() is not None:
            self._spawn()
            proc = self.proc

        # Configure engine
        proc.stdin.write(f'setoption name Skill Level value {skill_level}\n')
        if skill_level < 20:
            proc.stdin.write('setoption name UCI_LimitStrength value true\n')
        else:
            proc.stdin.write('setoption name UCI_LimitStrength value false\n')
        proc.stdin.write('isready\n')
        proc.stdin.flush()
        self._wait_ready(proc)

        # Set position and search
        proc.stdin.write(f'position fen {fen}\n')
        if movetime:
            proc.stdin.write(f'go movetime {movetime}\n')
        else:
            proc.stdin.write(f'go depth {depth}\n')
        proc.stdin.flush()

        # Read until bestmove
        deadline = time.time() + ENGINE_TIMEOUT
        while time.time() < deadline:
            line = proc.stdout.readline().strip()
            if line.startswith('bestmove'):
                parts = line.split()
                bestmove = parts[1] if len(parts) > 1 else None
                ponder = parts[3] if len(parts) > 3 and parts[2] == 'ponder' else None
                return {'bestmove': bestmove, 'ponder': ponder}

        # Timeout - kill and respawn
        proc.kill()
        self._spawn()
        return None

    def _wait_ready(self, proc, timeout=5):
        deadline = time.time() + timeout
        while time.time() < deadline:
            line = proc.stdout.readline().strip()
            if 'readyok' in line:
                return
        raise TimeoutError('readyok timeout')


class StockfishPool:
    def __init__(self, size=POOL_SIZE):
        self.engines = [StockfishProcess() for _ in range(size)]
        self.index = 0
        self.index_lock = threading.Lock()

    def analyze(self, fen, skill_level, depth, movetime):
        # Round-robin selection, try non-locked engines first
        with self.index_lock:
            start = self.index
            self.index = (self.index + 1) % len(self.engines)

        # Try the assigned engine
        engine = self.engines[start]
        return engine.analyze(fen, skill_level, depth, movetime)


# Globals
pool = None
rate_limiter = RateLimiter()


class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress default logging; use journal via print if needed

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors_headers()
        self.end_headers()

    def do_POST(self):
        if self.path != '/analyze':
            self.send_error(404)
            return

        # Rate limit
        client_ip = self.headers.get('X-Real-IP', self.client_address[0])
        if not rate_limiter.allow(client_ip):
            self._json_response(429, {'error': 'Rate limit exceeded'})
            return

        # Read body
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 4096:
            self._json_response(400, {'error': 'Request too large'})
            return

        try:
            body = self.rfile.read(content_length)
            data = json.loads(body)
        except (json.JSONDecodeError, ValueError):
            self._json_response(400, {'error': 'Invalid JSON'})
            return

        # Validate
        fen = data.get('fen', '')
        if not fen or not FEN_REGEX.match(fen):
            self._json_response(400, {'error': 'Invalid FEN'})
            return

        skill_level = data.get('skillLevel', 10)
        if not isinstance(skill_level, int) or skill_level < 0 or skill_level > 20:
            self._json_response(400, {'error': 'skillLevel must be 0-20'})
            return

        depth = data.get('depth', 10)
        if not isinstance(depth, int) or depth < 1 or depth > MAX_DEPTH:
            self._json_response(400, {'error': f'depth must be 1-{MAX_DEPTH}'})
            return

        movetime = data.get('movetime')
        if movetime is not None:
            if not isinstance(movetime, int) or movetime < 100 or movetime > MAX_MOVETIME:
                self._json_response(400, {'error': f'movetime must be 100-{MAX_MOVETIME}ms'})
                return

        # Analyze
        result = pool.analyze(fen, skill_level, depth, movetime)
        if result and result.get('bestmove'):
            self._json_response(200, result)
        else:
            self._json_response(500, {'error': 'Engine timeout'})

    def _json_response(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self._cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', 'https://game.altobolt.com')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


def main():
    global pool
    print(f'Starting Stockfish pool (size={POOL_SIZE})...')
    pool = StockfishPool(POOL_SIZE)
    print(f'Stockfish API listening on {BIND}:{PORT}')

    server = ThreadedHTTPServer((BIND, PORT), RequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('Shutting down...')
        server.shutdown()


if __name__ == '__main__':
    main()
