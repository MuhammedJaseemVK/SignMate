import React from "react";
import { useNavigate } from "react-router";

type Props = {
    id: string,
    title: string,
    image: string,
};

const LessonCard = ({id,title,image}: Props) => {
    const navigate = useNavigate();
  return (
    <div
      key={id}
      className="bg-gray-800 p-4 rounded-lg text-center shadow-lg"
    >
      <img
        src={image}
        alt={title}
        className="w-48 h-48 mx-auto rounded-md"
      />
      <h2 className="text-xl font-semibold mt-4">{title}</h2>
      <button
        onClick={() => navigate(`${id}`)}
        className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold"
      >
        Start Lesson
      </button>
    </div>
  );
};

export default LessonCard;
