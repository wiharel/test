import { useState, Dispatch, SetStateAction } from 'react';
import { User } from '../../types/friendinterface';
import { PlayerList } from './PlayerList';

interface SearchBarProps {
  setSearchResults: (results: User[]) => void;
  setTab: Dispatch<SetStateAction<PlayerList>>;
}

const SearchBar: React.FC<SearchBarProps> =  ({ setSearchResults, setTab }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    
    if (event.target.value !== '') {
      const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/user/search?q=${event.target.value}`);
      const data = await response.json();
      
      setSearchResults(data);
      setTab(PlayerList.Search);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="searchbar">
      <input type="text" placeholder="Search.." value={searchTerm} onChange={handleSearch} />
    </div>
  );
};

export default SearchBar;