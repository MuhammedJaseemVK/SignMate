import { createSlice } from "@reduxjs/toolkit";

export const lessonsSlice = createSlice({
  name: "lessons",
  initialState: {
    lessons: {},
  },
  reducers: {
    setLessons: (state, action) => {
      const { courseId, lessons } = action.payload;
      state.lessons[courseId] = lessons;
    },
  },
});

export const { setLessons } = lessonsSlice.actions;
export default lessonsSlice.reducer;
