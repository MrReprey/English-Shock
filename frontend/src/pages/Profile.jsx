import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AvatarSelector from "../Components/AvatarSelector";
import UserAvatar from "../Components/UserAvatar";

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
  const {
    updateCurrentUser,
    logout,
  } = useAuth();

  const [profile, setProfile] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    avatarKey: "avatar_01",
  });


  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [loggingOut, setLoggingOut] =
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
          avatarKey:
            profileData.user.avatar_key ||
            "avatar_01",
        });

        
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


  function cancelEditing() {
    setEditing(false);
    setSaveError("");

    setForm({
      name: profile.user.name,
      email: profile.user.email,
      avatarKey:
        profile.user.avatar_key ||
        "avatar_01",
    });
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
        avatarKey: form.avatarKey,
      });

      setProfile((currentProfile) => ({
        ...currentProfile,
        user: updatedProfile.user,
        player: updatedProfile.player,
      }));

      setForm({
        name: updatedProfile.user.name,
        email: updatedProfile.user.email,
        avatarKey:
          updatedProfile.user.avatar_key,
      });

    
      setEditing(false);

      updateCurrentUser(updatedProfile.user);

      setSuccessMessage(
        updatedProfile.message
      );
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await logout();

      navigate("/login", {
        replace: true,
      });
    } finally {
      setLoggingOut(false);
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
        <div className="profile-top-actions">
          <button
            type="button"
            className="profile-back-button"
            onClick={() => navigate("/")}
          >
            ← Volver al inicio
          </button>

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut
              ? "Cerrando sesión..."
              : "Cerrar sesión"}
          </button>
        </div>

        <header className="profile-header">
          <UserAvatar
            avatarKey={user.avatar_key}
            name={user.name}
            size="large"
          />

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

              <div className="profile-edit-field">
                <AvatarSelector
                  value={form.avatarKey}
                  onChange={(avatarKey) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      avatarKey,
                    }))
                  }
                />
              </div>

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