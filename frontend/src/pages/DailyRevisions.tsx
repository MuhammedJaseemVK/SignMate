import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import axios from "axios";
import { toast } from "react-toastify";
import { setUser } from "../redux/features/userSlice";

const DailyRevisions = () => {
  const [predictedSign, setPredictedSign] = useState("");
  const [isTargetSignPredicted, setIsTargetSignPredicted] = useState(false);
  const [showImage, setShowImage] = useState(false); // State to track if image should be shown
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const hasLessonCompleteSpoken = useRef(false);
  const { user } = useSelector((state) => state.user);
  const [showModal, setShowModal] = useState<boolean>(false);
  const dispatch = useDispatch();

  const completedLessons = user.completedLessons || [];

  const today = moment().format("YYYY-MM-DD");

  const lessonsDueToday = completedLessons.filter((lesson) => {
    const nextReviewDate = moment(lesson.nextReviewDate).format("YYYY-MM-DD");
    return nextReviewDate === today;
  });

  const lessonsAvailableForToday = lessonsDueToday.map((lesson) => ({
    sign: lesson.lessonId,
    image: lesson.image,
  }));

  const [quizIndex, setQuizIndex] = useState(0);
  const progress = (quizIndex / lessonsAvailableForToday.length) * 100;
  const quizNumber = `${quizIndex + 1} / ${lessonsAvailableForToday.length}`;

  const navigate = useNavigate();
  const clientId = useRef(uuidv4());
  const targetSign = lessonsAvailableForToday[quizIndex].sign;
  const targetSignImage = lessonsAvailableForToday[quizIndex].image;

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
        targetSign === data.predicted_sign.toLowerCase() &&
        !isTargetSignPredicted
      ) {
        setIsTargetSignPredicted(true);
        if (!hasLessonCompleteSpoken.current) {
          speakText("Right answer");
          hasLessonCompleteSpoken.current = true;
          setShowModal(true);
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
      if (socketRef.current) socketRef.current.close();
      if (frameIntervalId) clearInterval(frameIntervalId);
      if (localStream) localStream.getTracks().forEach((track) => track.stop());
      if (webcamRef.current) webcamRef.current.srcObject = null;
    };
  }, [quizIndex, targetSign]);

  const sendFrameToServer = async () => {
    if (!webcamRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const video = webcamRef.current;
    if (!ctx || !video.videoWidth || !video.videoHeight) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) =>
        blob &&
        blob.arrayBuffer().then((buffer) => socketRef.current.send(buffer)),
      "image/jpeg",
      0.6
    );
  };

  const speakText = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
  };

  const navigateToNextQuiz = () => {
    const availableQuizLength = lessonsAvailableForToday.length;
    if (quizIndex + 1 >= availableQuizLength) {
      navigate("/dashboard");
    } else {
      setQuizIndex(quizIndex + 1);
    }
  };

  const toggleImageVisibility = () => {
    setShowImage((prev) => !prev); // Toggle the image visibility
  };

  const markRevisionAsCompleted = async (difficulty: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/v1/user/update-revision`,
        { lessonId: targetSign, difficulty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Awarded 20XP for you!");
        const { user } = res.data;
        dispatch(setUser(user));
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
    navigateToNextQuiz();
    setShowModal(false);
    setIsTargetSignPredicted(false);
    hasLessonCompleteSpoken.current = false;
  };

  return (
    <div className="flex flex-col items-center max-lg gap-4">
      <h2 className="text-xl font-semibold mt-4">
        Sign - {targetSign?.toUpperCase()}
      </h2>

      <div className="flex justify-between items-center ">
        {/* Conditionally render the image based on showImage state */}
        {showImage && <img src={targetSignImage} width="480" alt="" />}
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
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
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

      {/* **Modal Implementation** */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg dark:text-white dark:bg-gray-900 text-black m-6">
            <h2 className="text-lg font-semibold mb-4 text-center">How was it?</h2>
            <div className="flex gap-4">
              <button
                onClick={() => markRevisionAsCompleted("easy")}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Easy
              </button>
              <button
                onClick={() => markRevisionAsCompleted("medium")}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Medium
              </button>
              <button
                onClick={() => markRevisionAsCompleted("difficult")}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Hard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyRevisions;
