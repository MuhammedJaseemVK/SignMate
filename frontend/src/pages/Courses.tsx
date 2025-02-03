import { useEffect } from "react";
import CourseCard from "../components/CourseCard";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setCourses } from '../redux/features/coursesSlice';

type Props = {};

type Course ={
  id:string,
  title:string,
  description:string,
  progress:number
}

const Courses = (props: Props) => {
  const {courses} = useSelector(state=>state.courses);
  const dispatch = useDispatch();

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
          const courseList =res.data.data;
          // setCourseList(courses);
          dispatch(setCourses(courseList));
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
        {courses.map((course:Course) => (
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
