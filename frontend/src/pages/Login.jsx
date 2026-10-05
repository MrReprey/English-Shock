import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./css/auth.css";

function Login() {
  const navigate = useNavigate();

  const {
    login,
    loading,
    isAuthenticated,
  } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
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

    try {
      setSubmitting(true);
      setError("");

      await login(form);

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
        Inicia sesión para comenzar
      </p>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={submitting}
        >
          {submitting
            ? "Ingresando..."
            : "Iniciar sesión"}
        </button>
      </form>

      <p className="auth-footer">
        ¿Todavía no tienes una cuenta?{" "}
        <Link
          to="/registro"
          className="auth-link"
        >
          Regístrate
        </Link>
      </p>
    </section>
  </main>
);
}

export default Login;