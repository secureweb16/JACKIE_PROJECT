import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const Headers = () => {
  const router = useRouter();

  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserName = localStorage.getItem("userName");
      setUserName(storedUserName);
    }
  }, []);
  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("authToken", { path: "" });
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    toast.success("Logout successful!"); 

    router.push("/login");
  };
  return (
    <div>
      <div className="header">
        <div className="text-xl font-semibold">Welcome to Dashboard</div>
        <div className="header_nav">
          <ul >
            <li className="hover:underline">
              <a href="/dashboard">Dashboard</a>
            </li>
            <li className="hover:underline">
              <a href="/report">Reports</a>
            </li>
          </ul>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-lg">{userName || "Guest"}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Headers;
