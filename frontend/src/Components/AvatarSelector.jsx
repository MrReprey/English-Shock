import { avatars } from "../data/avatars";
import UserAvatar from "./UserAvatar";

import "./css/AvatarSelector.css";

function AvatarSelector({
  value,
  onChange,
}) {
  return (
    <fieldset className="avatar-selector">
      <legend>Elige tu avatar</legend>

      <div className="avatar-selector-grid">
        {avatars.map((avatar) => {
          const isSelected =
            avatar.key === value;

          return (
            <button
              key={avatar.key}
              type="button"
              className={
                `avatar-option ${
                  isSelected
                    ? "avatar-option--selected"
                    : ""
                }`
              }
              onClick={() =>
                onChange(avatar.key)
              }
              aria-pressed={isSelected}
              title={avatar.name}
            >
              <UserAvatar
                avatarKey={avatar.key}
                name={avatar.name}
                size="medium"
              />

              <span>{avatar.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default AvatarSelector;