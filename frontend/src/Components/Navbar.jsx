
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "./css/Navbar.css";


import logoDiroc from "../images/title_diroc.png";

function Navbar({
  image,
  setImage,
  setImageFile,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayedImage =
  image || user?.avatar_url;

  function selectImage(event) {
    const file = event.target.files[0];

    if (file) {
      const temporaryUrl =
        URL.createObjectURL(file);

      setImage(temporaryUrl);
      setImageFile(file);
    }
  }

  return (
    <header className="navbar">
      <img
        src={logoDiroc}
        alt="Logo de DIROC"
        className="logo-image"
      />

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
      </div>
    </header>
  );
}

export default Navbar;