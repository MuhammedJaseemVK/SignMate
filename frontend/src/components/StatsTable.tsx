import React from "react";
import { useSelector } from "react-redux";

const StatsTable = () => {
    const {user}= useSelector(state=>state.user);
    const xp = user?.xp;
    const maxStreak = user?.maxStreak;
    const streak = user?.streak;
  return (
    <div className="stats-table-container">
      <table className="stats-table">
        <tbody>
          <tr>
            <td>XP</td>
            <td>{xp} ⭐️</td>
          </tr>
          <tr>
            <td>Streak</td>
            <td>{streak} 🔥</td>
          </tr>
          <tr>
            <td>Max Streak</td>
            <td>{maxStreak}🔥🔥 </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;
