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
  const [showImage, setShowImage] = useState(false); // State to track if image should be shown
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const hasLessonCompleteSpoken = useRef<boolean>(false);
  const { user } = useSelector((state) => state.user);
  const lessonsAvailable = user.completedLessons.map((lesson) => ({
    sign: lesson.lessonId,
    image: lesson.image,
  }));
  const lessonsAvailableForQuiz = shuffleArray(lessonsAvailable);
  const [quizindex, setQuizindex] = useState<number>(0);
  const progress = Math.round(
    (quizindex + 1 / lessonsAvailableForQuiz.length) * 100
  );
  const quizNumber = `${quizindex + 1} / ${lessonsAvailableForQuiz.length}`;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const clientId = useRef(uuidv4()); // Generate a unique ID for each user
  const targetSign = lessonsAvailableForQuiz[quizindex].sign;
  const targetSignImage = lessonsAvailableForQuiz[quizindex].image;

  useEffect(() => {
    let localStream: MediaStream | null = null;
    let frameIntervalId: NodeJS.Timeout | null = null;

    // Setup WebSocket connection
    socketRef.current = new WebSocket(
      `ws://localhost:8000/ws/${clientId.current}`
    );

    socketRef.current.onopen = () => console.log("WebSocket connected");

    socketRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setPredictedSign(data.predicted_sign);
      if (
        targetSign === data.predicted_sign.toLowerCase() &&
        !isTargetSignPredicted
      ) {
        setIsTargetSignPredicted(true);
        if (!hasLessonCompleteSpoken.current) {
          speakText("Right answer");
          hasLessonCompleteSpoken.current = true;
          awardXP();
        }
      }
    };

    socketRef.current.onclose = () => console.log("WebSocket disconnected");

    // Start the webcam and send frames
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        localStream = stream;
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }

        // Send frames every 300ms
        frameIntervalId = setInterval(sendFrameToServer, 300);
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();

    return () => {
      // Cleanup WebSocket
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Stop sending frames
      if (frameIntervalId) {
        clearInterval(frameIntervalId);
      }

      // Stop webcam stream
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      if (webcamRef.current) {
        webcamRef.current.srcObject = null;
      }
    };
  }, []);

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
      ); // Compress image for faster transmission
    }
  };

  const toggleImageVisibility = () => {
    setShowImage((prev) => !prev); // Toggle the image visibility
  };

  const speakText = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
  };

  const awardXP = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/v1/user/award-xp",
        { xpPoints: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        console.log("XP awarded successfully");
        toast.success("Awarded 10XP for you!");
        dispatch(setUser(res.data.user));
      } else {
        console.log("Failed to award XP");
      }
    } catch (error) {
      console.error("Error awarding XP:", error);
    }

    setTimeout(() => {
      navigateToNextQuiz();
      setIsTargetSignPredicted(false);
      hasLessonCompleteSpoken.current = false;
    }, 3000);
  };

  const navigateToNextQuiz = () => {
    const avaiableQuizLength = lessonsAvailableForQuiz.length;
    const currentIndex = quizindex + 1;
    if (currentIndex > avaiableQuizLength - 1) {
      navigate("/dashboard");
    } else {
      setQuizindex(currentIndex);
    }
  };

  return (
    <div className="flex flex-col items-center max-lg gap-4 h-full">
      <h2 className="text-4xl font-extrabold dark:text-white">
        Sign - {targetSign.toUpperCase()}
      </h2>
      <div className="flex justify-between items-center ">
        {/* Conditionally render the image based on showImage state */}
        {showImage && <img src={targetSignImage} className="rounded-md" width="480" alt="" />}
        <div style={{ position: "relative", textAlign: "center" }}>
          <video
            ref={webcamRef}
            autoPlay
            playsInline
            width="640"
            height="480"
            className={`rounded-md transition-all duration-300 ${
              isTargetSignPredicted
                ? "border-4 border-green-500"
                : "border-none"
            }`}
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
      <h3 className="text-bold text-4xl ">
        {isTargetSignPredicted ? "Moving to next question" : "Keep signing"}
      </h3>
      {/* Help button to show the image */}
      <button
        className="w-md text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={toggleImageVisibility}
      >
        {showImage ? "Hide Image" : "Need help"}
      </button>

      <div className="flex w-[640px] gap-2 items-center">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-blue-700 dark:text-white font-bold">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 ">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-sm text-blue-700 dark:text-white font-bold whitespace-nowrap min-w-fit">
            {quizNumber}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
