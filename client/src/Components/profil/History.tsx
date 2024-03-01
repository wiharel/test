import { useEffect, useState } from "react";
import { HistoryData} from "../../types/types";
import Cookies from "js-cookie";

interface HistoryProps{
    data: HistoryData | null;
}
const History: React.FC<HistoryProps> = ({data}) =>
{
  const [user, setUser] = useState("");

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
        setUser(data.username);
    }
        fetchUser();
    }, []);
    return(
        <div className="history">
            <h1 className="thistory">Match History</h1>
            {data && data.matchHistory.slice(-10).map((match) => {
              const currentUser = user;
              const isVictory = match.winner.username === currentUser;
              const isCurrentUserLeftPlayer = match.leftPlayer.username === currentUser;
              let opponent = isCurrentUserLeftPlayer ? match.rightPlayer.displayName : match.leftPlayer.displayName;
              const maxScore = Math.max(match.leftPlayerScore, match.rightPlayerScore);
              const minScore = Math.min(match.leftPlayerScore, match.rightPlayerScore);
              const score = isVictory ? `${maxScore}/${minScore}` : `${minScore}/${maxScore}`;

              const maxLength = 7;
              if (opponent.length > maxLength) {
                opponent = `${opponent.slice(0, maxLength)}...`;
              }
              return (
                <div key={match.gameId}>
                <p className="data">{isVictory ? 'VICTORY' : 'DEFEAT'} {score} vs {opponent}</p>
              </div>
            );
            })}
    </div>
    );
}

export default History;