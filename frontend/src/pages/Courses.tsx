import React from "react";
import CourseCard from "../components/CourseCard";

type Props = {};

const Courses = (props: Props) => {
  const courses = [
    {
      id: 1,
      title: "ASL Alphabets",
      description: "Learn the ASL alphabets A-Z",
      progress: 40,
    },
    {
      id: 2,
      title: "ASL Numbers",
      description: "Learn ASL numbers from 1-10",
      progress: 70,
    },
    {
      id: 3,
      title: "Common Words",
      description: "Learn common ASL words and phrases",
      progress: 20,
    },
  ];
  return (
    <div className="">
      <h2 className="mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-black">
        My courses
      </h2>
      <div className="flex flex-col gap-4">
        {courses.map((course) => (
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
