"use client"
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-2xl font-bold text-red-500">Welcome to the Dashboard!</p>
        <Button onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    </>
  );
}
