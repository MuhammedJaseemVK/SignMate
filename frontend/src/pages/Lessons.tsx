import { useEffect, useState } from "react";
import LessonCard from "../components/LessonCard";
import axios from "axios";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setLessons } from "../redux/features/lessonsSlice";

type Lesson = {
  id: string;
  title: string;
  image: string;
};

const Lessons = () => {
  const { courseId } = useParams();
  const lessons = useSelector((state) => state.lessons.lessons[courseId] || []);
  const { courses } = useSelector((state) => state.courses);
  const courseInfo = courses.find((course) => course.id === courseId);
  const [learnedLessons, setLearnedLessons] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const getLessons = async () => {
      try {
        // dispatch(showLoading());
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/v1/lessons/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // dispatch(hideLoading());
        if (res.data.success) {
          const lessons = { courseId, lessons: res.data.data };
          dispatch(setLessons(lessons));
        }
      } catch (error) {
        // dispatch(hideLoading());
        console.log(error);
      }
    };

    const getUserProgress = async () => {
      try {
        // dispatch(showLoading());
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/v1/user/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // dispatch(hideLoading());
        if (res.data.success) {
          const learnedLessonsData = res.data.data.completedLessons;
          const learnedLessonIds = learnedLessonsData.map(
            (lessonData) => lessonData.lessonId
          );
          setLearnedLessons(learnedLessonIds);
          // dispatch(setLessons(lessons));
        }
      } catch (error) {
        // dispatch(hideLoading());
        console.log(error);
      }
    };
    if (lessons.length === 0) {
      getLessons();
    }
    getUserProgress();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <h2 className="text-4xl font-extrabold dark:text-white">
        {courseInfo.title}
      </h2>
      <p className="my-4 text-lg text-gray-500">Course :{courseInfo.id}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {lessons.map((lesson: Lesson) => (
          <LessonCard
            key={lesson.id}
            id={lesson.id}
            title={lesson.title}
            image={lesson.image}
            isRelearn={learnedLessons?.includes(lesson.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Lessons;
