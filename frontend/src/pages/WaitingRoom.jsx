import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import MultiplayerLayout from "../Components/MultiplayerLayout";
import RoomSidebar from "../Components/RoomSidebar";

import { useAuth } from "../context/AuthContext";
import {
  getMultiplayerRoom,
  startMultiplayerGame,
} from "../services/api";
import { getEcho } from "../services/echo";

import "./css/WaitingRoom.css";

function WaitingRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const [room, setRoom] = useState(
    location.state?.room || null
  );

  const [loading, setLoading] = useState(
    !location.state?.room
  );

  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [isStarting, setIsStarting] =
    useState(false);

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

    channel.listen(
      ".multiplayer.game.updated",
      (event) => {
        if (event.action === "game_started") {
          navigate(
            `/multiplayer/juego/${code}`,
            { replace: true }
          );
        }
      }
    );
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
  }, [code, navigate]);

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

  async function handleStartGame() {
    try {
      setIsStarting(true);
      setNotice("");

      await startMultiplayerGame(code);

      navigate(
        `/multiplayer/juego/${code}`,
        { replace: true }
      );
    } catch (requestError) {
      setNotice(requestError.message);
    } finally {
      setIsStarting(false);
    }
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

  

  return (
    <MultiplayerLayout
      sidebar={
        <RoomSidebar
          room={room}
          connectedUserIds={
            connectedUserIds
          }
          realtimeReady={realtimeReady}
        />
      }
    >
      <div className="waiting-main">
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
            Comparte el código con tus amigos.
            Cuando todos estén conectados, el
            creador podrá iniciar la partida.
          </p>
        </header>

        <section className="waiting-lobby-card">
          <div className="waiting-code-section">
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
          </div>

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
              <span>Tiempo por turno</span>
              <strong>5–10 segundos</strong>
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

          <div className="waiting-action-area">
            {isHost ? (
              <button
                type="button"
                className="waiting-start-button"
                onClick={handleStartGame}
                disabled={
                  room.players.length < 2 ||
                  isStarting
                }
              >
                {isStarting
                  ? "Iniciando..."
                  : room.players.length < 2
                    ? "Esperando jugadores..."
                    : "Iniciar partida"}
              </button>
            ) : (
              <p className="waiting-host-message">
                Esperando a que el creador
                inicie la partida...
              </p>
            )}
          </div>
        </section>

        {notice && (
          <p className="waiting-notice">
            {notice}
          </p>
        )}
      </div>
    </MultiplayerLayout>
  );
}

export default WaitingRoom;