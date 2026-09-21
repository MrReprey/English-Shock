import { useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import gameData from "./../data/gamedata";
import "./css/game.css";


import { saveScore } from "../services/api";

/* Mezcla aleatoriamente un arreglo */

function shuffleQuestions(questionList) {
  const shuffled = [...questionList];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomPosition = Math.floor(
      Math.random() * (i + 1)
    );

    [shuffled[i], shuffled[randomPosition]] = [
      shuffled[randomPosition],
      shuffled[i],
    ];
  }

  return shuffled;
}

/* Prepara el texto para comparar respuestas */

function normalizeAnswer(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,]/g, "")
    .replace(/\s+/g, " ");
}

function Game() {
  const { type, category } = useParams();

  const selectedGame = gameData[type]?.[category];

  

  /* PARA LA API */

  const location = useLocation();
  
  const playerId =
  location.state?.playerId || null;
  const playerName =
    location.state?.playerName || "Jugador";
  const playerImage =
    location.state?.playerImage || null;
  
  const [saveStatus, setSaveStatus] =
    useState("idle");
  const [saveError, setSaveError] =
    useState("");

  /*
   * Mezclamos las preguntas y seleccionamos solamente 10.
   * Esta función se ejecuta al iniciar la partida.
   */

  const [questions, setQuestions] = useState(() => {
    if (!selectedGame) {
      return [];
    }

    return shuffleQuestions(
      selectedGame.questions
    ).slice(0, 26);
  });
  const [electricShock, setElectricShock] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [finished, setFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /* Leader Board */
  const navigate = useNavigate();

  /*MEDIDA DE TIEMPO*/
  const startTime = useRef(Date.now());
  const inputRef = useRef(null);

  if (!selectedGame || questions.length === 0) {
    return (
      <main className="game-error">
        <h1>Juego no encontrado</h1>

        <p>
          No existen preguntas para esta categoría.
        </p>

        <Link to="/">Volver al inicio</Link>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];
  const incorrectAnswers = answerHistory.filter(
    (answer) => !answer.isCorrect
  );

  async function saveFinalScore(
    finalCorrectAnswers,
    totalMilliseconds
  ) {
    if (!playerId) {
      setSaveStatus("error");

      setSaveError(
        "No se encontró el jugador."
      );

      return;
    }

    try {
      setSaveStatus("saving");
      setSaveError("");

      await saveScore({
        player_id: playerId,
        game_type: type,
        category,
        correct_answers:
          finalCorrectAnswers,
        total_questions: questions.length,
        completion_time_ms:
          totalMilliseconds,
      });

      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveError(error.message);
    }
  }

  function advanceGame(finalCorrectAnswers) {
    setUserAnswer("");
    setElectricShock(false);
    setFeedback("");
    setIsTransitioning(false);

    const isLastQuestion =
      currentIndex === questions.length - 1;

    if (isLastQuestion) {
      const endTime = Date.now();

      const totalMilliseconds =
        endTime - startTime.current;

      const totalSeconds = Math.floor(
        totalMilliseconds / 1000
      );

      setElapsedTime(totalSeconds);
      setFinished(true);

      saveFinalScore(
        finalCorrectAnswers,
        totalMilliseconds
      );
    } else {
      setCurrentIndex(
        (previousIndex) => previousIndex + 1
      );

      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      userAnswer.trim() === "" ||
      isTransitioning
    ) {
      return;
    }

    const normalizedUserAnswer =
      normalizeAnswer(userAnswer);

    const isCorrect =
      currentQuestion.answers.some(
        (correctAnswer) =>
          normalizeAnswer(correctAnswer) ===
          normalizedUserAnswer
      );

    const newAnswer = {
      question: currentQuestion.word,
      userAnswer: userAnswer.trim(),
      correctAnswer:
        currentQuestion.answers[0],
      isCorrect,
    };

    setAnswerHistory((previousHistory) => [
      ...previousHistory,
      newAnswer,
    ]);

    const finalCorrectAnswers = isCorrect
      ? correctAnswers + 1
      : correctAnswers;

    if (isCorrect) {
      setCorrectAnswers(
        finalCorrectAnswers
      );

      setFeedback("");

      advanceGame(finalCorrectAnswers);

      return;
    }

    setIsTransitioning(true);
    setElectricShock(true);
    setFeedback("incorrect");

    window.setTimeout(() => {
      advanceGame(finalCorrectAnswers);
    }, 550);
  }

  function restartGame() {
    const newQuestions = shuffleQuestions(
      selectedGame.questions
    ).slice(0, 26);

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setUserAnswer("");
    setCorrectAnswers(0);
    setAnswerHistory([]);
    setElapsedTime(0);
    setFinished(false);

    startTime.current = Date.now();
    setElectricShock(false);
    setFeedback("");
    setIsTransitioning(false); 

    setSaveStatus("idle");
    setSaveError("");
  }

  /* Pantalla de resultados */

  if (finished) {
    return (
      <main className="game-page">
        <section className="game-result">
          <div className="result-player">
            {playerImage ? (
              <img
                className="result-player-image"
                src={playerImage}
                alt={`Perfil de ${playerName}`}
              />
            ) : (
              <div className="result-player-placeholder">
                {playerName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="result-player-info">
              <span>Resultados de</span>
              <h2>{playerName}</h2>
            </div>
          </div>
          <span className="game-category">
            Partida terminada
          </span>

          <h1>¡Completaste el juego!</h1>

          <div className="result-summary">
            <div>
              <strong>{correctAnswers}</strong>
              <span>Aciertos</span>
            </div>

            <div>
              <strong>{questions.length}</strong>
              <span>Preguntas</span>
            </div>

            <div>
              <strong>{elapsedTime}s</strong>
              <span>Tiempo</span>
            </div>
          </div>

          {/* Guardado de los puntajes */}

          <div className="save-score-status">
            {saveStatus === "saving" && (
              <p className="score-saving">
                Guardando resultado...
              </p>
            )}

            {saveStatus === "saved" && (
              <p className="score-saved">
                ✓ Resultado guardado
              </p>
            )}

            {saveStatus === "error" && (
              <p className="score-error">
                {saveError}
              </p>
            )}
          </div>

          {/* Respuestas Incorrectas */}

          <div className="answer-history">
            {incorrectAnswers.length > 0 ? (
              <>
                <h2>Palabras que debes repasar</h2>

                {incorrectAnswers.map((answer, index) => (
                  <div
                    key={`${answer.question}-${index}`}
                    className="history-item history-incorrect"
                  >
                    <div className="incorrect-answer-info">
                      <span>{answer.question}</span>

                      <small>
                        Tu respuesta:{" "}
                        <strong>{answer.userAnswer}</strong>
                      </small>

                      <small>
                        Respuesta correcta:{" "}
                        <strong>{answer.correctAnswer}</strong>
                      </small>
                    </div>

                    <span className="incorrect-symbol">
                      ×
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="perfect-result">
                <span>✓</span>

                <div>
                  <h2>¡No cometiste errores!</h2>
                  <p>
                    Respondiste correctamente todas las preguntas.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* BOTON LEADERBOARD */}
          <button
            className="game-leaderboard-button"
            disabled={saveStatus === "saving"}
            onClick={() =>
              navigate(`/clasificacion/${type}/${category}`)
            }
          >
            {saveStatus === "saving"
              ? "Guardando resultado..."
              : "Ver tabla de posiciones"}
          </button>
          {/* BOTON VOLVER A JUGAR Y VOLVER AL INCIO*/}
          <div className="result-actions">
            <button
              type="button"
              onClick={restartGame}
            >
              Jugar otra vez
            </button>

            <Link to="/">
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* Pantalla de preguntas */

  return (
    <main className="game-page">
      <section className="game-container">
        <Link to="/" className="back-button">
          ← Volver
        </Link>

        <span className="game-category">
          {selectedGame.title}
        </span>

        <h1>{selectedGame.instruction}</h1>

        <div className="question-card">
          <span>
            Pregunta {currentIndex + 1} de{" "}
            {questions.length}
          </span>

          <h2>{currentQuestion.word}</h2>

          <form
            className={`answer-form ${
                electricShock ? "electric-shock" : ""
            }`}
            onSubmit={handleSubmit}
          >
            <input
                ref={inputRef}
                type="text"
                placeholder="Escribe la respuesta en inglés"
                value={userAnswer}
                onChange={(event) => {
                    setUserAnswer(event.target.value);

                    if (feedback === "incorrect") {
                    setFeedback("");
                    }
                }}
                autoComplete="off"
                autoFocus
                readOnly={isTransitioning}
            />

            <button type="submit" disabled={isTransitioning}>
              Responder
            </button>
          </form>


          {feedback === "incorrect" ? (
            <p className="incorrect-message">
                ⚡ Respuesta incorrecta
            </p>
            ) : (
            <p className="game-help">
                Escribe tu respuesta y presiona Enter.
            </p>
            )}
        </div>
      </section>
    </main>
  );
}

export default Game;