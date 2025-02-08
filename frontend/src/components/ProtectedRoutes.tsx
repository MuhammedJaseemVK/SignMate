import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { hideLoading, showLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const token = localStorage.getItem("token");

  const getUser = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.get("/api/v1/user/getUserData", {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(hideLoading());

      if (res.data.success) {
        dispatch(setUser(res.data.data));
      } else {
        localStorage.clear();
        navigate("/login");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error fetching user:", error);
      localStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!user && token) {
      getUser();
    }
  }, [user, token]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!user) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
