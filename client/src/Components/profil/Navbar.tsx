
/* eslint-disable jsx-a11y/alt-text */
import { useEffect, useState } from "react";
import "../../style/Navbar.css";
import icon1 from "../../style/img/home.png";
import icon2 from "../../style/img/friend.png";
import icon3 from "../../style/img/chat.png";

import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [profilPicture, setProfilPicture] = useState("");

  useEffect(() => {    
    const fetchUser = async () => {
        const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/user/profil`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setProfilPicture(data.userIconPath);
    }
        fetchUser();
    }, []);

  return (
    <div className="bandroller">
      <div>
        <button className="button" onClick={() => navigate("/mapselect")}>
          <img
            src={icon1}
            style={{
              width: "2.5rem",
              height: "2.5rem",
            }}
          />
        </button>
        <button className="button" onClick={() => navigate("/friends")}>
          <img
            src={icon2}
            style={{
              width: "2.5rem",
              height: "2.5rem",
            }}
          />
        </button>
        <button className="button" onClick={() => navigate("/chat")}>
          <img
            src={icon3}
            style={{
              width: "2.5rem",
              height: "2.5rem",
            }}
          />
        </button>
      </div>
        <h1 className="name">The White Rabbit Pong</h1>
      <button className="button" onClick={() => navigate("/profil")}>
      <img
            src={profilPicture}
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "50%",
            }}
          />
          </button>
    </div> 
  );
}