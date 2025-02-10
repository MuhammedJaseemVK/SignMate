import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { setUser } from "../redux/features/userSlice";
import { toast } from "react-toastify";
import shuffleArray from "../utils/shuffleArray";

const Quiz = () => {
  const [predictedSign, setPredictedSign] = useState<string>("");
  const [isTargetSignPredicted, setIsTargetSignPredicted] =
    useState<boolean>(false);
  const [showImage, setShowImage] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const wordsForQuiz = ["CAT", "DOG", "BAT"];
  const currentWord = wordsForQuiz[currentWordIndex];

  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const hasLessonCompleteSpoken = useRef<boolean>(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const clientId = useRef(uuidv4());

  useEffect(() => {
    let localStream: MediaStream | null = null;
    let frameIntervalId: NodeJS.Timeout | null = null;

    socketRef.current = new WebSocket(
      `ws://localhost:8000/ws/${clientId.current}`
    );

    socketRef.current.onopen = () => console.log("WebSocket connected");

    socketRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setPredictedSign(data.predicted_sign);

      if (
        currentWord[currentLetterIndex] === data.predicted_sign.toUpperCase()
      ) {
        setCurrentLetterIndex((prevIndex) => prevIndex + 1);
        if (currentLetterIndex + 1 === currentWord.length) {
          toast.success(`Successfully signed ${currentWord}!`);
          setTimeout(() => {
            setCurrentLetterIndex(0);
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % wordsForQuiz.length);
          }, 2000);
        }
      }
    };

    socketRef.current.onclose = () => console.log("WebSocket disconnected");

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
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (frameIntervalId) {
        clearInterval(frameIntervalId);
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (webcamRef.current) {
        webcamRef.current.srcObject = null;
      }
    };
  }, [currentLetterIndex, currentWord]);

  const sendFrameToServer = async () => {
    if (
      webcamRef.current &&
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const video = webcamRef.current;

      if (!ctx || !video.videoWidth || !video.videoHeight) return;

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

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <h2 className="text-4xl font-extrabold dark:text-white">Spell the Word</h2>
      <div className="flex gap-2">
        {currentWord.split("").map((letter, index) => (
          <span
            key={index}
            className={`text-3xl font-bold p-2 rounded-md ${
              index < currentLetterIndex ? "text-green-500" : "text-gray-500"
            }`}
          >
            {letter}
          </span>
        ))}
      </div>
      <h3 className="text-bold text-4xl">Predicted Sign: {predictedSign}</h3>
      <video
        ref={webcamRef}
        autoPlay
        playsInline
        width="640"
        height="480"
        className="rounded-md border-2 border-gray-300"
      />
    </div>
  );
};

export default Quiz;
