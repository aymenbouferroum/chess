class FEN {
  static fromBoard(board, turn) {
    let fen = '';

    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = board.grid[r][c];
        if (!p) {
          empty++;
        } else {
          if (empty > 0) { fen += empty; empty = 0; }
          fen += FEN.pieceChar(p);
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    fen += ' ' + (turn === 'white' ? 'w' : 'b');

    let castling = '';
    if (board.castlingRights.white.kingside) castling += 'K';
    if (board.castlingRights.white.queenside) castling += 'Q';
    if (board.castlingRights.black.kingside) castling += 'k';
    if (board.castlingRights.black.queenside) castling += 'q';
    fen += ' ' + (castling || '-');

    if (board.enPassantTarget) {
      const file = 'abcdefgh'[board.enPassantTarget.col];
      const rank = String(8 - board.enPassantTarget.row);
      fen += ' ' + file + rank;
    } else {
      fen += ' -';
    }

    fen += ' ' + board.halfMoveClock;
    fen += ' ' + board.fullMoveNumber;

    return fen;
  }

  static pieceChar(piece) {
    const chars = { king: 'k', queen: 'q', rook: 'r', bishop: 'b', knight: 'n', pawn: 'p' };
    const c = chars[piece.type] || '?';
    return piece.color === 'white' ? c.toUpperCase() : c;
  }
}