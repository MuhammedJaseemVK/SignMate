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
  const lessons = useSelector((state) => state.lessons.lessons[courseId] ||[]);
  const {courses} = useSelector(state => state.courses);
  const courseInfo = courses.find(course=>course.id === courseId);
  const [learnedLessons,setLearnedLessons] = useState([]);
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
          const learnedLessonsData =  res.data.data.completedLessons;
          const learnedLessonIds = learnedLessonsData.map((lessonData)=>lessonData.lessonId);
          setLearnedLessons(learnedLessonIds);
          // dispatch(setLessons(lessons));
        }
      } catch (error) {
        // dispatch(hideLoading());
        console.log(error);
      }
    };
    if (lessons.length===0) {
      getLessons();
    }
    getUserProgress();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 mt-10">
      <h1 className="text-3xl font-bold">{courseInfo.title}</h1>
      <h1 className="text-md text-gray-50 mb-8">{courseInfo.id}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
