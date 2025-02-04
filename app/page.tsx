"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null; // Ensure it's client-side
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const token = getCookie("authToken");

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, []);

  return null; // Empty component since it redirects immediately
}
