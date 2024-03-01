import React, { useState, useEffect } from "react";
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';



function QCode() {
    const [otpauth_url, setOtpauthUrl] = useState<string | null>(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchData = async () => {
        const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/auth/enable-2fa`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setOtpauthUrl(data.url);
      }
      fetchData();
    }, []);
  
    const handleNext = () => {
      navigate('/code-verification');
    }

return (
    <>
        <div className="bandroll">
            <h1 className="name">The White Rabbit Pong</h1>
        </div>
    <div className="bloc-2fa">
        <p className="centered-content"> Scan the QR code below</p>
            <QRCode value={otpauth_url || ''} />
                <div className="center-b">
                    <button className="next" onClick={handleNext}>Next</button>
                </div>
            </div>
        </>
    );
}

export default QCode;