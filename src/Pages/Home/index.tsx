import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../hooks/context";
import { lazy, Suspense, useContext, useEffect, useRef, useState } from "react";
import VideoPlayer from "../../components/videoPlayer";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const Home = ({ socket }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("userName", userName);
    socket.emit("newUser", { userName, socketID: socket.id });
    navigate("/chat");
  };
  return (
    <div>
      {/* <div className="App">
        {loading && <div>Loading...</div>}
        <VideoPlayer
          myVideoRef={myVideo}
          userVideoRef={userVideo}
          stream={stream}
          answerCall={answerCall}
        />

        <button onClick={() => callUser()}>Call</button>
      </div> */}
      <form className="home__container" onSubmit={handleSubmit}>
        <h2 className="home__header">Sign in to Open Chat</h2>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          minLength={6}
          name="username"
          id="username"
          className="username__input"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button className="home__cta">SIGN IN</button>
      </form>
    </div>
  );
};

export default Home;
