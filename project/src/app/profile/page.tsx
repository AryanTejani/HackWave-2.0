"use client"
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function ProfilePage() {
  const { data: session, status } = useSession();
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  const user = session.user;
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-2xl font-bold ">Welcome to the Dashboard!</p>
        <Card >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.image || ""} alt={user?.name || "user"} />
                  <AvatarFallback className="text-sm">
                    {user?.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="md:text-lg text-sm font-semibold">{user?.name}</p>
                  <p className="text-slate-600 dark:text-slate-400 truncate max-w-[140px] md:max-w-full" title={user?.email || ''}>{user?.email}</p>
                </div>
              </div>
             
             

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {user?.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Member since {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
            

            <CardHeader>
              <CardTitle>Account Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="h-8 w-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Authenticated</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Full access</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="h-8 w-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Rate Limited</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Fair usage</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="h-8 w-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Auto Reset</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Daily limits</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        <Button onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    </>
  );
}
