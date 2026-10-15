import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";

import logoDiroc from "../images/title_diroc.png";
import "./css/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="navbar">
      <img
        src={logoDiroc}
        alt="Logo de DIROC"
        className="logo-image-nav"
      />

      <div className="profile">
        <div className="profile-user">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>

        <UserAvatar
          avatarKey={user?.avatar_key}
          name={user?.name}
          size="small"
        />

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