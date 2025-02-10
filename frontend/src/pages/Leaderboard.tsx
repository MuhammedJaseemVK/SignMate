import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

type Props = {};

const Leaderboard = (props: Props) => {
  const [progress, setProgress] = useState([]);
  const { user } = useSelector((state) => state.user);
  useEffect(() => {
    const getLeaderboardData = async () => {
      try {
        // dispatch(showLoading());
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/user/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // dispatch(hideLoading());
        if (res.data.success) {
          const progressData = res.data.data;
          setProgress(progressData);
          // setCourseList(courses);
          //   dispatch(setCourses(courseList));
        }
      } catch (error) {
        // dispatch(hideLoading());
        console.log(error);
      }
    };

    getLeaderboardData();
  }, []);
  return (
    <div className="max-w-2xl w-full">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg flex flex-col gap-4">
      <h2 className="text-4xl font-extrabold dark:text-white">
        Leaderboard
      </h2>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Rank 🥇
              </th>
              <th scope="col" className="px-6 py-3">
                User 👤
              </th>
              <th scope="col" className="px-6 py-3">
                XP points ⭐
              </th>
              <th scope="col" className="px-6 py-3">
                streak 🔥
              </th>
            </tr>
          </thead>
          <tbody>
            {progress.map((userProgress) => (
              <tr
                key={userProgress.rank}
                className={` hover:bg-gray-50 dark:hover:bg-gray-600 transition ${
                    user.name === userProgress.name
                      ? "bg-blue-100 dark:bg-blue-900 border  font-semibold shadow-md "
                      : "bg-white dark:bg-gray-800"
                  }`}
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {userProgress.rank}
                </th>
                <td className="px-6 py-4">{userProgress.name}</td>
                <td className="px-6 py-4">{userProgress.xp} XP</td>
                <td className="px-6 py-4">{userProgress.streak} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
