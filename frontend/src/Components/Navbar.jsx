import "./css/Navbar.css";

function Navbar({
  name,
  setName,
  image,
  setImage,
  setImageFile,
}) 
 {
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
      <h2 className="logo">
        English <span>Shock</span>
      </h2>

      <div className="profile">
        <input
          type="text"
          placeholder="Escribe tu nombre"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
        />

        <label className="profile-image">
          {image ? (
            <img
              src={image}
              alt="Perfil del jugador"
            />
          ) : (
            <span>+</span>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={selectImage}
            hidden
          />
        </label>
      </div>
    </header>
  );
}

export default Navbar;