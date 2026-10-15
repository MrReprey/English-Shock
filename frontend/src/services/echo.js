import Echo from "laravel-echo";
import Pusher from "pusher-js";

import { API_URL } from "./api";
import { getToken } from "./auth";

window.Pusher = Pusher;

let echoInstance = null;

export function getEcho() {
  const token = getToken();

  if (!token) {
    return null;
  }

  if (!echoInstance) {
    const isSecure =
      window.location.protocol === "https:";

    const port = window.location.port
      ? Number(window.location.port)
      : isSecure
        ? 443
        : 80;

    echoInstance = new Echo({
      broadcaster: "reverb",

      key:
        import.meta.env.VITE_REVERB_APP_KEY ||
        "diroc-local-key",

      /*
       * Reverb utilizará el mismo dominio
       * desde el cual se abrió DIROC.
       */
      wsHost: window.location.hostname,

      wsPort: port,
      wssPort: port,

      forceTLS: isSecure,

      enabledTransports: [
        "ws",
        "wss",
      ],

      authEndpoint:
        `${API_URL}/broadcasting/auth`,

      auth: {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}