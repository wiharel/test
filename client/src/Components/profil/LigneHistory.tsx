import { Match } from '../../types/types'

interface LigneHistoryProps{
    match: Match;
    // gamesPlayed: number;
    // gamesLost: number;
    // gamesWon: number;
}

const LigneHistory: React.FC<LigneHistoryProps> = ({match}) => 
{
    return(
        <div>
      {/* <p className='data'>Games Played: {gamesPlayed}</p>
      <p className='data'>Games Won: {gamesWon}</p>
      <p className='data'>Games Lost: {gamesLost}</p> */}
    </div>
    );
}

export default LigneHistory;