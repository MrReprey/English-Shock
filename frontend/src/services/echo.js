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
    const scheme =
      import.meta.env.VITE_REVERB_SCHEME ||
      "http";

    const port = Number(
      import.meta.env.VITE_REVERB_PORT ||
      8080
    );

    echoInstance = new Echo({
      broadcaster: "reverb",

      key:
        import.meta.env.VITE_REVERB_APP_KEY ||
        "diroc-local-key",

      wsHost:
        import.meta.env.VITE_REVERB_HOST ||
        window.location.hostname,

      wsPort: port,
      wssPort: port,

      forceTLS: scheme === "https",

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