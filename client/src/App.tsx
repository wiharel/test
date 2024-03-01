import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EnableAuth from './enable2fa';
import Login from './Login'
import codeVerif from './code-verification';
import Game from './game/game';
import MapSelect from './game/mapselect';
import './style/App.css'
import axios from 'axios';
import Profil from './Profil';
import Navbar from './Components/profil/Navbar';
import Friends from './Friends';
import DisplayName from './displayName';
import Chat from './Channel';
import QCode from './qrcode';

const App: React.FC = () => {
  const [uid, setUid] = useState(null);
  const UidContext = createContext(uid);

  useEffect (() => {
    const fetchToken = async () => {
      await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}jwtid`,
        withCredentials: true,
      })
        .then((res) => {
          setUid(res.data);
        })
        .catch((err) => console.log("No token"));
    }
        fetchToken();
  }, [uid]);



  const FriendsWithNavbar = () => {
    const showNavbar = true;
    return (
      <>
        {showNavbar && <Navbar />}
        <Friends />
      </>
    );
  };


  const ProfilWithNavbar = () => (
    <>
      <Navbar />
      <Profil />
    </>
  );

  const MapSelectWithNavbar = () => (
    <>
      <Navbar />
      <MapSelect />
    </>
  );

  
  const GameWithNavbar = () => (
    <>
      <Navbar />
      <Game />
    </>
  );

  const ChatWithNavbar = () => (
    <>
      <Navbar />
      <Chat />
    </>
  ); 

  return (
    <UidContext.Provider value={uid}>
      <Router>
        <div className="app-container">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/displayName" Component={DisplayName} />
              <Route path="/mapselect" element={<MapSelectWithNavbar />} />
              <Route path="/EnableAuth" element={<EnableAuth/>} />
              <Route path="/qrcode" element={<QCode/>} />
              <Route path="/code-verification" Component={codeVerif} />
              <Route path="/game" Component={GameWithNavbar} />
              <Route path="/profil" element={<ProfilWithNavbar />} />
              <Route path="/friends" element={<FriendsWithNavbar />} />
              <Route path="/channel" element={<ChatWithNavbar />} />
            </Routes>
        </div>
      </Router>
    </UidContext.Provider>
  );
};

export default App;