const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/courses", require("./routes/courseRoutes"));
app.use("/api/v1/lessons", require("./routes/lessonRoutes"));
require("./cron/cronJobs");

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(colors.bgCyan.white(`Server running in ${process.env.NODE_MODE} mode on port ${process.env.PORT}`));
});
