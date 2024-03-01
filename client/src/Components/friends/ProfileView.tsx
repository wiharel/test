import { User } from "../../types/friendinterface";
import { useEffect, useState } from 'react';
import '../../style/ProfileView.css';

interface ProfileViewProps {
    user: User;
    onClose: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({user, onClose }) => {
    const [userMatch, setUserMatch] = useState<any>('');

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/user/matchHistory`, {
                method: 'Post',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.userId }),
            });
            const data = await response.json();
            setUserMatch(data);
            console.log(data);
        }
        fetchData();
    }, []);

    return (
        <div className='Profile' style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <img src={user.userIconPath} alt="img" className="userImage"/>
            <button className="ProfileButton" onClick={onClose}>X</button>
            <div className="ProfileView">
                <h1 className="rank-box">rank: {userMatch.rank}</h1>
                <h1 className="user-box">login: {user.username}</h1>
                <h1 className="display-box">username: {user.displayName}</h1>
                <h1 className="gamesWon-box">games won: {userMatch.gamesWon}</h1>
                <h1 className="gamesPlayed-box">games played: {userMatch.gamesPlayed}</h1>
                <h1 className="gamesLost-box">games lost: {userMatch.gamesLost}</h1>

                {/* <h1 className="status-box">status: {user.gamesWon}</h1> */}
            </div>
        </div>
    );
}

export default ProfileView;