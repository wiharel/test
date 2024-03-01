import React, { useEffect, useState } from 'react';
import '../../style/ContextMenu.css';
import { User } from '../../types/friendinterface';
import ProfileView from './ProfileView';

interface ContextMenuProps {
  x: number;
  y: number;
  friends: User | null;
  currentTab: string;
  onViewProfile: (user: User) => void;
  blocked: User | null;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, friends, currentTab, onViewProfile, blocked }) => {
  const [me, setMe] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // new state variable

  useEffect(() => {    
    const fetchData = async () => {
      const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/user/profilMore`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setMe(data);
      setIsLoading(false);
      if (friends) {
        setIsFriend(data.friends.some((me: User) => me.friendId === friends.userId));
      }
    };
    fetchData();
  }, [friends]);
  
    if (isLoading) {
    return null;
  }

  const handleSeeProfile = () => {
    if (!friends) {
      return;
    }
    onViewProfile(friends);
  };

  const AddUser = async (friend: User | null) => {
    if (!friend) {
      return;
    }
    const userId = friend.userId;
    if (!me) {
      return;
    }
    const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/friends/send-request`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ senderId: me.userId, receiverId: userId }),
    });
    const data = await response.json();
    if (data) {
      if (response.status === 400) {
        window.alert(data.message); // display the error message in a prompt
      } else {
        window.alert('Friend added');
      }
    }
  }

  const AcceptFriendRequest = async (friend: User | null) => {
    if (!friend) {
      return;
    }
    const userId = friend.userId;
    if (!me) {
      return;
    }
    const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/friends/accept-request`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ senderId: userId, receiverId: me.userId }),
    })
    if (response.ok) {
      window.alert('Friend request accepted');
    } else {
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      window.alert(data.message);
    }
  }

  const DeclineFriendRequest = async (friend: User | null) => {
    if (!friend) {
      return;
    }
    const userId = friend.userId;
    if (!me) {
      return;
    }
    const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/friends/decline-request`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ senderId: userId, receiverId: me.userId }),
    })
    if (response.ok) {
      window.alert('Friend request rejected');
    } else {
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      window.alert(data.message);
    }
  }

  const RemoveFriend = async (friend: User | null) => {
    if (!friend) {
      return;
    }
    const userId = friend.userId;
    if (!me) {
      return;
    }
    await fetch(`${process.env.REACT_APP_CALLBACK_URL}/friends/cancel-friendship`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user1Id: me.userId, user2Id: userId }),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw err; });
      }
    })
    .then(data => {
      alert('Friend removed');
    })
    .catch(error => {
      alert(error.message);
    });
  }

  const blockUser = async (friend: User | null) => {
    if (!friend) {
      return;
    }
    const userId = friend.userId;
    if (!me) {
      return;
    }
    await fetch(`${process.env.REACT_APP_CALLBACK_URL}/friends/block`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: me.userId, blockedId: userId }),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw err; });
      }
    })
    .then(data => {
      alert('User blocked');
    })
    .catch(error => {
      alert(error.message);
    });
  }

  const unblockUser = async (blocked: User | null) => {
    if (!blocked) {
      return;
    }
    const userId = blocked.userId;
    if (!me) {
      return;
    }
    await fetch(`${process.env.REACT_APP_CALLBACK_URL}/friends/unblock`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: me.userId, blockedId: userId }),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw err; });
      }
    })
    .then(data => {
      alert('User unblocked');
    })
    .catch(error => {
      alert(error.message);
    });
  }
  return (
    <div className='ContextMenu' style={{position: 'absolute', top: y, left: x}}>
      {currentTab === 'Pending' ? (
        <>
          <button onClick={()=> AcceptFriendRequest(friends)}>Accept</button>
          <button onClick={()=> DeclineFriendRequest(friends)}>Decline</button>
        </>
      ) : 
      currentTab === 'Blocked' ? (
        <button onClick={() => unblockUser(blocked)}>Unblock</button>
       
      ) : (
        <>
          <button onClick={handleSeeProfile}>See Profile</button>
          {!isFriend && (<button onClick={() => AddUser(friends)}>Add friend</button>)}
          {currentTab !=='Search' && (<button onClick={()=> RemoveFriend(friends)}>Remove friend</button>)}
          <button onClick={() => blockUser(friends)}>Block</button>
        </>
      )}
    </div>
  );
}

export default ContextMenu;