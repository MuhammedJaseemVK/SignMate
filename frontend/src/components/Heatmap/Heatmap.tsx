import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useSelector } from "react-redux";
import { Tooltip } from "react-tooltip";

const today = new Date();

export default function Heatmap() {
  const { user } = useSelector((state) => state.user);
  const completedLessons = user?.completedLessons;

  const lessonCountPerDate = completedLessons?.reduce((acc, lesson) => {
    const completedDate = new Date(lesson.completedAt);
    const dateString = completedDate.toISOString().slice(0, 10);
    if (acc[dateString]) {
      acc[dateString]++;
    } else {
      acc[dateString] = 1;
    }
    return acc;
  }, {});

  const randomValues = getRange(200).map((index) => {
    const date = shiftDate(today, -index);
    const dateString = date.toISOString().slice(0, 10);
    const count = lessonCountPerDate?.[dateString] || 0;
    return {
      date: date,
      count: count,
    };
  });

  return (
    <div className="w-[500px]">
      <h1>Learning Heatmap</h1>
      <CalendarHeatmap
        startDate={shiftDate(today, -150)}
        endDate={today}
        values={randomValues}
        classForValue={(value) => {
          if (!value) {
            return "color-empty";
          }
          return `color-github-${value.count}`;
        }}
        tooltipDataAttrs={(value) => {
          if (!value || !value.date) {
            return {};
          }
          return {
            "data-tooltip-id": "heatmap-tooltip",
            "data-tooltip-content": `${value.date
              .toISOString()
              .slice(0, 10)} has count: ${value.count}`,
          };
        }}
        showWeekdayLabels={true}
      />
      <Tooltip id="heatmap-tooltip" />
    </div>
  );
}

function shiftDate(date, numDays) {
  const newDate = new Date(date);
  newDate.setUTCDate(newDate.getUTCDate() + numDays);
  newDate.setUTCHours(0, 0, 0, 0);
  return newDate;
}

function getRange(count) {
  return Array.from({ length: count }, (_, i) => i);
}
