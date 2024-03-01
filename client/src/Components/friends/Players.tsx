import { useState, Dispatch, SetStateAction } from 'react';
import { PlayerList } from './PlayerList';
import { User } from '../../types/friendinterface';
import { useEffect } from 'react';

interface PlayerProps {
  user : User | null;
  setFriends: (friends: User[]) => void;
  setBlocked: (blocked: User[]) => void;
  // setTab: (tab: string) => void;
  tab: string;
  setTab: Dispatch<SetStateAction<PlayerList>>;
}

const Player: React.FC<PlayerProps> = ({tab, user, setFriends, setTab, setBlocked}) => {
  // console.log(user);
  const [currentTab, setCurrentTabLocal] = useState<PlayerList>(PlayerList.Search);
  const [friendList, setFriendList] = useState<User[]>([]);
  const [blockedList, setBlockedList] = useState<User[]>([]);
  const [requestList, setRequestList] = useState<User[]>([]);
  
  useEffect(() => {
    if (friendList.length > 0) {
      handleTabClick(currentTab);
    }
  }, [currentTab]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (user?.userId) {
        const friendList = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/friends/friend-list/${user.userId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const friendData = await friendList.json();
        setFriendList(friendData);
      }
    };
    
    const fetchBlocked = async () => {
      if (user?.userId) {
        const blockList = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/friends/block-list/${user.userId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const blockData = await blockList.json();
        setBlockedList(blockData);
      }
    };
    
    const fetchRequests = async () => {
      if (user?.userId) {
        const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/friends/received-requests/${user.userId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setRequestList(data);
      }
    }
    fetchFriends();
    fetchRequests();
    fetchBlocked();
  }, [user, currentTab]);

  
  
  
  const handleTabClick = async (tab: PlayerList) => {
    setCurrentTabLocal(tab);
    setTab(tab);
    let filteredFriends: User[] = [];
    let filteredBlocked: User[] = [];
    switch (tab) {
      case PlayerList.All:
        filteredFriends = friendList;
        break;
      case PlayerList.Online:
        filteredFriends = friendList.filter((friendship: any) => friendship.userStatus === 'online');
        break;
      case PlayerList.Pending:
        filteredFriends = user ? requestList.map((request: any) => request.sender) : [];
        break;
      case PlayerList.Blocked:
        filteredBlocked = blockedList;
        break;
              
        // Add more cases for other tabs
      }
      setFriends(filteredFriends);
      setBlocked(filteredBlocked);
    };
          
          useEffect(() => {
            setCurrentTabLocal(tab as PlayerList);
          }, [tab]);
          
          return (
            <div className="nav-bar">
      <div className="nav-item">
        <button className={`nav-button ${currentTab === PlayerList.Online ? 'active' : ''}`} onClick={() => handleTabClick(PlayerList.Online)}>Online</button>
      </div>
      <div className="nav-item">
        <button className={`nav-button ${currentTab === PlayerList.All ? 'active' : ''}`} onClick={() => handleTabClick(PlayerList.All)}>All</button>
      </div>
      <div className="nav-item">
        <button className={`nav-button ${currentTab === PlayerList.Pending ? 'active' : ''}`} onClick={() => handleTabClick(PlayerList.Pending)}>Pending</button>
      </div>
      <div className="nav-item">
        <button className={`nav-button ${currentTab === PlayerList.Blocked ? 'active' : ''}`} onClick={() => handleTabClick(PlayerList.Blocked)}>Blocked</button>
      </div>
    </div>
  );
}

export default Player;