import {
  API_URL,
  BACKEND_URL,
} from "./api";

const TOKEN_KEY = "english_shock_token";

function normalizeUser(user) {
  if (
    user?.avatar_url &&
    !user.avatar_url.startsWith("http")
  ) {
    return {
      ...user,
      avatar_url:
        `${BACKEND_URL}${user.avatar_url}`,
    };
  }

  return user;
}

function getErrorMessage(data, fallback) {
  if (data?.errors) {
    const firstError = Object.values(data.errors)[0]?.[0];

    if (firstError) {
      return firstError;
    }
  }

  return data?.message || fallback;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function registerUser(formData) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "No se pudo registrar el usuario.")
    );
  }

  saveToken(data.token);

  return normalizeUser(data.user);
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "No se pudo iniciar sesión.")
    );
  }

  saveToken(data.token);

  return normalizeUser(data.user);
}

export async function getAuthenticatedUser() {
  const token = getToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/user`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    removeToken();
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "No se pudo recuperar la sesión.")
    );
  }

  return normalizeUser(data.user);
}

export async function logoutUser() {
  const token = getToken();

  try {
    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } finally {
    removeToken();
  }
}