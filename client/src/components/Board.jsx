const COLS = 7;

export default function Board({ board, canPlay, onColumnClick }) {
  return (
    <div className="board">
      {Array.from({ length: COLS }, (_, col) => (
        <div
          key={col}
          className={`column ${canPlay ? "playable" : ""}`}
          onClick={() => onColumnClick(col)}
        >
          {board.map((row, r) => (
            <div key={r} className={`cell ${row[col] || ""}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
