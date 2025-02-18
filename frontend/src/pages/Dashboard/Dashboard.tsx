import React from 'react';
import WordCloudComponent from '../../components/WordCloudComponent';
import HeatMap from '../../components/Heatmap/Heatmap';
import CalendarPage from '../CalenderPage/CalendarPage';
import './Dashboard.css'
import StatsTable from '../../components/StatsTable';

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="wordcloud-container">
        <WordCloudComponent />
      </div>
      <div className="calendar-container">
        <CalendarPage />
      </div>
      <div className="heatmap-container">
        <HeatMap />
        <StatsTable />
      </div>
    </div>
  );
}

export default Dashboard;