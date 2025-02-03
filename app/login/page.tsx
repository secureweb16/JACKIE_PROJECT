"use client"
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation"; 
import Cookies from 'js-cookie';
import { toast, Toaster } from 'react-hot-toast'; 
export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter(); 

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError(""); 

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success === true) {
        toast.success("Login successful!");  
        localStorage.setItem("userId", data.user.userId);
        localStorage.setItem("userName", data.user.username);
        localStorage.setItem("authToken", data.token);
        Cookies.set('authToken', data.token, { expires: 1/3 });
        router.replace("/dashboard"); 
      } else {
        toast.error("Invalid credentials. Please try again.");  
        setError("Invalid credentials. Please try again.");
        setTimeout(() => setError(""), 5000);

      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again later.");  
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <><div><Toaster /></div><div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md m-2">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Login</h1>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required />
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div></>
  );
}

