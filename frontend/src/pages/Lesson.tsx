import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { setUser } from "../redux/features/userSlice";

const Lesson = () => {
  const [predictedSign, setPredictedSign] = useState<string>("");
  const [isTargetSignPredicted, setIsTargetSignPredicted] =
    useState<boolean>(false);
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const hasLessonCompleteSpoken = useRef<boolean>(false);
  let frameInterval = null;
  const { courseId, lessonId } = useParams();
  const lessons = useSelector((state) => state.lessons.lessons[courseId] || []);
  const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  const lesson = lessons[lessonIndex];
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const clientId = useRef(uuidv4()); // Generate a unique ID for each user
  const targetSign = lessonId;

  useEffect(() => {
    // Setup WebSocket connection with unique client ID
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
          speakText("Lesson Complete");
          hasLessonCompleteSpoken.current = true;
          markLessonComplete();
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
  }, [lessonId]);

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

  const markLessonComplete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/v1/user/lesson/complete`,
        { lessonId, courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Awarded 10XP for you!");
        const { user } = res.data;
        dispatch(setUser(user));
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }

    setTimeout(() => {
      navigateToNextLesson();
      setIsTargetSignPredicted(false);
      hasLessonCompleteSpoken.current = false;
    }, 3000);
  };

  const navigateToNextLesson = () => {
    const currentIndex = lessons.findIndex(
      (lesson) => lesson.id.toLowerCase() === lessonId
    );
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
      navigate(`/courses/${courseId}/lessons/${lessons[currentIndex + 1].id}`);
    } else {
      navigate(`/courses`);
    }
  };

  return (
    <div className="flex flex-col items-center max-lg gap-4">
      <h2 className="text-xl font-semibold mt-4">{lesson.title}</h2>
      <div className="flex justify-between items-center ">
        <img src={lesson.image} width="480" alt="" />
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
      <h3 className="text-bold text-4xl ">
        {isTargetSignPredicted ? "Moving to next question" : "Keep signing"}
      </h3>
    </div>
  );
};

export default Lesson;
