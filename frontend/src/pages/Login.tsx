import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { hideLoading, showLoading } from "../redux/features/alertSlice";
import axios from "axios";
import { toast } from "react-toastify";

interface PasswordRules {
  minLength: boolean;
  containsUpper: boolean;
  containsLower: boolean;
  containsNumber: boolean;
  containsSpecial: boolean;
}

type Props = {};

const Login = (props: Props) => {
  const [email, setEmail] = useState<string>("");
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [passwordRules, setPasswordRules] = useState<PasswordRules | null>(
    null
  );
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validatePassword = (password: string): PasswordRules => {
    return {
      minLength: password.length >= 6,
      containsUpper: /[A-Z]/.test(password),
      containsLower: /[a-z]/.test(password),
      containsNumber: /\d/.test(password),
      containsSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const registerHandler = async (e) => {
    try {
      e.preventDefault();
      dispatch(showLoading());
      const input = { email, password };
      const res = await axios.post("/api/v1/user/login", input);
      dispatch(hideLoading());
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        toast.success("Login successfully");
        navigate("/dashboard");
      } else {
        toast.error(res.data.message || "Invalid email or password");
      }
    } catch (error: any) {
      dispatch(hideLoading());
      if (error.response?.status === 400) {
        toast.error("Invalid email or password");
      } else {
        console.error(error);
        toast.error("Something went wrong");
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const passwordHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    const passwordValidityConditions = validatePassword(newPassword);
    setPasswordRules(passwordValidityConditions);
    const isNewPasswordValid = Object.values(passwordValidityConditions).every(
      (rulePassed) => rulePassed === true
    );
    setIsPasswordValid(isNewPasswordValid);
  };

  const emailHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  const passwordRuleMessages: Record<keyof PasswordRules, string> = {
    minLength: "Should be a minimum of 6 characters.",
    containsUpper: "Contains at least one uppercase letter.",
    containsLower: "Contains at least one lowercase letter.",
    containsNumber: "Contains at least one number.",
    containsSpecial: "Contains at least one special symbol.",
  };

  return (
    <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
      <form className="space-y-6">
        <h5 className="text-xl font-medium text-gray-900 dark:text-white">
          Login to your account
        </h5>
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={emailHandler}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="name@company.com"
            required
          />
          {!isEmailValid && (
            <p className="text-red-500">Please enter a valid email address.</p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={passwordHandler}
            placeholder="••••••••"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            required
          />
          {passwordRules && (
            <>
              {Object.entries(passwordRules).find(
                ([_, passed]) => !passed
              )?.[0] && (
                <p className="text-red-500">
                  {
                    passwordRuleMessages[
                      Object.entries(passwordRules).find(
                        ([_, passed]) => !passed
                      )![0] as keyof PasswordRules
                    ]
                  }
                </p>
              )}
            </>
          )}
        </div>
        <button
          type="submit"
          onClick={(e) => registerHandler(e)}
          disabled={!isPasswordValid}
          className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Login
        </button>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-700 hover:underline dark:text-blue-500"
          >
            Signup
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
