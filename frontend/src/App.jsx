import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


/* COMPONENTES */
import Home from './pages/Home';
import Game from "./pages/game";
import Leaderboard from './pages/LeaderBoard';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/juego/:type/:category' element={<Game />}/>
          <Route path="/clasificacion/:type/:category" element={<Leaderboard />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
