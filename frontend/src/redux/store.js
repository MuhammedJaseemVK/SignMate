import { configureStore } from "@reduxjs/toolkit";
import { alertSlice } from "../redux/features/alertSlice";
import { userSlice } from "./features/userSlice";
import { coursesSlice } from "./features/coursesSlice";
import { lessonsSlice } from "./features/lessonsSlice";

export default configureStore({
  reducer: {
    alerts: alertSlice.reducer,
    user: userSlice.reducer,
    courses: coursesSlice.reducer,
    lessons: lessonsSlice.reducer
  },
});
