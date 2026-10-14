import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../Components/Navbar";

import {
  joinMultiplayerRoom,
} from "../services/api";

import "./css/RoomForm.css";

function JoinRoom() {
  const navigate = useNavigate();

  const [playerImage, setPlayerImage] =
    useState(null);

  const [, setPlayerImageFile] =
    useState(null);

  const [roomCode, setRoomCode] =
    useState("");

  const [joining, setJoining] =
    useState(false);

  const [error, setError] =
    useState("");

  function handleCodeChange(event) {
    const cleanCode = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    setRoomCode(cleanCode);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (roomCode.length !== 6) {
      return;
    }

    try {
      setJoining(true);
      setError("");

      const room =
        await joinMultiplayerRoom(roomCode);

      const destination =
        room.status === "waiting"
          ? `/multiplayer/sala/${room.code}`
          : `/multiplayer/juego/${room.code}`;

      navigate(destination, {
        state: { room },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="room-page">
      <Navbar
        image={playerImage}
        setImage={setPlayerImage}
        setImageFile={setPlayerImageFile}
      />

      <main className="room-content">
        <button
          type="button"
          className="room-back-button"
          onClick={() =>
            navigate("/multiplayer")
          }
        >
          ← Volver a Multiplayer
        </button>

        <section className="room-form-card join-room-card">
          <header className="room-form-header join-room-header">
            <span>TENGO UN CÓDIGO</span>

            <h1>Unirse a una sala</h1>

            <p>
              Introduce el código de seis caracteres
              que te compartió el creador.
            </p>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="join-code-field">
              <label htmlFor="roomCode">
                Código de la sala
              </label>

              <input
                id="roomCode"
                type="text"
                value={roomCode}
                onChange={handleCodeChange}
                placeholder="A7K9P2"
                autoComplete="off"
                spellCheck="false"
                autoFocus
              />

              <span>
                {roomCode.length}/6 caracteres
              </span>
            </div>

            <div className="join-room-information">
              <span>i</span>

              <p>
                El código puede contener letras
                mayúsculas y números.
              </p>
            </div>

            {error && (
              <p className="room-form-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="room-submit-button"
              disabled={
                roomCode.length !== 6 ||
                joining
              }
            >
              {joining
                ? "Ingresando..."
                : "Unirse a la sala"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default JoinRoom;
