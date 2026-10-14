import { getAvatar } from "../data/avatars";
import "./css/UserAvatar.css";

function UserAvatar({
  avatarKey,
  name = "Jugador",
  size = "medium",
  className = "",
}) {
  const avatar = getAvatar(avatarKey);

  return (
    <span
      className={
        `user-avatar user-avatar--${size} ${className}`
      }
      title={avatar.name}
    >
      <img
        src={avatar.src}
        alt={`Avatar de ${name}`}
      />
    </span>
  );
}

export default UserAvatar;