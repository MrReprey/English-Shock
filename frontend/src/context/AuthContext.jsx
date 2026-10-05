import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const authenticatedUser =
          await getAuthenticatedUser();

        if (active) {
          setUser(authenticatedUser);
        }
      } catch (error) {
        console.error(
          "No se pudo recuperar la sesión:",
          error
        );

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function register(formData) {
    const authenticatedUser =
      await registerUser(formData);

    setUser(authenticatedUser);

    return authenticatedUser;
  }

  async function login(credentials) {
    const authenticatedUser =
      await loginUser(credentials);

    setUser(authenticatedUser);

    return authenticatedUser;
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }


  function updateCurrentUser(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateCurrentUser,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return context;
}
