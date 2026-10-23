import Board from "./Board";
import { socket } from "../socket";

const NAMES = { R: "Red", Y: "Yellow" };

function statusText(game, myColor) {
  switch (game.status) {
    case "waiting":
      return "Waiting for a friend to join…";
    case "playing":
      return game.turn === myColor ? "Your turn" : `${NAMES[game.turn]}'s turn`;
    case "won":
      return game.winner === myColor ? "You won! 🎉" : "You lost. Rematch?";
    case "draw":
      return "It's a draw!";
    case "abandoned":
      return "Your opponent left the game.";
    default:
      return "";
  }
}

export default function Game({ game, myColor, notice, onLeave }) {
  const canPlay = game.status === "playing" && game.turn === myColor;
  const finished = game.status === "won" || game.status === "draw";
  const iVoted = game.rematch[myColor];

  const statusClass = [
    "status",
    game.status === "playing" ? `turn-${game.turn}` : "",
    game.status === "waiting" ? "waiting" : "",
    game.status === "won" && game.winner === myColor ? "win" : "",
  ].join(" ");

  return (
    <div>
      <p className="muted">
        You are <span className={`dot ${myColor}`} /> {NAMES[myColor]}
      </p>

      {game.status === "waiting" && (
        <div className="panel">
          <p className="muted">Share this code with a friend:</p>
          <div className="code">{game.code}</div>
        </div>
      )}

      <p className={statusClass}>{statusText(game, myColor)}</p>
      <p className="notice">{notice}</p>

      <div className={`board-wrap ${game.status === "won" ? "won" : ""}`}>
        <Board
          board={game.board}
          canPlay={canPlay}
          onColumnClick={(col) => socket.emit("make_move", col)}
        />
      </div>

      <div className="actions">
        {finished && (
          <button disabled={iVoted} onClick={() => socket.emit("rematch")}>
            {iVoted ? "Waiting for opponent…" : "Rematch"}
          </button>
        )}
        <button className="secondary" onClick={onLeave}>
          Leave game
        </button>
      </div>
    </div>
  );
}
