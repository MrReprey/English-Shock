import { useState } from "react";

import UserAvatar from "./UserAvatar";
import "./css/RoomSidebar.css";

const statusNames = {
  waiting: "Esperando",
  playing: "En partida",
  finished: "Finalizada",
};

function RoomSidebar({
  room,
  connectedUserIds = [],
  realtimeReady = false,
  messages = [],
  onSendMessage = null,
}) {
  const [message, setMessage] = useState("");

  const players = [...(room?.players || [])]
    .sort(
      (firstPlayer, secondPlayer) =>
        firstPlayer.turn_order -
        secondPlayer.turn_order
    );

  const winner = players.find(
    (player) =>
      Number(player.user?.id) ===
      Number(room?.winner_user_id)
  );

  function handleSubmit(event) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || !onSendMessage) {
      return;
    }

    onSendMessage(cleanMessage);
    setMessage("");
  }

  return (
    <div className="room-sidebar">
      <header className="room-sidebar-header">
        <div>
          <span>SALA</span>
          <strong>{room?.code}</strong>
        </div>

        <span
          className={
            `room-status room-status--${
              room?.status || "waiting"
            }`
          }
        >
          {statusNames[room?.status] ||
            room?.status}
        </span>
      </header>

      {winner && (
        <section className="room-winner">
          <span>GANADOR</span>

          <div>
            <UserAvatar
              avatarKey={
                winner.user?.avatar_key
              }
              name={winner.user?.name}
              size="medium"
            />

            <strong>
              {winner.user?.name}
            </strong>
          </div>
        </section>
      )}

      <section className="room-players-section">
        <div className="room-section-title">
          <strong>Jugadores</strong>

          <span>
            {players.length}/{room?.max_players}
          </span>
        </div>

        <div className="room-player-list">
          {players.map((player) => {
            const isCurrentPlayer =
              Number(player.id) ===
              Number(
                room?.current_room_player_id
              );

            const isConnected =
              !realtimeReady ||
              connectedUserIds.includes(
                Number(player.user?.id)
              );

            return (
              <article
                key={player.id}
                className={
                  `room-player ${
                    isCurrentPlayer
                      ? "room-player--active"
                      : ""
                  }`
                }
              >
                <div className="room-player-avatar">
                  <UserAvatar
                    avatarKey={
                      player.user?.avatar_key
                    }
                    name={player.user?.name}
                    size="small"
                  />

                  <span
                    className={
                      `room-online-dot ${
                        isConnected
                          ? "room-online-dot--active"
                          : ""
                      }`
                    }
                    title={
                      isConnected
                        ? "En línea"
                        : "Desconectado"
                    }
                  />
                </div>

                <div className="room-player-info">
                  <strong>
                    {player.user?.name ||
                      "Jugador"}
                  </strong>

                  <span>
                    {isCurrentPlayer
                      ? "Jugando ahora"
                      : player.user?.id ===
                          room?.host?.id
                        ? "Creador"
                        : player.status === "eliminated"
                        ? "Eliminado"
                        : player.status === "waiting"
                            ? "Esperando"
                            : "En juego"}
                  </span>
                </div>

                <div className="room-player-lives">
                  {"\u2665".repeat(
                    player.lives_remaining
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="room-chat">
        <div className="room-section-title">
          <strong>Chat</strong>
          <span>En vivo</span>
        </div>

        <div className="room-chat-messages">
          {messages.length === 0 ? (
            <p className="room-chat-empty">
              Todavía no hay mensajes.
            </p>
          ) : (
            messages.map((chatMessage) => (
              <div
                className="room-chat-message"
                key={chatMessage.id}
              >
                <strong>
                  {chatMessage.name ||
                    "Jugador"}
                </strong>

                <p>{chatMessage.text}</p>
              </div>
            ))
          )}
        </div>

        <form
          className="room-chat-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder={
              onSendMessage
                ? "Escribe un mensaje..."
                : "Conectando el chat..."
            }
            maxLength={200}
            disabled={!onSendMessage}
          />

          <button
            type="submit"
            disabled={
              !onSendMessage ||
              !message.trim()
            }
          >
            Enviar
          </button>
        </form>
      </section>
    </div>
  );
}

export default RoomSidebar;