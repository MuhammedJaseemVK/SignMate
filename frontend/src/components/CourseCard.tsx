import React from "react";
import { Link } from "react-router-dom";

type Props = {
  id:string
  title: string;
  progress: number;
  description: string;
};

const CourseCard = ({ id,title, progress, description }: Props) => {
  return (
    <Link
      to={`/courses/${id}/lessons`}
      className="block max-w-2xl p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        {description}
      </p>

      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-blue-700 dark:text-white">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-500">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </Link>
  );
};

export default CourseCard;
