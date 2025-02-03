import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Lesson = () => {
  const [predictedSign, setPredictedSign] = useState<string>("");
  const [isTargetSignPredicted, setIsTargetSignPredicted] =
    useState<boolean>(false);
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const hasLessonCompleteSpoken = useRef<boolean>(false);
  let frameInterval = null;

  const clientId = useRef(uuidv4()); // Generate a unique ID for each user
  const targetSign = "A";

  useEffect(() => {
    // Setup WebSocket connection with unique client ID
    socketRef.current = new WebSocket(
      `ws://localhost:8000/ws/${clientId.current}`
    );

    socketRef.current.onopen = () => console.log("WebSocket connected");
    socketRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setPredictedSign(data.predicted_sign);
      if (targetSign === data.predicted_sign && !isTargetSignPredicted) {
        setIsTargetSignPredicted(true);
        if(!hasLessonCompleteSpoken.current){
          speakText("Lesson Complete");
          hasLessonCompleteSpoken.current=true;
        }
      }
    };

    socketRef.current.onclose = () => console.log("WebSocket disconnected");

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (frameInterval) {
        clearInterval(frameInterval);
      }
    };
  }, []);

  const sendFrameToServer = async () => {
    if (webcamRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const video = webcamRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          blob.arrayBuffer().then((buffer) => {
            socketRef.current.send(buffer);
          });
        },
        "image/jpeg",
        0.6
      ); // Compress image for faster transmission
    }
  };

  const startWebcam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcamRef.current.srcObject = stream;

    // Send frames every 300ms for real-time performance
    frameInterval = setInterval(sendFrameToServer, 300);
  };

  useEffect(() => {
    startWebcam();
  }, []);

  const speakText = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="flex flex-col items-center max-lg gap-4">
      <div className="flex justify-between items-center ">
        <img
          src="https://lifeprint.com/asl101/fingerspelling/abc-gifs/a.gif"
          width="480"
          alt=""
        />
        <div style={{ position: "relative", textAlign: "center" }}>
          <video
            ref={webcamRef}
            autoPlay
            playsInline
            width="640"
            height="480"
          />
          <h1
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              fontSize: "24px",
            }}
          >
            Predicted Sign: {predictedSign}
          </h1>
        </div>
      </div>
      <button
        className={`${
          isTargetSignPredicted ? "bg-green-500" : "bg-red-500"
        } px-4 py-2 rounded-md text-white`}
        disabled={!isTargetSignPredicted}
      >
        Continue
      </button>
    </div>
  );
};

export default Lesson;
