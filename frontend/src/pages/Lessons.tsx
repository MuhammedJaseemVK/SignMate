import React from "react";
import { useNavigate } from "react-router-dom";
import LessonCard from "../components/LessonCard";

const lessons = [
  {
    id: "a",
    title: "Sign A",
    image: "https://lifeprint.com/asl101/fingerspelling/abc-gifs/a.gif",
  },
  {
    id: "b",
    title: "Sign B",
    image: "https://lifeprint.com/asl101/fingerspelling/abc-gifs/b.gif",
  },
  {
    id: "c",
    title: "Sign C",
    image: "https://lifeprint.com/asl101/fingerspelling/abc-gifs/c.gif",
  },
];

const Lessons = () => {

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-8">ASL Lessons</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
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
