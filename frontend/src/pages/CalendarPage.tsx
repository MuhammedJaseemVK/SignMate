import React, { useState } from "react";
import Calendar from "react-calendar";
import './CalendarPage.css';
import moment from "moment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  // Get completed lessons from Redux state
  const completedLessons = useSelector(
    (state: any) => state.user.user.completedLessons
  );

  // Convert completedLessons to a map for quick lookup
  const completedDates = new Set(
    completedLessons.map((lesson: any) =>
      moment(lesson.nextReviewDate).format("YYYY-MM-DD")
    )
  );

  // Get lessons due for review on selected date
  const selectedDateString = moment(date).format("YYYY-MM-DD");
  const lessonsForSelectedDate = completedLessons.filter(
    (lesson: any) =>
      moment(lesson.nextReviewDate).format("YYYY-MM-DD") === selectedDateString
  );

  // Check if there are lessons available for today
  const isTodaySelected = selectedDateString === moment().format("YYYY-MM-DD");
  const hasRevisionsToday = isTodaySelected && lessonsForSelectedDate.length > 0;

  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    return completedDates.has(formattedDate) ? "completed-lesson" : "";
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-semibold mb-4">Review Calendar</h2>
      <Calendar
        onChange={(newDate) => setDate(newDate as Date)}
        value={date}
        tileClassName={tileClassName}
      />

      {/* Display lessons for the selected date */}
      <div className="mt-6 p-4 border rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold">
          Revisions for {moment(date).format("MMMM D, YYYY")}
        </h3>
        {lessonsForSelectedDate.length > 0 ? (
          <ul className="list-disc list-inside mt-2">
            {lessonsForSelectedDate.map((lesson: any, index: number) => (
              <li key={index} className="mt-1">
                Lesson ID: {lesson.lessonId} (Course: {lesson.courseId})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-2">No revisions on this day.</p>
        )}
      </div>

      {/* "Revisions for Today" Button */}
      <button
        onClick={() => navigate("today")}
        disabled={!hasRevisionsToday}
        className={`mt-4 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
          hasRevisionsToday
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Revisions for Today
      </button>

      {/* Custom Styles for Highlighting */}
      <style>
        {`
          .completed-lesson {
            background-color: #4caf50 !important;
            color: white !important;
            border-radius: 50%;
          }
        `}
      </style>
    </div>
  );
};

export default CalendarPage;
