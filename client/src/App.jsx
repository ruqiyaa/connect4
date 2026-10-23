import { useEffect, useState } from "react";
import { socket } from "./socket";
import Lobby from "./components/Lobby";
import Game from "./components/Game";

export default function App() {
  const [connected, setConnected] = useState(socket.connected);
  const [game, setGame] = useState(null);
  const [myColor, setMyColor] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
      setGame(null);
      setMyColor(null);
    }
    function onState(state) {
      setGame(state);
    }
    function onNotice(msg) {
      setNotice(msg);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("state", onState);
    socket.on("notice", onNotice);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("state", onState);
      socket.off("notice", onNotice);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2000);
    return () => clearTimeout(timer);
  }, [notice]);

  function createRoom() {
    socket.emit("create_room", (res) => {
      if (res.ok) setMyColor(res.color);
    });
  }

  function joinRoom(code, onError) {
    socket.emit("join_room", code, (res) => {
      if (res.ok) setMyColor(res.color);
      else onError(res.error);
    });
  }

  function leave() {
    socket.emit("leave_room");
    setGame(null);
    setMyColor(null);
  }

  const inGame = Boolean(game && myColor);

  return (
    <>
      {!inGame && <div className="lobby-backdrop pattern" aria-hidden="true" />}

      <main className="app">
        <div className="title-card">
          <h1>Connect 4</h1>
          <p className="tagline">Drop. Connect. Win.</p>
        </div>

        {!connected && <p className="notice">Connecting to server…</p>}

        {connected && game && myColor ? (
          <Game game={game} myColor={myColor} notice={notice} onLeave={leave} />
        ) : (
          connected && <Lobby onCreate={createRoom} onJoin={joinRoom} />
        )}
      </main>
    </>
  );
}
