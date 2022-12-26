import React, { useContext, useEffect } from "react";

export default function VideoPlayer({ myVideoRef, userVideoRef, stream }) {
  return (
    <div>
      <div>
        <video ref={myVideoRef} playsInline autoPlay />
      </div>
      <div>
        <video ref={userVideoRef} playsInline autoPlay />
      </div>
    </div>
  );
}
