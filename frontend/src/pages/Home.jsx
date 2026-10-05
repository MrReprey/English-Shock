import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Navbar from "../Components/Navbar";
import LearningOption from "../Components/LearningOption";
import { createPlayer } from "../services/api";

import "./css/Home.css";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [openOption, setOpenOption] =
    useState(null);

  const [playerImage, setPlayerImage] =
    useState(null);

  const [playerImageFile, setPlayerImageFile] =
    useState(null);

  const [isStarting, setIsStarting] =
    useState(false);

  const [apiError, setApiError] =
    useState("");

  function toggleOption(option) {
    setOpenOption((currentOption) =>
      currentOption === option ? null : option
    );
  }

  async function startGame(type, category) {
    try {
      setIsStarting(true);
      setApiError("");

      const player = await createPlayer(
        user.name,
        playerImageFile
      );

      navigate(`/juego/${type}/${category}`, {
        state: {
          playerId: player.id,
          playerName: player.name,

          playerImage:
            player.avatar_url || playerImage,
        },
      });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div className="home-page">
      <Navbar
        image={playerImage}
        setImage={setPlayerImage}
        setImageFile={setPlayerImageFile}
      />

      <main className="home-content">
        <section className="introduction">
          <span className="small-title">
            APRENDE JUGANDO
          </span>

          <h1>
            ¿Qué quieres aprender{" "}
            <span>hoy?</span>
          </h1>

          <p>
            Elige una categoría para comenzar
            a practicar inglés.
          </p>
        </section>

        <section className="learning-options">
          <LearningOption
            icon="⚡"
            title="Verbos"
            description="Aprende verbos regulares e irregulares."
            isOpen={openOption === "verbos"}
            onToggle={() =>
              toggleOption("verbos")
            }
            onCategorySelect={(category) =>
              startGame("verbos", category)
            }
            categories={[
              {
                id: "presente-simple",
                label: "Presente simple",
              },
              {
                id: "pasado-simple",
                label: "Pasado simple",
              },
            ]}
          />

          <LearningOption
            icon="📚"
            title="Vocabulario"
            description="Descubre nuevas palabras y significados."
            isOpen={
              openOption === "vocabulario"
            }
            onToggle={() =>
              toggleOption("vocabulario")
            }
            onCategorySelect={(category) =>
              startGame(
                "vocabulario",
                category
              )
            }
            categories={[
              {
                id: "animales",
                label: "Animales",
              },
              {
                id: "frutas-verduras",
                label: "Frutas y verduras",
              },
            ]}
          />

          <LearningOption
            icon="💬"
            title="Oraciones"
            description="Ordena palabras y construye oraciones en inglés."
            isOpen={
              openOption === "oraciones"
            }
            onToggle={() =>
              toggleOption("oraciones")
            }
            onCategorySelect={(category) =>
              startGame(
                "oraciones",
                category
              )
            }
            categories={[
              {
                id: "presente-simple",
                label: "Presente simple",
              },
              {
                id: "pasado-simple",
                label: "Pasado simple",
              },
              {
                id: "presente-continuo",
                label: "Presente continuo",
              },
            ]}
          />

          {isStarting && (
            <p className="starting-message">
              Preparando la partida...
            </p>
          )}

          {apiError && (
            <p className="api-error-message">
              {apiError}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;