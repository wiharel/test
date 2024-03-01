import { useState, useEffect } from 'react';
import Players from './Components/friends/Players';
import SearchBar from './Components/friends/SearchBar';
import Box from './Components/friends/Box';
import { User } from './types/friendinterface';
import './style/friends.css';
import rabbit from './style/img/rabbit.png';
import { PlayerList } from './Components/friends/PlayerList';

const Friends = () => {
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [tab, setTab] = useState<PlayerList>(PlayerList.Search);
  const [blocked, setBlocked] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]); // new state variable


  useEffect(() => {
    // Fetch user from the server and set the user state
    const getUser = async () => {
      const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/user/friends`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setUser(data.user);
    }

    getUser();
  }, []);

  return (
    <div className="friends">
            <div className="friendsec-one">
                <div className="rabbit">
                    <img src={rabbit} alt="rabbit" width="200" height="200"/>
                </div>
                <Players user={user} setFriends={setFriends} setTab={setTab} setBlocked={setBlocked} tab={tab}/>
                <SearchBar setSearchResults={setSearchResults} setTab={setTab}/>
            </div>
            <div className="friendsec-two">
                <Box friends={searchResults.length > 0 ? searchResults : friends} tab={tab} blocked={blocked}/>
            </div>
    </div>
)
}

export default Friends;