import React, { useEffect, useState } from "react";
import useSocket from "../../hooks/context";

const ChatFooter = ({ socket }) => {
  const [message, setMessage] = useState("");
  const { sendMessage, typing }: any = useSocket();
  const handleTyping = () => typing();
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && localStorage.getItem("userName")) {
      sendMessage(message);
    }
    setMessage("");
  };
  return (
    <div className="chat__footer">
      <form className="form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Write message"
          className="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
        />
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};

export default ChatFooter;
