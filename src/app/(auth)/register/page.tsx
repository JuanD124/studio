'use client';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

// This page is not used in the new authentication system.
// It redirects to the login page.
export default function RegisterPage() {
  useEffect(() => {
    redirect('/login');
  }, []);

  return null;
}
