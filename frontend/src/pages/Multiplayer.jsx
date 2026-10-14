import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../Components/Navbar";

import "./css/Multiplayer.css";

function Multiplayer() {
  const navigate = useNavigate();

  const [playerImage, setPlayerImage] =
    useState(null);

  const [, setPlayerImageFile] =
    useState(null);

  return (
    <div className="multiplayer-page">
      <Navbar
        image={playerImage}
        setImage={setPlayerImage}
        setImageFile={setPlayerImageFile}
      />

      <main className="multiplayer-content">
        <button
          type="button"
          className="multiplayer-back"
          onClick={() => navigate("/")}
        >
          ← Volver a los modos de juego
        </button>

        <header className="multiplayer-header">
          <span>JUEGO EN LÍNEA</span>

          <h1>Modo Multiplayer</h1>

          <p>
            Crea una sala para invitar a tus amigos
            o ingresa el código de una sala existente.
          </p>
        </header>

        <section className="multiplayer-options">
          <button
            type="button"
            className="multiplayer-option"
            onClick={() =>
              navigate("/multiplayer/crear")
            }
          >
            <div className="multiplayer-option-icon">
              +
            </div>

            <div>
              <span className="multiplayer-option-label">
                NUEVA PARTIDA
              </span>

              <h2>Crear sala</h2>

              <p>
                Configura la cantidad de jugadores,
                el tiempo por turno y las vidas.
              </p>
            </div>

            <span className="multiplayer-arrow">
              →
            </span>
          </button>

          <button
            type="button"
            className="multiplayer-option"
            onClick={() =>
              navigate("/multiplayer/unirse")
            }
          >
            <div className="multiplayer-option-icon">
              #
            </div>

            <div>
              <span className="multiplayer-option-label">
                TENGO UN CÓDIGO
              </span>

              <h2>Unirse a una sala</h2>

              <p>
                Escribe el código compartido por
                el creador de la partida.
              </p>
            </div>

            <span className="multiplayer-arrow">
              →
            </span>
          </button>
        </section>
      </main>
    </div>
  );
}

export default Multiplayer;