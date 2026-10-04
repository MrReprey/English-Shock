import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "./css/Auth.css";

function Register() {
  const navigate = useNavigate();

  const {
    register,
    loading,
    isAuthenticated,
  } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.password_confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await register(form);

      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p className="auth-subtitle">
          Cargando sesión...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="auth-brand">
          English Shock
        </h1>

        <p className="auth-subtitle">
          Crea una cuenta para jugar
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label
              htmlFor="name"
              className="auth-label"
            >
              Nombre
            </label>

            <input
              id="name"
              name="name"
              type="text"
              className="auth-input"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="auth-field">
            <label
              htmlFor="email"
              className="auth-label"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className="auth-input"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label
              htmlFor="password"
              className="auth-label"
            >
              Contraseña
            </label>

            <input
              id="password"
              name="password"
              type="password"
              className="auth-input"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="8"
              required
            />
          </div>

          <div className="auth-field">
            <label
              htmlFor="password_confirmation"
              className="auth-label"
            >
              Confirmar contraseña
            </label>

            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              className="auth-input"
              value={form.password_confirmation}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="8"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={submitting}
          >
            {submitting
              ? "Creando cuenta..."
              : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="auth-link"
          >
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Register;