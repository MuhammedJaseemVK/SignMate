import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { setUser } from "../redux/features/userSlice";
import { setCourses } from "../redux/features/coursesSlice";
import { setLessons } from "../redux/features/lessonsSlice";
import { NavLink } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] =
    useState(false);
  const [isMobileMenuDropdownVisible, setIsMobileMenuDropdownVisible] =
    useState(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userMenu = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "Quiz", path: "/quiz" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Leaderboard", path: "/leaderboard" },
  ];

  const logoutHandler = () => {
    localStorage.removeItem("token");
    setUser(null);
    setCourses([]);
    setLessons({});
    navigate("/");
  };

  const toggleDropdown = (dropdownName: string) => {
    if (dropdownName === "profile") {
      setIsProfileDropdownVisible(!isProfileDropdownVisible);
      setIsMobileMenuDropdownVisible(false);
    } else if (dropdownName === "mobile") {
      setIsMobileMenuDropdownVisible(!isMobileMenuDropdownVisible);
      setIsProfileDropdownVisible(false);
    }
  };

  const authenticateUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await axios.get("/api/v1/user/getUserData", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          dispatch(setUser(res.data.data)); // Set user data in Redux
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error authenticating user:", error);
        localStorage.removeItem("token");
      }
    }
  };

  useEffect(() => {
    if (!user) {
      authenticateUser();
    }
  }, [user]);

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          to="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Flowbite Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            SignMate
          </span>
        </Link>
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {user ? (
            <button
              type="button"
              onClick={() => toggleDropdown("profile")}
              className="relative flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              id="user-menu-button"
              aria-expanded={isProfileDropdownVisible ? "true" : "false"}
            >
              <span className="sr-only">Open user menu</span>
              <img
                className="w-8 h-8 rounded-full"
                src="https://cdn-icons-png.flaticon.com/512/219/219988.png"
                alt="user photo"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Get started
            </button>
          )}
          {/* Profile Dropdown */}
          {isProfileDropdownVisible && (
            <div
              className="absolute top-14 right-16 z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600"
              id="user-dropdown"
            >
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900 dark:text-white">
                  {user.name}
                </span>
                <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">
                  {user.email}
                </span>
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
                <li>
                  <p
                    onClick={logoutHandler}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Sign out
                  </p>
                </li>
              </ul>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            data-collapse-toggle="navbar-user"
            type="button"
            onClick={() => toggleDropdown("mobile")}
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-user"
            aria-expanded={isMobileMenuDropdownVisible ? "true" : "false"}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        {/* Desktop Menu */}
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMobileMenuDropdownVisible ? "block" : "hidden"
          }`}
          id="navbar-user"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {user &&
              userMenu.map((userMenuItem, index) => (
                <li key={index}>
                  <NavLink
                    to={userMenuItem.path}
                    className={({ isActive }) =>
                      isActive
                        ? "block py-2 px-3 text-blue-700 md:bg-transparent md:text-blue-700 md:p-0 dark:text-blue-500  md:dark:text-blue-500"
                        : "block py-2 px-3 text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                    }
                  >
                    {userMenuItem.name}
                  </NavLink>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
