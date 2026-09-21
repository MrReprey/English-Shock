import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import LearningOption from "../Components/LearningOption";
import Leaderboard from "./LeaderBoard";
import { createPlayer } from "../services/api";
import "./css/Home.css";

function Home() {
  const [openOption, setOpenOption] = useState(null);
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [playerImage, setPlayerImage] = useState(null);
  
  /*Funciones de la API */
  const [playerImageFile, setPlayerImageFile] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [apiError, setApiError] = useState("");

  function toggleOption(option) {
    if (openOption === option) {
      setOpenOption(null);
    } else {
      setOpenOption(option);
    }
  }
  async function startVerbGame(category) {
    try {
      setIsStarting(true);
      setApiError("");

      const player = await createPlayer(
        playerName,
        playerImageFile
      );

      navigate(`/juego/verbos/${category}`, {
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
  async function startVocabGame(category) {
    try {
      setIsStarting(true);
      setApiError("");

      const player = await createPlayer(
        playerName,
        playerImageFile
      );

      navigate(`/juego/vocabulario/${category}`, {
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
        name={playerName}
        setName={setPlayerName}
        image={playerImage}
        setImage={setPlayerImage}
        setImageFile={setPlayerImageFile}
      />

      <main className="home-content">
        <section className="introduction">
          <span className="small-title">APRENDE JUGANDO</span>

          <h1>
            ¿Qué quieres aprender <span>hoy?</span>
          </h1>

          <p>
            Elige una categoría para comenzar a practicar inglés.
          </p>
        </section>

        <section className="learning-options">
          <LearningOption
            icon="⚡"
            title="Verbos"
            description="Aprende verbos regulares e irregulares."
            isOpen={openOption === "verbos"}
            onToggle={() => toggleOption("verbos")}
            onCategorySelect={startVerbGame}
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
            isOpen={openOption === "vocabulario"}
            onToggle={() => toggleOption("vocabulario")}
            onCategorySelect={startVocabGame}
            categories={[
              {
                id: "animales",
                label: "Animales",
              },
              {
                id: "frutas-verduras",
                label: "Frutas y Verduras",
              },
            ]}
          />

          <LearningOption
            icon="💬"
            title="Oraciones"
            description="Practica cómo construir oraciones."
            isOpen={openOption === "oraciones"}
            onToggle={() => toggleOption("oraciones")}
            categories={[
              "Saludos y presentaciones",
              "Rutina diaria",
              "Preguntas",
              "Viajes",
              "Conversación",
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