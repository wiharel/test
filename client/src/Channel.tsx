import { useState, useEffect } from "react";
//import Status from './Components/channel/Status';
//import Chantype from './Components/channel/ChanType';
import Room from "./Components/channel/Room";
import "./style/channel.css";

const Channel = () => {
  //const [status, setStatus] = useState<Status | null>(null);
  //const [chantype, setChanType] = useState<Chantype | null>(null);
  //const [user, setUser] = useState<User | null>(null);
  //const [friends, setFriends] = useState<User[]>([]);
  //const [blocked, setBlocked] = useState<User[]>([]);

  useEffect(() => {
    const getChannel = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_CALLBACK_URL}/channel/channel`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      //setStatus(data.status);
      //setChanType(data.chantype);
    };
    getChannel();
  }, []);

  return (
    <div className="chat">
      <div className="chatsec-one">
        <Room />
        <div className="chatsec-two"></div>
      </div>
    </div>
  );
};

export default Channel;
