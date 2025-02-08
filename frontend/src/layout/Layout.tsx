import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <div className="w-full min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center m-5">
        <Outlet />
      </div>
    </div>
  );
}
