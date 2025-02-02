import { useEffect, useState } from "react";
import LessonCard from "../components/LessonCard";
import axios from "axios";
import { useParams } from "react-router";

type Lesson={
  id:string,
  title:string,
  image:string
}

const Lessons = () => {
  const { courseId } = useParams();
  const [LessonList,setLessonList] = useState<Lesson[]>([]);

  useEffect(() => {
    const getLessons = async () => {
      try {
        // dispatch(showLoading());
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/v1/lessons/${courseId}`, {
          headers: { "Authorization": `Bearer ${token}` }
      });
        // dispatch(hideLoading());
        if (res.data.success) {
          setLessonList(res.data.data);
        }
      } catch (error) {
        // dispatch(hideLoading());
        console.log(error);
      }
    };

    getLessons();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 mt-10">
      <h1 className="text-3xl font-bold mb-8">ASL Lessons</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {LessonList.map((lesson) => (
          <LessonCard
            key={lesson.id}
            id={lesson.id}
            title={lesson.title}
            image={lesson.image}
          />
        ))}
      </div>
    </div>
  );
};

export default Lessons;
