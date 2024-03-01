import React from "react";

interface Achievement {
    id: string;
    category: string;
    level: number;
    description: string
    // Add other fields if necessary
  }
  
  interface AchievementsProps {
    ac: Achievement[];
  }

const Achievements: React.FC<AchievementsProps> = ({ac}) =>
{
    return(
        <div className="achivements">
      <h1 className="tachivements">Achievements</h1>
      {ac.map((achievement) => (
        <div key={achievement.id}>
          {/* <img src="image" alt="test" /> */}
          <p className="data" title={achievement.description}> - {achievement.category}</p>
        </div>
      ))}
      <div>
        <img src="" alt="" />
      </div>
    </div>
    );

}

export default Achievements;