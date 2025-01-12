import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Layout from "./layout/Layout";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import PublicRoute from "./components/PublicRoute";

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
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
