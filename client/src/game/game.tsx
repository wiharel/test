import React, { useState, useEffect,} from 'react';
import { io, Socket } from 'socket.io-client';
import Canvas from './Canvas';
import { useLocation} from 'react-router-dom';
import '../style/game.css';
import { useNavigate } from 'react-router-dom';
// import { emit } from 'process';


function UsernameForm() {
  // const searchparams = useSearchParams();
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [socket_game, setSocket_game] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);



  const navigate = useNavigate();
  const location = useLocation();
  if(!location.state) {
    location.state = {themeN: 1, against: undefined};
  }
  const themeN = location.state.themeN;
  const against = location.state.against;
  const username = location.state.username;
      useEffect(() => {
        if (!socket_game){
          const socket = io('http://localhost:3003', {
            withCredentials: true,
          });
          console.log(socket);
          setSocket_game(socket);
          
          socket.on('connect', () => {
            if (!gameOver){
              socket.emit('GameMode', {username, against});
            }
          });

          const handleGameOver = (data: any) => {
            if (data.winnerUsername === username){
              setMessage('won');
            } else {
              setMessage('lost');
            }
            setGameOver(true);
          };
          
          socket.on('gameOver', handleGameOver);
          
          return () => {
            socket.off('gameOver', handleGameOver);
            socket.disconnect();
          };
        }
  }, []);

  const handleNextClick = () => {
    navigate('/mapselect');
};

  return (
    <div className="bloc-game">
      {!gameOver && socket_game && <Canvas socket={socket_game} themeN={themeN} ball={false} colors={null}/>}
      {gameOver && (
        <>
          <h1 className="gameover">
            {message === "won" && (
            <>
              <p className="Winner">VICTORY</p>
              <p className="WinnerMessage">You've mastered the art of the Pong!!</p>
            </>
            )}
            {message === "lost" && (
            <>
              <p className="Looser">Defeat</p>
              <p className="LooserMessage">... but practice makes perfect right?</p>
            </>
            )}
          </h1>
          <button className="select" onClick={handleNextClick}>Next</button>
        </>
      )}
    </div>
  );
};

export default UsernameForm;