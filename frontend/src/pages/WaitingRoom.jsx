import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar from "../Components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getMultiplayerRoom,
} from "../services/api";
import { getEcho } from "../services/echo";

import "./css/WaitingRoom.css";

function WaitingRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const [playerImage, setPlayerImage] =
    useState(null);

  const [, setPlayerImageFile] =
    useState(null);

  const [room, setRoom] = useState(
    location.state?.room || null
  );

  const [loading, setLoading] = useState(
    !location.state?.room
  );

  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  const [
    connectedUserIds,
    setConnectedUserIds,
  ] = useState([]);

  const [
    realtimeReady,
    setRealtimeReady,
  ] = useState(false);

  /*
   * Carga inicial de la sala.
   */
  useEffect(() => {
    let active = true;

    async function loadRoom() {
      try {
        setLoading(true);
        setError("");

        const roomData =
          await getMultiplayerRoom(code);

        if (active) {
          setRoom(roomData);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRoom();

    return () => {
      active = false;
    };
  }, [code]);

  /*
   * Conexión en tiempo real con Reverb.
   */
  useEffect(() => {
    const echo = getEcho();

    if (!echo || !code) {
      return undefined;
    }

    let active = true;

    const channelName =
      `multiplayer.room.${code.toUpperCase()}`;

    async function refreshRoom() {
      try {
        const roomData =
          await getMultiplayerRoom(code);

        if (active) {
          setRoom(roomData);
        }
      } catch (requestError) {
        if (active) {
          setNotice(requestError.message);
        }
      }
    }

    const channel = echo.join(channelName);

    channel
      .here((users) => {
        if (!active) {
          return;
        }

        setRealtimeReady(true);

        setConnectedUserIds(
          users.map((connectedUser) =>
            Number(connectedUser.id)
          )
        );

        refreshRoom();
      })
      .joining((joinedUser) => {
        if (!active) {
          return;
        }

        setConnectedUserIds(
          (currentIds) => [
            ...new Set([
              ...currentIds,
              Number(joinedUser.id),
            ]),
          ]
        );

        refreshRoom();
      })
      .leaving((leavingUser) => {
        if (!active) {
          return;
        }

        setConnectedUserIds(
          (currentIds) =>
            currentIds.filter(
              (userId) =>
                userId !==
                Number(leavingUser.id)
            )
        );
      })
      .error((connectionError) => {
        console.error(
          "Error de conexión con Reverb:",
          connectionError
        );

        if (active) {
          setNotice(
            "No se pudo establecer la conexión en tiempo real."
          );
        }
      });

    return () => {
      active = false;
      echo.leave(channelName);
    };
  }, [code]);

  async function copyRoomCode() {
    try {
      await navigator.clipboard.writeText(
        room.code
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setNotice(
        "No se pudo copiar automáticamente."
      );
    }
  }

  function handleStartGame() {
    setNotice(
      "En el siguiente paso conectaremos el inicio de la partida."
    );
  }

  if (loading && !room) {
    return (
      <main className="waiting-message-page">
        Cargando sala...
      </main>
    );
  }

  if (error && !room) {
    return (
      <main className="waiting-message-page">
        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            navigate("/multiplayer")
          }
        >
          Volver
        </button>
      </main>
    );
  }

  const isHost =
    room.host?.id === user?.id;

  const connectedPlayers =
    realtimeReady
      ? connectedUserIds.length
      : room.players.length;

  return (
    <div className="waiting-page">
      <Navbar
        image={playerImage}
        setImage={setPlayerImage}
        setImageFile={setPlayerImageFile}
      />

      <main className="waiting-content">
        <button
          type="button"
          className="waiting-back-button"
          onClick={() =>
            navigate("/multiplayer")
          }
        >
          ← Salir de la sala
        </button>

        <header className="waiting-header">
          <span>SALA DE ESPERA</span>
          <h1>{room.name}</h1>

          <p>
            Comparte el código y espera a que
            ingresen los demás jugadores.
          </p>
        </header>

        <section className="waiting-grid">
          <article className="waiting-players-card">
            <div className="waiting-card-title">
              <div>
                <span>PARTICIPANTES</span>
                <h2>Jugadores conectados</h2>
              </div>

              <strong>
                {connectedPlayers}/
                {room.max_players}
              </strong>
            </div>

            <div className="waiting-player-list">
              {room.players.map((player) => {
                const isConnected =
                  connectedUserIds.includes(
                    Number(player.user?.id)
                  );

                return (
                  <div
                    className="waiting-player"
                    key={player.id}
                  >
                    <div className="waiting-avatar">
                      {player.user?.name
                        ?.charAt(0)
                        .toUpperCase() || "J"}
                    </div>

                    <div className="waiting-player-name">
                      <strong>
                        {player.user?.name ||
                          "Jugador"}
                      </strong>

                      <span>
                        {player.user?.id ===
                        room.host?.id
                          ? "Creador de la sala"
                          : "Participante"}

                        {realtimeReady && (
                          <>
                            {" · "}
                            {isConnected
                              ? "En línea"
                              : "Desconectado"}
                          </>
                        )}
                      </span>
                    </div>

                    <div className="waiting-lives">
                      {"♥".repeat(
                        player.lives_remaining
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <aside className="waiting-room-card">
            <span className="waiting-room-label">
              CÓDIGO DE LA SALA
            </span>

            <strong className="waiting-room-code">
              {room.code}
            </strong>

            <button
              type="button"
              className="waiting-copy-button"
              onClick={copyRoomCode}
            >
              {copied
                ? "Código copiado"
                : "Copiar código"}
            </button>

            <div className="waiting-rules">
              <div>
                <span>Jugadores</span>
                <strong>
                  Máximo {room.max_players}
                </strong>
              </div>

              <div>
                <span>Vidas</span>
                <strong>
                  {room.initial_lives}
                </strong>
              </div>

              <div>
                <span>Tiempo</span>
                <strong>5–10 s</strong>
              </div>

              <div>
                <span>Privacidad</span>
                <strong>
                  {room.is_private
                    ? "Privada"
                    : "Pública"}
                </strong>
              </div>
            </div>

            {isHost ? (
              <button
                type="button"
                className="waiting-start-button"
                onClick={handleStartGame}
                disabled={
                  room.players.length < 2
                }
              >
                {room.players.length < 2
                  ? "Esperando jugadores..."
                  : "Iniciar partida"}
              </button>
            ) : (
              <p className="waiting-host-message">
                Esperando a que el creador
                inicie la partida...
              </p>
            )}
          </aside>
        </section>

        {notice && (
          <p className="waiting-notice">
            {notice}
          </p>
        )}
      </main>
    </div>
  );
}

export default WaitingRoom;