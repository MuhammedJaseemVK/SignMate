import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import axios from "axios";

type Props = {};

type Course ={
  id:string,
  title:string,
  description:string,
  progress:number
}

const Courses = (props: Props) => {
  const [courseList,setCourseList] =useState<Course[]>([]);

  useEffect(() => {
    const getCourses = async () => {
      try {
        // dispatch(showLoading());
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/courses/', {
          headers: { "Authorization": `Bearer ${token}` }
      });
        // dispatch(hideLoading());
        if (res.data.success) {
          setCourseList(res.data.data);
        }
      } catch (error) {
        // dispatch(hideLoading());
        console.log(error);
      }
    };

    getCourses();
  }, []);
  return (
    <div className="">
      <h2 className="mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-black">
        My courses
      </h2>
      <div className="flex flex-col gap-4">
        {courseList.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description}
            progress={course.progress}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;
