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
} from "../services/api";

import { useParams } from "react-router-dom";

import UserAvatar from "../Components/UserAvatar";

import MultiplayerLayout from "../Components/MultiplayerLayout";
import RoomSidebar from "../Components/RoomSidebar";

import { useAuth } from "../context/AuthContext";

import { getEcho } from "../services/echo";

import "./css/MultiplayerGame.css";

function MultiplayerGame() {
  const { code } = useParams();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] =
  useState(false);

  const [room, setRoom] = useState(null);
  const [word, setWord] = useState("");

  const [liveWord, setLiveWord] =
  useState("");
  const channelRef = useRef(null);
  const timeoutProcessedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [secondsRemaining, setSecondsRemaining] =
    useState(0);


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

  return (
    <MultiplayerLayout
        sidebar={
        <RoomSidebar room={room} />
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
            <div className="current-player-card">
            <UserAvatar
                avatarKey={
                currentPlayer?.user?.avatar_key
                }
                name={
                currentPlayer?.user?.name
                }
                size="medium"
            />

            <div>
                <span>
                {isMyTurn
                    ? "ES TU TURNO"
                    : "TURNO ACTUAL"}
                </span>

                <strong>
                {currentPlayer?.user?.name ||
                    "Jugador"}
                </strong>
            </div>
            </div>

            <p className="turn-owner">
            {isMyTurn
                ? "¡Es tu turno!"
                : `Observa la palabra de ${
                    currentPlayer?.user?.name ||
                    "Jugador"
                }`}
            </p>

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