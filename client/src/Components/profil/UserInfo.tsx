import logout from './../../style/img/logout.svg';
import edit from './../../style/img/edit.png';
import { HistoryData } from '../../types/types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditProfil from './EditProfil';

interface WinProgressProps{
    data: HistoryData | null;
}
const UserInfo: React.FC<WinProgressProps> = ({data}) => 
{

    const [displayName, setDisplayName] = useState<string | null >(null);
    const [profilPicture, setProfilPicture] = useState("default.jpeg");
    const winPercentage = data && data.gamesPlayed > 0 ? (data.gamesWon / data.gamesPlayed) * 100 : 0;
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState<string>('');
    const [twofactor, setTwoFactor] = useState<boolean>(false);
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    let selectedImageLocal: File | null = null;
    // if (!data){
    //     return null;
    // }

    
    useEffect(() => {
        const fetchDisplayName = async () => {
            const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/user/profil`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setDisplayName(data.displayName);
            setTwoFactor(data.twofactor);
            setProfilPicture(data.userIconPath);
        };

        fetchDisplayName();
    }, []);

    const handleLogout  = async () => {
        await fetch(`${process.env.REACT_APP_CALLBACK_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        navigate('/');
    }

    const handleEdit = () => {
        setIsEditing(true);
    }

    const handleCloseEdit = () => {
        setIsEditing(false);
    }

    const handleUpdateUsername = (newUsername: string) => {
        setUsername(newUsername);
    }

    const handleUploadProfilePicture = (file: File) => {
        setSelectedImage(file);
        selectedImageLocal = file;
    }

    const handleToggle2FA = () => {
        setTwoFactor(!twofactor);
    }

    const handlSaveEdit = async () => {
        const formData = new FormData();
        if (selectedImageLocal){
            formData.append('avatar', selectedImageLocal);
            const ref = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/user/profil/avatar`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            
            if (!ref.ok){
                alert('Error uploading profile picture');
                return;
            }
            
            setProfilPicture(URL.createObjectURL(selectedImageLocal));
        }
        if (username.trim() !== '') {
            const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/user/edit`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    displayName: username,
                    twofactor: twofactor,
                }),
            });
            if (!response.ok){
                alert('Error updating profile');
                return;
            }
            setIsEditing(false);
        } else {
            setIsEditing(false);
        }
    }

    return(
        <>
        <div className="user-info">
            <div className="picture">
                <img src={selectedImage ? URL.createObjectURL(selectedImage) : profilPicture} alt="avatar" className="avatar"/>
            </div>
            <div className="info">
                <h1 className="username">{displayName && displayName.length > 15 ? `${displayName.substring(0, 15)}...` : displayName}</h1>
                <p className="txt">Rank: #{data ? data.rank : "N/A"}</p>
                <p className="txt">{`Win rate: ${winPercentage.toFixed(2)}%`}</p>
            </div>
            <div className="sys">
                <img src={logout} alt="logout" className="logout" onClick={handleLogout}/>
                <img src={edit} alt="edit" className="edit" onClick={handleEdit}/>
            </div>
        </div>
        {isEditing && <div className="Overlay" />}
        {isEditing && (
            <div className="edit-profil-container">
                <EditProfil
                title="Edit Profile"
                username={username}
                profilPicture={profilPicture}
                twofactor={twofactor}
                onClose={handleCloseEdit}
                onUpdateUsername={handleUpdateUsername}
                onUploadProfilePicture={handleUploadProfilePicture}
                onToggle2FA={handleToggle2FA}
                onSubmit={handlSaveEdit}
            />
        </div>
        )}
            </>
    );
}

export default UserInfo;