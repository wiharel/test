import { useState } from "react";
import { useNavigate } from "react-router-dom";


function DisplayName() {
    const [userInput, setUserInput] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch(`${process.env.REACT_APP_CALLBACK_URL}/user/changeDisplayName`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ displayName: userInput }),
        });
        const data = await response.json();
        if (data) {
            navigate("/mapselect");
        }
        else {
            throw new Error("Error when changing display name!");
        }
    }
return (
  <>
  <div className="bandroll">
  <h1 className="name">The White Rabbit Pong</h1>
</div>
    <div className="bloc-verif">
      <h1 className="welcome">How should we call you?</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button className="sub-verif" type="submit">Submit</button>
      </form>
    </div>
  </>
  );
}

export default DisplayName;