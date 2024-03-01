import React, { useEffect, useState } from "react";
import icon from "../../style/img/send.png";

enum ChatAction {
  RoomChat,
  PublicChat,
  PrivateMessage,
  ChatExampleLooking,
}

  const RoomChatComponent: React.FC = () => {
    return (
      <div className="create-chat-room-container">
        <input
          type="text"
          className="create-chat-room-input"
          placeholder="Create a new chat room"
        />
        <button className="create-chat-room-button">+</button>
      </div>
    );
  };
const PublicChatComponent: React.FC = () => <div>Public Chat Content</div>;
const PrivateMessageComponent: React.FC = () => (
  <div>Private Messages Content</div>
);

const ChatInputComponent: React.FC = () => {
  const [message, setMessage] = useState<string>("");

  const handleSendMessage = () => {
    console.log(message);
    setMessage("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-input-container">
      <input
        type="text"
        placeholder="send a message ..."
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        className="chat-input"
      />
      <button onClick={handleSendMessage} className="send-button">
        <img
          src={icon}
          style={{
            width: "2.5rem",
            height: "2.5rem",
          }}
        />
      </button>
    </div>
  );
};

const ChatExampleLookingComponent: React.FC = () => (
  <div className="chat-example-looking-container">
    <ChatInputComponent />
  </div>
);

const NavBar: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ChatAction>(ChatAction.RoomChat);

  const handleTabClick = (tab: ChatAction) => {
    setCurrentTab(tab);
  };

  const renderContent = () => {
    switch (currentTab) {
      case ChatAction.RoomChat:
        return <RoomChatComponent />;
      case ChatAction.PublicChat:
        return <PublicChatComponent />;
      case ChatAction.PrivateMessage:
        return <PrivateMessageComponent />;
      case ChatAction.ChatExampleLooking:
        return <ChatExampleLookingComponent />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="nav-bar-chat">
        <div className="nav-item">
          <button
            className={`nav-button-chat ${
              currentTab === ChatAction.RoomChat ? "active" : ""
            }`}
            onClick={() => handleTabClick(ChatAction.RoomChat)}
          >
            My chat room
          </button>
        </div>
        <div className="nav-item">
          <button
            className={`nav-button-chat ${
              currentTab === ChatAction.PublicChat ? "active" : ""
            }`}
            onClick={() => handleTabClick(ChatAction.PublicChat)}
          >
            Public chat Room
          </button>
        </div>
        <div className="nav-item">
          <button
            className={`nav-button-chat ${
              currentTab === ChatAction.PrivateMessage ? "active" : ""
            }`}
            onClick={() => handleTabClick(ChatAction.PrivateMessage)}
          >
            Private messages
          </button>
        </div>
        <div className="nav-item">
          <button
            className={`nav-button-chat ${
              currentTab === ChatAction.ChatExampleLooking ? "active" : ""
            }`}
            onClick={() => handleTabClick(ChatAction.ChatExampleLooking)}
          >
            Chat example looking
          </button>
        </div>
      </div>
      <div className="room">{renderContent()}</div>
    </>
  );
};

export default NavBar;
