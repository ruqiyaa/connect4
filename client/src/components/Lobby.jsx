import { useState } from "react";

export default function Lobby({ onCreate, onJoin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleJoin(event) {
    event.preventDefault();
    setError("");
    onJoin(code, setError);
  }

  return (
    <div className="panel">
      <button onClick={onCreate}>Create a game</button>
      <p className="muted">or join a friend's game</p>

      <form onSubmit={handleJoin}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CODE"
          maxLength={4}
          required
        />
        <button type="submit">Join</button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
