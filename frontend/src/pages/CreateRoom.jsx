import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createMultiplayerRoom,
} from "../services/api";

import Navbar from "../Components/Navbar";

import "./css/RoomForm.css";

function CreateRoom() {
  const navigate = useNavigate();

  const [playerImage, setPlayerImage] =
    useState(null);

  const [, setPlayerImageFile] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    maxPlayers: 6,
    lives: 3,
    isPrivate: true,
    });

  const [createdRoom, setCreatedRoom] =
  useState(null);

    const [creating, setCreating] =
    useState(false);

    const [error, setError] =
    useState("");

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
        setCreating(true);
        setError("");
        setCreatedRoom(null);

        const room =
        await createMultiplayerRoom(form);

        navigate(
        `/multiplayer/sala/${room.code}`,
        {
            state: { room },
        }
        );
    } catch (requestError) {
        setError(requestError.message);
    } finally {
        setCreating(false);
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

        <section className="room-form-card">
          <header className="room-form-header">
            <span>NUEVA PARTIDA</span>
            <h1>Crear una sala</h1>

            <p>
              Configura las reglas de la partida.
              Las combinaciones de letras se
              generarán automáticamente.
            </p>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="room-field">
              <label htmlFor="name">
                Nombre de la sala
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Ejemplo: Sala de amigos"
                value={form.name}
                onChange={handleChange}
                maxLength={50}
                required
              />
            </div>

            <div className="room-settings-grid">
                <div className="room-setting-card">
                    <span className="room-setting-label">
                    MÁXIMO DE JUGADORES
                    </span>

                    <p>
                    Selecciona cuántas personas podrán
                    entrar en la sala.
                    </p>

                    <div className="room-choice-group">
                    {[2, 4, 6, 8, 10].map(
                        (numberOfPlayers) => (
                        <button
                            key={numberOfPlayers}
                            type="button"
                            className={`room-choice-button ${
                            form.maxPlayers ===
                            numberOfPlayers
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                            setForm((currentForm) => ({
                                ...currentForm,
                                maxPlayers:
                                numberOfPlayers,
                            }))
                            }
                        >
                            {numberOfPlayers}
                        </button>
                        )
                    )}
                    </div>
                </div>

                <div className="room-setting-card">
                    <span className="room-setting-label">
                    VIDAS POR JUGADOR
                    </span>

                    <p>
                    Cada error o explosión hará perder
                    una vida.
                    </p>

                    <div className="room-choice-group">
                    {[1, 2, 3, 4, 5].map(
                        (numberOfLives) => (
                        <button
                            key={numberOfLives}
                            type="button"
                            className={`room-choice-button ${
                            form.lives === numberOfLives
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                            setForm((currentForm) => ({
                                ...currentForm,
                                lives: numberOfLives,
                            }))
                            }
                        >
                            {numberOfLives}
                        </button>
                        )
                    )}
                    </div>
                </div>
                </div>

                <div className="room-random-time">
                <div className="room-time-icon">
                    ⏱
                </div>

                <div>
                    <strong>
                    Tiempo sorpresa
                    </strong>

                    <p>
                    Cada turno tendrá una duración
                    aleatoria de entre 5 y 10 segundos.
                    Nadie sabrá exactamente cuándo
                    explotará la bomba.
                    </p>
                </div>

                <span className="room-time-range">
                    5–10 s
                </span>

            </div>
            <label className="room-private-option">
              <input
                name="isPrivate"
                type="checkbox"
                checked={form.isPrivate}
                onChange={handleChange}
              />

              <span>
                <strong>Sala privada</strong>
                Solo podrán ingresar los jugadores
                que conozcan el código.
              </span>
            </label>

            {error && (
            <p className="room-form-error">
                {error}
            </p>
            )}


            <button
            type="submit"
            className="room-submit-button"
            disabled={creating}
            >
            {creating
                ? "Creando sala..."
                : "Crear sala"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default CreateRoom;