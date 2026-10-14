import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../Components/Navbar";

import singlePlayerImage from "../images/SinglePlayer.png";
import multiplayerImage from "../images/MultiPlayer.png";

import "./css/Home.css";

function Home() {
  const navigate = useNavigate();

  const [playerImage, setPlayerImage] =
    useState(null);

  const [, setPlayerImageFile] =
    useState(null);

  return (
    <div className="home-page">
      <Navbar
        image={playerImage}
        setImage={setPlayerImage}
        setImageFile={setPlayerImageFile}
      />

      <main className="mode-selection">
        <header className="mode-header">
          <span className="mode-small-title">
            ELIGE TU EXPERIENCIA
          </span>

          <h1>
            ¿Cómo quieres
            <span> jugar?</span>
          </h1>

          <p>
            Elige un modo de juego para comenzar
            tu experiencia en DIROC.
          </p>
        </header>

        <section className="mode-options">
          <button
            type="button"
            className="mode-card"
            onClick={() =>
              navigate("/SinglePlayer")
            }
          >
            <div className="mode-image-container">
              <img
                src={singlePlayerImage}
                alt="Modo Single Player"
                className="mode-image"
              />

              <span className="mode-badge">
                INDIVIDUAL
              </span>
            </div>

            <div className="mode-information">
              <div>
                <h2>Single Player</h2>

                <p>
                  Practica a tu ritmo, supera tus
                  puntuaciones y mejora tu inglés.
                </p>
              </div>

              <span className="mode-arrow">
                →
              </span>
            </div>
          </button>

          <button
            type="button"
            className="mode-card"
            onClick={() =>
              navigate("/multiplayer")
            }
          >
            <div className="mode-image-container">
              <img
                src={multiplayerImage}
                alt="Modo Multiplayer"
                className="mode-image"
              />

              <span className="mode-badge">
                EN LÍNEA
              </span>
            </div>

            <div className="mode-information">
              <div>
                <h2>Multiplayer</h2>

                <p>
                  Crea o únete a una sala y compite
                  con otros jugadores.
                </p>
              </div>

              <span className="mode-arrow">
                →
              </span>
            </div>
          </button>
        </section>
      </main>
    </div>
  );
}

export default Home;