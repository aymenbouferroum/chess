class Evaluate {
  static PIECE_VALUES = {
    pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000,
  };

  static PST = {
    pawn: [
      [0,0,0,0,0,0,0,0], [50,50,50,50,50,50,50,50],
      [10,10,20,30,30,20,10,10], [5,5,10,25,25,10,5,5],
      [0,0,0,20,20,0,0,0], [5,-5,-10,0,0,-10,-5,5],
      [5,10,10,-20,-20,10,10,5], [0,0,0,0,0,0,0,0],
    ],
    knight: [
      [-50,-40,-30,-30,-30,-30,-40,-50], [-40,-20,0,0,0,0,-20,-40],
      [-30,0,10,15,15,10,0,-30], [-30,5,15,20,20,15,5,-30],
      [-30,0,15,20,20,15,0,-30], [-30,5,10,15,15,10,5,-30],
      [-40,-20,0,5,5,0,-20,-40], [-50,-40,-30,-30,-30,-30,-40,-50],
    ],
    bishop: [
      [-20,-10,-10,-10,-10,-10,-10,-20], [-10,0,0,0,0,0,0,-10],
      [-10,0,10,10,10,10,0,-10], [-10,5,5,10,10,5,5,-10],
      [-10,0,10,10,10,10,0,-10], [-10,10,10,10,10,10,10,-10],
      [-10,5,0,0,0,0,5,-10], [-20,-10,-10,-10,-10,-10,-10,-20],
    ],
    rook: [
      [0,0,0,0,0,0,0,0], [5,10,10,10,10,10,10,5],
      [-5,0,0,0,0,0,0,-5], [-5,0,0,0,0,0,0,-5],
      [-5,0,0,0,0,0,0,-5], [-5,0,0,0,0,0,0,-5],
      [-5,0,0,0,0,0,0,-5], [0,0,0,5,5,0,0,0],
    ],
    queen: [
      [-20,-10,-10,-5,-5,-10,-10,-20], [-10,0,0,0,0,0,0,-10],
      [-10,0,5,5,5,5,0,-10], [-5,0,5,5,5,5,0,-5],
      [0,0,5,5,5,5,0,-5], [-10,5,5,5,5,5,0,-10],
      [-10,0,5,0,0,0,0,-10], [-20,-10,-10,-5,-5,-10,-10,-20],
    ],
    king: [
      [-30,-40,-40,-50,-50,-40,-40,-30], [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30], [-30,-40,-40,-50,-50,-40,-40,-30],
      [-20,-30,-30,-40,-40,-30,-30,-20], [-10,-20,-20,-20,-20,-20,-20,-10],
      [20,20,0,0,0,0,20,20], [20,30,10,0,0,10,30,20],
    ],
  };

  static evaluate(board, color) {
    let score = 0;
    const enemy = color === 'white' ? 'black' : 'white';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board.grid[r][c];
        if (!p) continue;
        const pstRow = p.color === 'white' ? r : 7 - r;
        let val = this.PIECE_VALUES[p.type];
        if (this.PST[p.type]) {
          val += this.PST[p.type][pstRow][c];
        }
        score += p.color === color ? val : -val;
      }
    }

    // Mobility: count pieces that can move (cheap proxy, avoids expensive getLegalMoves)
    let ourMobile = 0;
    let theirMobile = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board.grid[r][c];
        if (!p) continue;
        if (p.type === 'pawn') {
          const dir = p.color === 'white' ? -1 : 1;
          const nr = r + dir;
          if (nr >= 0 && nr < 8 && !board.grid[nr][c]) (p.color === color ? ourMobile : theirMobile)++;
          const caps = [c - 1, c + 1];
          for (const cc of caps) {
            if (cc >= 0 && cc < 8 && nr >= 0 && nr < 8) {
              const t = board.grid[nr][cc];
              if (t && t.color !== p.color) (p.color === color ? ourMobile : theirMobile)++;
            }
          }
        } else if (p.type !== 'king') {
          (p.color === color ? ourMobile : theirMobile)++;
        }
      }
    }
    score += (ourMobile - theirMobile);

    return score;
  }
}
