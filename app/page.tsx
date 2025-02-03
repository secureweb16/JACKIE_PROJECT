
"use client";
import { redirect } from 'next/navigation';

export default function Home() {
  const token = localStorage.getItem('authToken');

  if (token) {
    redirect('/dashboard');
  }
  redirect('/login');
}
