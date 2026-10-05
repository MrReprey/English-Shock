import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getProfile,
  updateProfile,
} from "../services/api";

import "./css/Profile.css";

const categoryNames = {
  "presente-simple": "Presente simple",
  "pasado-simple": "Pasado simple",
  "presente-continuo": "Presente continuo",
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
  const { updateCurrentUser } = useAuth();

  const [profile, setProfile] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [avatarFile, setAvatarFile] =
    useState(null);

  const [avatarPreview, setAvatarPreview] =
    useState("");

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saveError, setSaveError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const profileData =
          await getProfile();

        setProfile(profileData);

        setForm({
          name: profileData.user.name,
          email: profileData.user.email,
        });

        setAvatarPreview(
          profileData.player?.avatar_url || ""
        );
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleAvatarChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(
      URL.createObjectURL(file)
    );
  }

  function cancelEditing() {
    setEditing(false);
    setAvatarFile(null);
    setSaveError("");

    setForm({
      name: profile.user.name,
      email: profile.user.email,
    });

    setAvatarPreview(
      profile.player?.avatar_url || ""
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setSaveError("");
      setSuccessMessage("");

      const updatedProfile =
        await updateProfile({
          name: form.name,
          email: form.email,
          avatarFile,
        });

      setProfile((currentProfile) => ({
        ...currentProfile,
        user: updatedProfile.user,
        player: updatedProfile.player,
      }));

      setForm({
        name: updatedProfile.user.name,
        email: updatedProfile.user.email,
      });

      setAvatarPreview(
        updatedProfile.player?.avatar_url || ""
      );

      setAvatarFile(null);
      setEditing(false);

      updateCurrentUser({
        ...updatedProfile.user,

        avatar_url:
          updatedProfile.player?.avatar_url ||
          null,
      });

      setSuccessMessage(
        updatedProfile.message
      );
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

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
          <p className="profile-error">
            {error}
          </p>

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

  const { user, statistics } = profile;
  const bestScores =
    statistics.best_scores;

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
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={`Avatar de ${user.name}`}
              />
            ) : (
              <span>
                {user.name
                  .charAt(0)
                  .toUpperCase()}
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

          {!editing && (
            <button
              type="button"
              className="profile-edit-button"
              onClick={() => {
                setEditing(true);
                setSaveError("");
                setSuccessMessage("");
              }}
            >
              Editar perfil
            </button>
          )}
        </header>

        {successMessage && (
          <p className="profile-success">
            {successMessage}
          </p>
        )}

        {editing && (
          <form
            className="profile-edit-form"
            onSubmit={handleSubmit}
          >
            <h2>Editar mis datos</h2>

            <div className="profile-edit-field">
              <label htmlFor="profile-name">
                Nombre
              </label>

              <input
                id="profile-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                maxLength={80}
                required
              />
            </div>

            <div className="profile-edit-field">
              <label htmlFor="profile-email">
                Correo electrónico
              </label>

              <input
                id="profile-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-edit-field">
              <label htmlFor="profile-avatar">
                Imagen de perfil
              </label>

              <input
                id="profile-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
              />

              <small>
                Formatos permitidos: JPG, PNG o
                WEBP. Máximo 2 MB.
              </small>
            </div>

            {saveError && (
              <p className="profile-error">
                {saveError}
              </p>
            )}

            <div className="profile-edit-actions">
              <button
                type="button"
                className="profile-cancel-button"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="profile-save-button"
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}

        <section className="profile-summary">
          <div className="profile-stat">
            <strong>
              {statistics.total_games}
            </strong>

            <span>Partidas jugadas</span>
          </div>

          <div className="profile-stat">
            <strong>
              {bestScores.length}
            </strong>

            <span>
              Categorías practicadas
            </span>
          </div>
        </section>

        <section className="profile-results">
          <h2>Mis mejores resultados</h2>

          {bestScores.length === 0 ? (
            <p className="profile-empty">
              Todavía no tienes resultados.
              Juega una partida para comenzar.
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
                    {gameTypeNames[
                      score.game_type
                    ] || score.game_type}
                  </span>

                  <h3>
                    {categoryNames[
                      score.category
                    ] || score.category}
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
                        {
                          score.completion_time_seconds
                        }{" "}
                        s
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