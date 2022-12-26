import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  ReactFragment,
  RefObject,
  useContext,
} from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
// @ts-ignore
const SocketContext = createContext();

const socket = io("http://localhost:5000");
// const socket = io("localhost:5000");
const useSocket = () => useContext(SocketContext);
const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");
  const [loading, setLoading] = useState(false);
  const myVideo = useRef<HTMLVideoElement>();
  const userVideo = useRef<HTMLVideoElement>();
  const connectionRef = useRef<any>();
  // @ts-ignore
  useEffect(() => {
    socket.on("me", (id) => setMe(id));
    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const askForPermision = () => {
    setLoading(true);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setLoading(false);

        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      });
  };
  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      // @ts-ignore
      socket.emit("answerCall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });
    // @ts-ignore
    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    askForPermision();
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    // @ts-ignore
    connectionRef.current.destroy();

    window.location.reload();
  };

  const sendMessage = (message) => {
    socket.emit("message", {
      text: message,
      name: localStorage.getItem("userName"),
      id: `${socket.id}${Math.random()}`,
      socketID: socket.id,
    });
    socket.emit("typing", "");
  };

  const typing = () => {
    socket.emit("typing", `${localStorage.getItem("userName")} is typing`);
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
        loading,
        sendMessage,
        typing,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
export default useSocket;
export { ContextProvider, SocketContext };
