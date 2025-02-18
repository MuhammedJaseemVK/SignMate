import React from "react";
import WordCloud from "react-wordcloud";
import generateRandomNumber from "../utils/generateRandomNumber";
import { useSelector } from "react-redux";

const words = [
  { text: "A", value: 100 },
  { text: "B", value: 50 },
  { text: "C", value: 70 },
  { text: "D", value: 40 },
  { text: "E", value: 35 },
  { text: "Cat", value: 30 },
  { text: "Bat", value: 25 },
  { text: "Dog", value: 20 },
  { text: "Don", value: 15 },
];

const options = {
  rotations: 3,
  rotationAngles: [-90, 0, 90],
  fontSizes: [20, 60],
  deterministic: false,
  enableTooltip: false,
  padding: 5,
  scale: "log",
  spiral: "archimedean",
};

const WordCloudComponent = () => {
  const { user } = useSelector((state) => state.user);
  const lessonsLearnt = user.completedLessons.map((lesson) => ({
    text: lesson.lessonId,
    value: generateRandomNumber(),
  }));
  return (
    <div>
      <h4 className="text-black dark:text-white">Lessons learnt</h4>
      <WordCloud words={lessonsLearnt} options={options} />
    </div>
  );
};

export default WordCloudComponent;
