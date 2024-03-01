import { HistoryData } from "../../types/types";
import '../../style/winprogress.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface WinProgressProps{
    data: HistoryData | null;
}

const WinProgress: React.FC<WinProgressProps> = ({data}) =>
{
    if (!data){
        return null;
    }
    const winPercentage = data.gamesPlayed > 0 ? (data.gamesWon / data.gamesPlayed) * 100 : 0;
  
    return(
        <div className="progress">
          <div style={{ width: '21vw', height: '21vw', transform: 'rotate(180deg)' }}>
      <CircularProgressbar
        value={winPercentage}
        // text={null}
        styles={buildStyles({
          pathColor: '#FDB570',
          trailColor: '#202e3a9b',
        })}
      />
      <div className="circle-text">
      {`${data.gamesWon}W/${data.gamesLost}L`}
        </div>
    </div>
        </div>
    );
}

export default WinProgress;