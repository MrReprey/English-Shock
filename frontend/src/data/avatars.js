const avatarImages = import.meta.glob(
  "../images/avatars/avatar*.png",
  {
    eager: true,
    import: "default",
  }
);

export const avatars = Array.from(
  { length: 26 },
  (_, index) => {
    const number = index + 1;

    const avatarKey =
      `avatar_${String(number).padStart(2, "0")}`;

    const imagePath =
      `../images/avatars/avatar${number}.png`;

    return {
      key: avatarKey,
      name: `Avatar ${number}`,
      src: avatarImages[imagePath],
    };
  }
);

export function getAvatar(avatarKey) {
  return (
    avatars.find(
      (avatar) => avatar.key === avatarKey
    ) || avatars[0]
  );
}