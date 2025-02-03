"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };
  useEffect(() => {
    const checkAuth = async () => {

       const token = getCookie("authToken");
      const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/register";

      if (!token && !isAuthPage) {
        router.push("/login");
      } 
      if(!token && isAuthPage) {
        return;
      }
      if(token && isAuthPage) {
        router.push("/dashboard");
      }
  
    };

   
   checkAuth();
   const interval = setInterval(checkAuth, 60000); 

   return () => clearInterval(interval); 

  }, [router]); // Run this effect when the router object is ready

  return <>{children}</>;
}
