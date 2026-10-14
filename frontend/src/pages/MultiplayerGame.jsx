import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getMultiplayerRoom,
  processMultiplayerTimeout,
  submitMultiplayerWord,
  prepareNextMultiplayerGame,
} from "../services/api";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import UserAvatar from "../Components/UserAvatar";

import MultiplayerLayout from "../Components/MultiplayerLayout";
import RoomSidebar from "../Components/RoomSidebar";

import { useAuth } from "../context/AuthContext";

import { getEcho } from "../services/echo";

import "./css/MultiplayerGame.css";

function MultiplayerGame() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] =
  useState(false);

  const [room, setRoom] = useState(null);
  const [word, setWord] = useState("");

  const [liveWord, setLiveWord] =
  useState("");

  const [messages, setMessages] =
  useState([]);

  const channelRef = useRef(null);
  const timeoutProcessedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [secondsRemaining, setSecondsRemaining] =
    useState(0);

  const [
    isPreparingNextGame,
    setIsPreparingNextGame,
  ] = useState(false);

  const loadRoom = useCallback(async () => {
    try {
      const roomData =
        await getMultiplayerRoom(code);

      setRoom(roomData);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    const echo = getEcho();

    if (!echo || !code) {
      return undefined;
    }

    const channelName =
      `multiplayer.room.${code.toUpperCase()}`;

    const channel = echo.join(channelName);
    channelRef.current = channel;

    channel.listen(
    ".multiplayer.game.updated",
    () => {
        setWord("");
        setLiveWord("");
        loadRoom();
    }
    );

    channel.listenForWhisper(
    "typing",
    (typingData) => {
        if (
        Number(typingData.userId) !==
        Number(user?.id)
        ) {
        setLiveWord(
            typingData.word || ""
        );
        }
    }
    );

    channel.listenForWhisper(
      "chat",
      (chatMessage) => {
        if (
          !chatMessage?.id ||
          !chatMessage?.text
        ) {
          return;
        }

        setMessages((currentMessages) => {
          const alreadyExists =
            currentMessages.some(
              (currentMessage) =>
                currentMessage.id ===
                chatMessage.id
            );

          if (alreadyExists) {
            return currentMessages;
          }

          return [
            ...currentMessages,
            chatMessage,
          ].slice(-50);
        });
      }
    );


    return () => {
      echo.leave(channelName);
      channelRef.current = null;
    };
  }, [code, loadRoom, user?.id]);
  useEffect(() => {

    function updateCountdown() {
      if (!room?.turn_ends_at) {
        setSecondsRemaining(0);
        return;
      }

      const endingTime =
        new Date(room.turn_ends_at).getTime();

      const remaining =
        Math.max(
          0,
          Math.ceil(
            (endingTime - Date.now()) / 1000
          )
        );

      setSecondsRemaining(remaining);
    }

    updateCountdown();

    const timer = window.setInterval(
      updateCountdown,
      250
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [room?.turn_ends_at]);

  useEffect(() => {
  /*
   * Permite procesar el nuevo turno cuando
   * cambia su fecha de finalización.
   */
  timeoutProcessedRef.current = false;
}, [room?.turn_ends_at]);

useEffect(() => {
  const turnEndingTime = room?.turn_ends_at
    ? new Date(room.turn_ends_at).getTime()
    : null;

  if (
    room?.status !== "playing" ||
    secondsRemaining !== 0 ||
    !turnEndingTime ||
    Date.now() < turnEndingTime ||
    timeoutProcessedRef.current
  ) {
    return;
  }

  timeoutProcessedRef.current = true;

  async function handleTimeout() {
    try {
      const result =
        await processMultiplayerTimeout(code);

      setRoom(result.room);
      setWord("");
      setLiveWord("");

      if (result.processed) {
        setNotice(result.message);
      }
    } catch (requestError) {
      timeoutProcessedRef.current = false;
      setNotice(requestError.message);
    }
  }

  handleTimeout();
}, [
  code,
  room?.status,
  room?.turn_ends_at,
  secondsRemaining,
]);

  function handleWordChange(event) {
    const nextWord =
        event.target.value.slice(0, 50);

    setWord(nextWord);

    if (!isMyTurn) {
        return;
    }

    channelRef.current?.whisper(
        "typing",
        {
        userId: user.id,
        name: user.name,
        word: nextWord,
        }
    );
    }


  async function handlePrepareNextGame() {
    try {
      setIsPreparingNextGame(true);
      setNotice("");

      const result =
        await prepareNextMultiplayerGame(code);

      setRoom(result.room);

      navigate(
        `/multiplayer/sala/${result.room.code}`,
        {
          replace: true,
          state: {
            room: result.room,
          },
        }
      );
    } catch (requestError) {
      setNotice(requestError.message);
    } finally {
      setIsPreparingNextGame(false);
    }
  }

  function handleSendMessage(text) {
  if (!channelRef.current) {
    setNotice(
      "El chat todavía se está conectando."
    );

    return;
  }

  const chatMessage = {
      id: `${user.id}-${Date.now()}`,
      userId: user.id,
      name: user.name,
      text: text.slice(0, 200),
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      chatMessage,
    ].slice(-50));

    channelRef.current.whisper(
      "chat",
      chatMessage
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanWord = word
        .trim()
        .toLowerCase();

    if (
        !cleanWord ||
        !isMyTurn ||
        secondsRemaining === 0
    ) {
        return;
    }

    try {
        setIsSubmitting(true);
        setNotice("");

        const result =
        await submitMultiplayerWord(
            code,
            cleanWord
        );

        setRoom(result.room);
        setWord("");
        setLiveWord("");

        channelRef.current?.whisper(
        "typing",
        {
            userId: user.id,
            name: user.name,
            word: "",
        }
        );

        setNotice(result.message);
    } catch (requestError) {
        setNotice(requestError.message);
    } finally {
        setIsSubmitting(false);
    }
    }

  useEffect(() => {
    if (room?.status === "waiting") {
      navigate(
        `/multiplayer/sala/${room.code}`,
        {
          replace: true,
          state: {
            room,
          },
        }
      );
    }
  }, [navigate, room]);

  if (loading) {
    return (
      <main className="multiplayer-game-message">
        Cargando partida...
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="multiplayer-game-message">
        {error || "No se pudo cargar la partida."}
      </main>
    );
  }

  const currentPlayer = room.players.find(
    (player) =>
      Number(player.id) ===
      Number(room.current_room_player_id)
  );

  const isMyTurn =
    Number(currentPlayer?.user?.id) ===
    Number(user?.id);

  const isHost =
  Number(room.host?.id) === Number(user?.id);

  const winnerPlayer = room.players.find(
    (player) =>
      Number(player.user?.id) ===
      Number(room.winner_user_id)
  );

  if (room.status === "finished") {
    return (
      <MultiplayerLayout
        sidebar={<RoomSidebar
          room={room}
          messages={messages}
          onSendMessage={handleSendMessage}
        />}
      >
        <section className="multiplayer-finished">
          <span className="multiplayer-finished-label">
            PARTIDA TERMINADA
          </span>

          <UserAvatar
            avatarKey={
              winnerPlayer?.user?.avatar_key
            }
            name={winnerPlayer?.user?.name}
            size="large"
          />

          <h1>
            {winnerPlayer?.user?.name ||
              "El jugador"}{" "}
            ganó
          </h1>

          <p>
            La partida terminó. Los jugadores
            nuevos participarán en la siguiente.
          </p>

          {isHost ? (
            <button
              type="button"
              className="prepare-next-game-button"
              onClick={handlePrepareNextGame}
              disabled={isPreparingNextGame}
            >
              {isPreparingNextGame
                ? "Preparando..."
                : "Preparar nueva partida"}
            </button>
          ) : (
            <p className="waiting-next-game-message">
              Esperando a que el creador prepare
              la siguiente partida...
            </p>
          )}

          {notice && (
            <p className="multiplayer-game-notice">
              {notice}
            </p>
          )}
        </section>
      </MultiplayerLayout>
    );
  }

  return (
    <MultiplayerLayout
        sidebar={
        <RoomSidebar
          room={room}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
        }
    >
        <div className="multiplayer-game-main">
        <header className="multiplayer-game-header">
            <div>
            <span>PARTIDA MULTIJUGADOR</span>
            <h1>{room.name}</h1>
            <p>Sala {room.code}</p>
            </div>

            <div
            className={`turn-timer ${
                secondsRemaining <= 3
                ? "turn-timer-danger"
                : ""
            }`}
            >
            <strong>{secondsRemaining}</strong>
            <span>segundos</span>
            </div>
        </header>

        <article className="multiplayer-board">
            <div
              key={currentPlayer?.id}
              className={`current-player-card ${
                isMyTurn
                  ? "current-player-card--mine"
                  : ""
              }`}
            >
              <div className="current-player-avatar">
                <UserAvatar
                  avatarKey={
                    currentPlayer?.user?.avatar_key
                  }
                  name={currentPlayer?.user?.name}
                  size="large"
                />
              </div>

              <div className="current-player-details">
                <span className="current-player-label">
                  {isMyTurn
                    ? "ES TU TURNO"
                    : "TURNO ACTUAL"}
                </span>

                <strong>
                  {currentPlayer?.user?.name ||
                    "Jugador"}
                </strong>

                <div
                  className="current-player-lives"
                  aria-label={
                    `${currentPlayer?.lives_remaining || 0} vidas`
                  }
                >
                  {Array.from(
                    {
                      length:
                        Number(room.initial_lives) || 0,
                    },
                    (_, index) => (
                      <span
                        key={index}
                        className={
                          index <
                          Number(
                            currentPlayer?.lives_remaining
                          )
                            ? "player-life player-life--active"
                            : "player-life player-life--empty"
                        }
                      >
                        ♥
                      </span>
                    )
                  )}
                </div>

                <p className="turn-owner">
                  {isMyTurn
                    ? "¡Es tu turno! Escribe una palabra."
                    : `Observando a ${
                        currentPlayer?.user?.name ||
                        "Jugador"
                      }`}
                </p>
              </div>
            </div>

            <div className="fragment-card">
            <span>
                La palabra debe contener
            </span>

            <strong>
                {room.current_fragment || "---"}
            </strong>
            </div>

            <form
            className="multiplayer-word-form"
            onSubmit={handleSubmit}
            >
            <input
                type="text"
                value={
                    isMyTurn ? word : liveWord
                }
                onChange={handleWordChange}
                placeholder={
                isMyTurn
                    ? "Escribe una palabra en inglés"
                    : "Observa la respuesta del jugador"
                }
                disabled={
                !isMyTurn ||
                secondsRemaining === 0
                }
                autoComplete="off"
                autoFocus={isMyTurn}
            />

            <button
            type="submit"
            disabled={
                !isMyTurn ||
                !word.trim() ||
                secondsRemaining === 0 ||
                isSubmitting
            }
            >
            {isSubmitting
                ? "Validando..."
                : "Enviar palabra"}
            </button>
            </form>

            {notice && (
            <p className="multiplayer-game-notice">
                {notice}
            </p>
            )}
        </article>
        </div>
    </MultiplayerLayout>
    );
}

export default MultiplayerGame;