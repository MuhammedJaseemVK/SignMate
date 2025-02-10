import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 p-5 dark:bg-slate-900 bg-white text-black dark:text-white flex justify-center">
        <div className="w-full max-w-6xl flex flex-col items-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
