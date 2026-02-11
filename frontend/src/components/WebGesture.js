import React, { useEffect, useRef } from "react";

export default function WebGesture() {
  const videoRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { videoRef.current.srcObject = stream; });
  }, []);

  const sendFrame = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    const img = canvas.toDataURL("image/jpeg");
    fetch("/api/web_gesture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: img })
    });
  };

  useEffect(() => {
    const interval = setInterval(sendFrame, 1000);
    return () => clearInterval(interval);
  }, []);

  return <video ref={videoRef} autoPlay width="200" />;
}
