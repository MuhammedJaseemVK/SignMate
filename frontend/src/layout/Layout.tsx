import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <div className="w-full">
      <Navbar />
      <div className="flex w-full justify-center items-center h-screen">
        <Outlet />
      </div>
    </div>
  );
}
