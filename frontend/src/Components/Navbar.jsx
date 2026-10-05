import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "./css/Navbar.css";

function Navbar({
  image,
  setImage,
  setImageFile,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayedImage =
  image || user?.avatar_url;

  const [loggingOut, setLoggingOut] =
    useState(false);

  function selectImage(event) {
    const file = event.target.files[0];

    if (file) {
      const temporaryUrl =
        URL.createObjectURL(file);

      setImage(temporaryUrl);
      setImageFile(file);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="navbar">
      <h2 className="logo">
        English <span>Shock</span>
      </h2>

      <div className="profile">
        <div className="profile-user">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>

        <label
          className="profile-image"
          title="Seleccionar imagen"
        >
          {displayedImage ? (
            <img
              src={displayedImage}
              alt="Perfil del jugador"
            />
          ) : (
            <span>
              {user?.name
                ?.charAt(0)
                .toUpperCase() || "+"}
            </span>
          )}
        </label>
        <button
          type="button"
          className="open-profile-button"
          onClick={() => navigate("/perfil")}
        >
          Mi perfil
        </button>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut
            ? "Saliendo..."
            : "Cerrar sesión"}
        </button>
      </div>
    </header>
  );
}

export default Navbar;