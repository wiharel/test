import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/code-verif.css';
import './style/Navbar.css';

function CodeVerif(){
    const [userInput, setUserInput] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/auth/verify-2fa`, {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({userInput}),
        });
        const data = await response.json();
        if (data.isVerified === true) {
          if (data.displayName) {
            navigate('/mapselect');
          } else {
            navigate('/displayName');
        }
      } else {
      }
    };

  return (
    <>
    <div className="bandroll">
      <h1 className="name">The White Rabbit Pong</h1>
    </div>
    <div className="bloc-verif">
      <h1 className="welcome">Enter the code that was sent to you here !</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button className="sub-verif" type="submit">Submit</button>
      </form>
    </div>
    </>
  );
}
    

export default CodeVerif;