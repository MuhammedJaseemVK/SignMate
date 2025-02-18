import React from "react";
import HeatMap from "../components/Heatmap/Heatmap";
import WordCloudComponent from "../components/WordCloudComponent";

type Props = {};

const Dashboard = (props: Props) => {
  return (
    <div className="">
      <HeatMap />
      <WordCloudComponent />
    </div>
  );
};

export default Dashboard;
