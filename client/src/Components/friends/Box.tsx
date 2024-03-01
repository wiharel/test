import { User } from '../../types/friendinterface';
import { useState } from 'react';
import ContextMenu from './ContextMenu';
import { useEffect } from 'react';
import ProfileView from './ProfileView';

interface BoxProps {
  friends: User[];
  tab: string;
  blocked: User[];
}

const Box: React.FC<BoxProps> = ({ friends, tab, blocked }) => {
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, friend: User | null, blocked: User | null} | null>(null);
  const [showProfile, setShowProfile] = useState(false); // new state variable
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // new state variable
  const handleContextMenu = (event: React.MouseEvent, username: string) => {
    event.preventDefault();
    event.stopPropagation();
    const clickedFriend = friends.find((friend: any) => 'friend' in friend ? friend.friend.username === username : friend.username === username) || null;
    const clickedBlocked = blocked.find((blocked: any) => 'blocked' in blocked ? blocked.blocked.username === username : blocked.username === username) || null;
    setContextMenu({ x: event.clientX, y: event.clientY, friend: clickedFriend, blocked: clickedBlocked });
  };

  const handleDocumentClick = () => {
    setContextMenu(null);
  };


  const handleSeeProfile = (user: User) => {
    setSelectedUser(user);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  useEffect(() => {
    if (contextMenu) {
      document.addEventListener('click', handleDocumentClick);
    } else {
      document.removeEventListener('click', handleDocumentClick);
    }
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [contextMenu]);
  
  return (
    <div className="Box">
      {(tab === 'Blocked' ? blocked : friends).length > 0 ? (
        (tab === 'Blocked' ? blocked : friends).map((item, index) => {
          const user = item;
          return (
            <div className="pending-container" key={`${user.userId}-${index}`}>
              <div className='pending' onClick={(event) => handleContextMenu(event, user.username)}>
                <img src={user.userIconPath} alt={user.username} className='UserImage'/>
                {tab !== 'Pending' && tab !== 'Blocked'  && tab !== 'Search' && (user.userStatus === 'online' ? <img src="online.svg" alt="Online" className="OnlineLogo" /> : <img src="offline.png" alt="Offline" className="OnlineLogo" />)}
                <p>{user.displayName}</p>
              </div>
          </div>
        );
      })
        ) : (
          <h1>
        {tab === 'Online' ? 'No friends connected.' :
        tab === 'All' ? 'No friends :(' :
        tab === 'Pending' ? 'No request pending.' :
        tab === 'Blocked' ? 'No user blocked.' :
        tab === 'Search' ? 'No search results.' :
        'No friends to display.'}
      </h1>
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          friends={contextMenu.friend}
          onViewProfile={handleSeeProfile}
          currentTab={tab}
          blocked={contextMenu.blocked}
        />
      )}
      {showProfile && <div className="Overlay" />}
      {showProfile && selectedUser && (
        <ProfileView
          user={selectedUser}
          onClose={handleCloseProfile}
        />
      )}
    </div>
  );
}

export default Box;