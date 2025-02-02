import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Layout from "./layout/Layout";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import PublicRoute from "./components/PublicRoute";
import Lesson from "./pages/Lesson";
import ProtectedRoute from "./components/ProtectedRoutes";
import Courses from "./pages/Courses";
import Lessons from "./pages/Lessons";

function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route
              index
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              }
            />
            <Route
              path="register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="courses"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses/:courseId/lessons"
              element={
                <ProtectedRoute>
                  <Lessons />
                </ProtectedRoute>
              }
            />
              <Route
                path="courses/:courseId/lessons/:lessonId"
                element={
                  <ProtectedRoute>
                    <Lesson />
                  </ProtectedRoute>
                }
              />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
