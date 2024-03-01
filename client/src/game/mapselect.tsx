import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../style/mapselect.css'
import map1 from './map1.png'
import map2 from './map2.png'
import map3 from './map3.png'


const MapSelect = () => {
    const [themeN, setThemeN] = useState(0);
    const [selectedMap, setSelectedMap] = useState("");
    const [showMessage, setSetShowMessage] = useState(false);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    if(!location.state) {
        location.state = {against: undefined};
    }
    const against = location.state.against;

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
        setUsername(data.username);
    }
        fetchUser();
    }, [themeN]);
    
    const handleMapClick = (mapNumber: number) => {
        setThemeN(mapNumber);
        setSelectedMap(`Map ${mapNumber} selected`);
        setSetShowMessage(true);

        setTimeout(() => {
            setSelectedMap("");
            setSetShowMessage(false);
        }, 1500);
    };

    const handleSelectClick = () => {
        if (themeN === 0) return;
        navigate('/game', { state: { username: username,themeN: themeN, against}});
    };

    // const test1 = () => {
    //     if (themeN === 0) return;
    //     navigate('/game', { state: { username: username, themeN: themeN, against: 'yatamago'}});
    // };

    // const test2 = () => {
    //     if (themeN === 0) return;
    //     navigate('/game', { state: { username: username, themeN: themeN, against: 'tanota'}});
    // };


return (
    <div className="bloc">
        <div className="maps">
            <div className="map" onClick={() => handleMapClick(1)}><img src={map1} alt="Map 1"/></div>
            <div className="map" onClick={() => handleMapClick(2)}><img src={map2} alt="Map 2"/></div>
            <div className="map" onClick={() => handleMapClick(3)}><img src={map3} alt="Map 3"/></div>
        </div>
        <p className="guide">ⓘ Use your mouse to move the paddle!</p>
        <p className={`map-message ${showMessage ? 'show' : ''}`}>{selectedMap}</p>
        <button className="select" onClick={handleSelectClick}>Select</button>
        {/* <button className="select" onClick={test1}>vsYatamago</button>
        <button className="select" onClick={test2}>vsTanota</button> */}

    </div>
    );
};

export default MapSelect;