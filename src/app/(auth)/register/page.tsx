import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // Redirect to login as registration is disabled for single-user mode.
  redirect('/login');
}
