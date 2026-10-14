export const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export const API_URL = `${BACKEND_URL}/api`;

const TOKEN_KEY = "english_shock_token";

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export async function createPlayer(
  playerName,
  avatarFile
) {
  const formData = new FormData();

  formData.append(
    "name",
    playerName.trim() || "Jugador"
  );

  if (avatarFile) {
    formData.append("avatar", avatarFile);
  }

  const response = await fetch(
    `${API_URL}/players`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },

      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "No se pudo registrar al jugador"
    );
  }

  if (data.player.avatar_url) {
    data.player.avatar_url =
      `${BACKEND_URL}${data.player.avatar_url}`;
  }

  return data.player;
}

export async function saveScore(gameResult) {
  const response = await fetch(
    `${API_URL}/scores`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },

      body: JSON.stringify(gameResult),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "No se pudo guardar el resultado"
    );
  }

  return data.score;
}

export async function getLeaderboard(
  gameType,
  category
) {
  const params = new URLSearchParams();

  if (gameType) {
    params.append("type", gameType);
  }

  if (category) {
    params.append("category", category);
  }

  const response = await fetch(
    `${API_URL}/leaderboard?${params.toString()}`,
    {
      cache: "no-store",

      headers: {
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "No se pudo cargar la tabla de posiciones"
    );
  }

  return data.leaderboard ?? data;
}

export async function getProfile() {
  const response = await fetch(
    `${API_URL}/profile`,
    {
      cache: "no-store",

      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "No se pudo cargar el perfil"
    );
  }

  if (data.player?.avatar_url) {
    data.player.avatar_url =
      `${BACKEND_URL}${data.player.avatar_url}`;
  }

  return data;
}


export async function updateProfile({
  name,
  email,
  avatarKey,
}) {
  const formData = new FormData();

  formData.append("name", name.trim());
  formData.append("email", email.trim());
  formData.append("avatar_key", avatarKey);

  const response = await fetch(
    `${API_URL}/profile`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },

      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const validationError =
      data.errors &&
      Object.values(data.errors)[0]?.[0];

    throw new Error(
      validationError ||
        data.message ||
        "No se pudo actualizar el perfil"
    );
  }

  return data;
}


export async function createMultiplayerRoom(
  roomSettings
) {
  const response = await fetch(
    `${API_URL}/multiplayer/rooms`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },

      body: JSON.stringify({
        name: roomSettings.name.trim(),

        max_players:
          Number(roomSettings.maxPlayers),

        initial_lives:
          Number(roomSettings.lives),

        is_private:
          Boolean(roomSettings.isPrivate),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const firstValidationError =
      data.errors
        ? Object.values(data.errors)[0]?.[0]
        : null;

    throw new Error(
      firstValidationError ||
        data.message ||
        "No se pudo crear la sala."
    );
  }

  return data.room;
}

export async function getMultiplayerRoom(
  roomCode
) {
  const code = roomCode
    .trim()
    .toUpperCase();

  const response = await fetch(
    `${API_URL}/multiplayer/rooms/${encodeURIComponent(code)}`,
    {
      cache: "no-store",

      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "No se pudo cargar la sala."
    );
  }

  return data.room;
}

export async function joinMultiplayerRoom(
  roomCode
) {
  const code = roomCode
    .trim()
    .toUpperCase();

  const response = await fetch(
    `${API_URL}/multiplayer/rooms/${encodeURIComponent(code)}/join`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const firstValidationError =
      data.errors
        ? Object.values(data.errors)[0]?.[0]
        : null;

    throw new Error(
      firstValidationError ||
        data.message ||
        "No se pudo ingresar a la sala."
    );
  }

  return data.room;
}

export async function startMultiplayerGame(
  roomCode
) {
  const normalizedCode =
    roomCode.trim().toUpperCase();

  const response = await fetch(
    `${API_URL}/multiplayer/rooms/${encodeURIComponent(
      normalizedCode
    )}/start`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const validationMessage =
      data.errors
        ? Object.values(data.errors)[0]?.[0]
        : null;

    throw new Error(
      validationMessage ||
        data.message ||
        "No se pudo iniciar la partida."
    );
  }

  return data.room;
}

export async function submitMultiplayerWord(
  roomCode,
  word
) {
  const response = await fetch(
    `${API_URL}/multiplayer/rooms/${
      encodeURIComponent(roomCode)
    }/words`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },

      body: JSON.stringify({
        word,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const validationError =
      data.errors &&
      Object.values(data.errors)[0]?.[0];

    throw new Error(
      validationError ||
        data.message ||
        "No se pudo validar la palabra."
    );
  }

  return data;
}

export async function processMultiplayerTimeout(
  code
) {
  const response = await fetch(
    `${API_URL}/multiplayer/rooms/${code}/timeout`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const validationMessage =
      data.errors
        ? Object.values(data.errors)[0]?.[0]
        : null;

    throw new Error(
      validationMessage ||
        data.message ||
        "No se pudo procesar el tiempo agotado."
    );
  }

  return data;
}