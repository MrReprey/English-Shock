import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Game from "./pages/game";
import Leaderboard from "./pages/LeaderBoard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import SinglePlayer from "./pages/SinglePlayer";
import Multiplayer from "./pages/Multiplayer";

import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import WaitingRoom from "./pages/WaitingRoom";
import MultiplayerGame from "./pages/MultiplayerGame";

import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/registro"
          element={<Register />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SinglePlayer"
          element={
            <ProtectedRoute>
              <SinglePlayer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Multiplayer"
          element={
            <ProtectedRoute>
              <Multiplayer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/multiplayer/crear"
          element={
            <ProtectedRoute>
              <CreateRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/multiplayer/unirse"
          element={
            <ProtectedRoute>
              <JoinRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/multiplayer/sala/:code"
          element={
            <ProtectedRoute>
              <WaitingRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/multiplayer/juego/:code"
          element={
            <ProtectedRoute>
              <MultiplayerGame />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/juego/:type/:category"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clasificacion/:type/:category"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;