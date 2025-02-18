import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { setUser } from "../redux/features/userSlice";
import { toast } from "react-toastify";
import axios from "axios";
const FingerSpelling = () => {
  const [currentWord, setCurrentWord] = useState("HELLO");
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [predictedSign, setPredictedSign] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const clientId = useRef(uuidv4());
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const targetLetter = currentWord[currentLetterIndex]?.toUpperCase();
  const progress = (currentLetterIndex / currentWord.length) * 100;
  const targetSignImage = `https://lifeprint.com/asl101/fingerspelling/abc-gifs/${targetLetter.toLowerCase()}.gif`;
  useEffect(() => {
    let localStream = null;
    let frameIntervalId = null;
    socketRef.current = new WebSocket(
      `ws://localhost:8000/ws/${clientId.current}`
    );
    socketRef.current.onopen = () => console.log("WebSocket connected");
    socketRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setPredictedSign(data.predicted_sign);
      if (
        targetLetter === data.predicted_sign.toUpperCase() &&
        !guessedLetters.includes(currentLetterIndex)
      ) {
        handleCorrectGuess();
      }
    };
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        localStream = stream;
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }

        frameIntervalId = setInterval(sendFrameToServer, 300);
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };
    startWebcam();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (frameIntervalId) clearInterval(frameIntervalId);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (webcamRef.current) {
        webcamRef.current.srcObject = null;
      }
    };
  }, [currentLetterIndex]);
  const sendFrameToServer = async () => {
    if (webcamRef.current && socketRef.current?.readyState === WebSocket.OPEN) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const video = webcamRef.current;
      if (!ctx || !video.videoWidth) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            blob.arrayBuffer().then((buffer) => {
              socketRef.current?.send(buffer);
            });
          }
        },
        "image/jpeg",
        0.6
      );
    }
  };
  const handleCorrectGuess = async () => {
    const newGuessedLetters = [...guessedLetters, currentLetterIndex];
    setGuessedLetters(newGuessedLetters);
    toast.success(`Correct! You signed "${targetLetter}"`);
    if (currentLetterIndex < currentWord.length - 1) {
      setCurrentLetterIndex((prev) => prev + 1);
    } else {
      await awardXP();
      handleWordComplete();
    }
  };
  const handleWordComplete = () => {
    toast.success(`Congratulations! You completed the word "${currentWord}"!`);
    // Here you could add logic to move to the next word
    navigate("/dashboard");
  };
  const awardXP = async () => {
    if (!showHint) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "/api/v1/user/award-xp",
          { xpPoints: 10 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          toast.success("Awarded 10XP!");
          dispatch(setUser(res.data.user));
        }
      } catch (error) {
        console.error("Error awarding XP:", error);
      }
    }
  };
  const renderWordDisplay = () => {
    return currentWord.split("").map((letter, index) => (
      <div
        key={index}
        className={`inline-block mx-1 text-4xl font-bold border-b-4 border-gray-400 min-w-[40px]
text-center
${guessedLetters.includes(index) ? "text-green-500" : "text-transparent"}`}
      >
        {letter.toUpperCase()}
      </div>
    ));
  };
  return (
    <div className="flex flex-col items-center max-lg gap-4 h-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Finger Spell: {currentWord}</h2>
        <div className="text-xl mb-4">
          Sign the letter:{" "}
          <span className="font-bold text-2xl">{targetLetter}</span>
        </div>
        <div className="mb-8 flex justify-center space-x-2">
          {renderWordDisplay()}
        </div>
      </div>
      <div className="flex relative">
      {showHint && (
          <div className="text-center bg-gray-100 rounded-lg">
            <img
              src={targetSignImage}
              className="rounded-md"
              width="480"
              alt=""
            />
          </div>
        )}
        <video
          ref={webcamRef}
          autoPlay
          playsInline
          width="640"
          height="480"
          className={`rounded-lg ${
            guessedLetters.includes(currentLetterIndex)
              ? "border-green-500"
              : "border-gray-300"
          }`}
        />
        <div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white
px-4 py-2 rounded"
        >
          Predicted Sign: {predictedSign}
        </div>
      </div>
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-2">
          <div className="text-sm font-medium">{Math.round(progress)}%</div>
          <div className="flex-1 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm font-medium">
            {currentLetterIndex + 1}/{currentWord.length}
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowHint(!showHint)}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-
colors"
      >
        {showHint ? "Hide Hint" : "Show Hint"}
      </button>
    </div>
  );
};
export default FingerSpelling;
