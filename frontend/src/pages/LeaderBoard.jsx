import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLeaderboard } from "../services/api";
import "./css/Leaderboard.css";

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const categoryNames = {
  "presente-simple": "Presente simple",
  "pasado-simple": "Pasado simple",
};

function Leaderboard() {
  const { type, category } = useParams();
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        setError("");

        const results = await getLeaderboard(type, category);
        setPositions(results);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [type, category]);

  function formatTime(milliseconds) {
    return `${(milliseconds / 1000).toFixed(2)} s`;
  }

  function getPlayerImage(player) {
    if (!player) return null;

    if (player.avatar_url) {
      return player.avatar_url.startsWith("http")
        ? player.avatar_url
        : `${BACKEND_URL}${player.avatar_url}`;
    }

    if (player.avatar) {
      return `${BACKEND_URL}/storage/${player.avatar}`;
    }

    return null;
  }

  return (
    <main className="leaderboard-page">
      <section className="leaderboard-card">
        <header className="leaderboard-header">
          <span className="leaderboard-label">ENGLISH SHOCK</span>

          <h1>Tabla de posiciones</h1>

          <p>
            {categoryNames[category] || category}
          </p>
        </header>

        {loading && (
          <p className="leaderboard-message">
            Cargando posiciones...
          </p>
        )}

        {error && (
          <p className="leaderboard-message leaderboard-error">
            {error}
          </p>
        )}

        {!loading && !error && positions.length === 0 && (
          <p className="leaderboard-message">
            Todavía no hay resultados para esta categoría.
          </p>
        )}

        {!loading && !error && positions.length > 0 && (
          <div className="leaderboard-table">
            <div className="leaderboard-row leaderboard-titles">
              <span>Posición</span>
              <span>Jugador</span>
              <span>Aciertos</span>
              <span>Tiempo</span>
            </div>

            {positions.map((score, index) => {
              const playerImage = getPlayerImage(score.player);

              return (
                <div className="leaderboard-row" key={score.id}>
                  <span className="position-number">
                    {index + 1}
                  </span>

                  <div className="leaderboard-player">
                    {playerImage ? (
                      <img
                        src={playerImage}
                        alt={`Foto de ${score.player.name}`}
                      />
                    ) : (
                      <div className="leaderboard-avatar">
                        {score.player?.name?.charAt(0).toUpperCase() || "J"}
                      </div>
                    )}

                    <span>{score.player?.name || "Jugador"}</span>
                  </div>

                  <span>
                    {score.correct_answers}/{score.total_questions}
                  </span>

                  <span>
                    {formatTime(score.completion_time_ms)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button
          className="leaderboard-back-button"
          onClick={() => navigate("/")}
        >
          Volver al inicio
        </button>
      </section>
    </main>
  );
}

export default Leaderboard;