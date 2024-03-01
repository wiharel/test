import { useEffect, useState } from "react";
import Achievements from "./Components/profil/Achievements";
import History from "./Components/profil/History";
import UserInfo from "./Components/profil/UserInfo";
import WinProgress from "./Components/profil/WinProgress";
import { HistoryData } from "./types/types";
import './style/profil.css'

const Profil = () =>
{
    const [achievementsData, setAchievementsData] = useState([]) as any[];
    const [historyData, setHistoryData] = useState<HistoryData>({
        matchHistory: [],
        gamesWon: 0,
        gamesPlayed: 0,
        gamesLost: 0,
        rank: 0,
    });

    useEffect(() => {
        const fetchHistory = async () => {
            const achievements = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/qr/achievements`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    },
            });
            const ac = await achievements.json();
            setAchievementsData(ac);
            const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/qr/history`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setHistoryData(data);
        };
        fetchHistory();
    }, []);
    return(
        <div className="profil">
            <div className="sec-one">
            <UserInfo data={historyData} />
                <div className="sec-two">
                    <Achievements ac={achievementsData}/>
                    <WinProgress data={historyData}/>
                </div>
            </div>
            <History data={historyData}/>
        </div>
    )
}

export default Profil;