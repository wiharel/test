import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/enable2fa.css'

function EnableAuth() {
  const [enable2FA, setEnable2FA] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const handleEnable2FA = async (choice: boolean) => {
    setEnable2FA(choice);
    if (choice === false){
      fetch(`${process.env.REACT_APP_CALLBACK_URL}/auth/no-2fa`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/user/profil`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.displayName){
        navigate('/mapselect');
      } else {
        navigate('/displayName');
      }
    }
    
    if (choice === true){
        navigate('/qrcode');
    }
  };

  if (enable2FA === null) {
    return (
      <>
      <div className="bandroll">
                <h1 className="name">The White Rabbit Pong</h1>
      </div>
      <div className="bloc-2fa">
        <div className="text-2fa">
          <p className="centered-content"> Do you want to enable 2FA?</p>
        </div>
        <button className="button-2fa" onClick={() => handleEnable2FA(true)}>Yes</button>
        <button className="button-2fa"onClick={() => handleEnable2FA(false)}>No</button>
      </div>
      </>
    );
  } 
  return <div>2FA is {enable2FA ? 'enabled' : 'disabled'}</div>;
}


export default EnableAuth;