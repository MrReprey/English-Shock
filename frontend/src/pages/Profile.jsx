import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProfile } from "../services/api";

import "./css/Profile.css";

const categoryNames = {
  "presente-simple": "Presente simple",
  "pasado-simple": "Pasado simple",
  animales: "Animales",
  "frutas-verduras": "Frutas y verduras",
};

const gameTypeNames = {
  verbos: "Verbos",
  vocabulario: "Vocabulario",
  oraciones: "Oraciones",
};

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const profileData = await getProfile();
        setProfile(profileData);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="profile-page">
        <p className="profile-message">
          Cargando perfil...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page">
        <section className="profile-card">
          <p className="profile-error">{error}</p>

          <button
            className="profile-back-button"
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </button>
        </section>
      </main>
    );
  }

  const { user, player, statistics } = profile;
  const bestScores = statistics.best_scores;

  return (
    <main className="profile-page">
      <section className="profile-card">
        <button
          className="profile-back-button"
          onClick={() => navigate("/")}
        >
          ← Volver
        </button>

        <header className="profile-header">
          <div className="profile-avatar">
            {player?.avatar_url ? (
              <img
                src={player.avatar_url}
                alt={`Avatar de ${user.name}`}
              />
            ) : (
              <span>
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="profile-identity">
            <span className="profile-label">
              MI PERFIL
            </span>

            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
        </header>

        <section className="profile-summary">
          <div className="profile-stat">
            <strong>{statistics.total_games}</strong>
            <span>Partidas jugadas</span>
          </div>

          <div className="profile-stat">
            <strong>{bestScores.length}</strong>
            <span>Categorías practicadas</span>
          </div>
        </section>

        <section className="profile-results">
          <h2>Mis mejores resultados</h2>

          {bestScores.length === 0 ? (
            <p className="profile-empty">
              Todavía no tienes resultados. Juega una
              partida para comenzar.
            </p>
          ) : (
            <div className="profile-results-grid">
              {bestScores.map((score) => (
                <article
                  className="profile-result"
                  key={
                    `${score.game_type}-${score.category}`
                  }
                >
                  <span className="profile-result-type">
                    {gameTypeNames[score.game_type] ||
                      score.game_type}
                  </span>

                  <h3>
                    {categoryNames[score.category] ||
                      score.category}
                  </h3>

                  <div className="profile-result-data">
                    <div>
                      <strong>
                        {score.correct_answers}/
                        {score.total_questions}
                      </strong>

                      <span>Aciertos</span>
                    </div>

                    <div>
                      <strong>
                        {score.completion_time_seconds} s
                      </strong>

                      <span>Tiempo</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Profile;