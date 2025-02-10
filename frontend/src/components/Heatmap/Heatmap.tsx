import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useSelector } from 'react-redux';

const today = new Date();

export default function Heatmap() {
  const { user } = useSelector((state) => state.user); // Get the user data from Redux
  const completedLessons = user?.completedLessons;

  // Count lessons completed per date
  const lessonCountPerDate = completedLessons?.reduce((acc, lesson) => {
    const completedDate = new Date(lesson.completedAt);
    const dateString = completedDate.toISOString().slice(0, 10);
    console.log({ dateString }); // Format date as 'YYYY-MM-DD'

    if (acc[dateString]) {
      acc[dateString]++;
    } else {
      acc[dateString] = 1;
    }
    return acc;
  }, {});

  // Prepare the values for the heatmap
  const randomValues = getRange(200).map((index) => {
    const date = shiftDate(today, -index);
    const dateString = date.toISOString().slice(0, 10);
    const count = lessonCountPerDate?.[dateString] || 0; // Get count for the date, default to 0 if not found
    return {
      date: date,
      count: count,
    };
  });

  return (
    <div className='w-[500px]'>
      <h1>Learning Heatmap</h1>
      <CalendarHeatmap
        startDate={shiftDate(today, -150)}
        endDate={today}
        values={randomValues}
        classForValue={(value) => {
          if (!value) {
            return 'color-empty';
          }
          return `color-github-${value.count}`;
        }}
        tooltipDataAttrs={(value) => {
            if (!value || !value.date) {
              return {}; // Return an empty object if the value or date is null/undefined
            }
            return {
              'data-tip': `${value.date.toISOString().slice(0, 10)} has count: ${value.count}`,
            };
          }}
        showWeekdayLabels={true}
        onClick={(value) => alert(`Clicked on value with count: ${value.count}  on ${value.date}`)}
      />
    </div>
  );
}

// Fix shiftDate to handle UTC midnight properly
function shiftDate(date, numDays) {
  const newDate = new Date(date);
  newDate.setUTCDate(newDate.getUTCDate() + numDays); // Use setUTCDate to avoid local timezone issues
  newDate.setUTCHours(0, 0, 0, 0); // Ensure the time is set to midnight UTC
  return newDate;
}

function getRange(count) {
  return Array.from({ length: count }, (_, i) => i);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
