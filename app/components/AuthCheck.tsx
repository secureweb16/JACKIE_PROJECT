"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = document.cookie.includes("authToken"); 

      if (!token) {
        router.push("/login");
      }
    };

    checkAuth(); 
    const interval = setInterval(checkAuth, 60000); 

    return () => clearInterval(interval); 
  }, [router]);

  return <>{children}</>;
}
