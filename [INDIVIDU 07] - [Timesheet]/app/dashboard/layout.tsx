'use client';

import Link from 'next/link';
import { use, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut, Users, FolderOpen, Calendar, Settings, TrendingUp, Bell, Shield, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/login/actions';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UserData {
  id: number;
  name?: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  team?: {
    teamId: number;
    role: string;
  } | null;
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<UserData>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Pricing
        </Link>
        <Button asChild className="rounded-full">
          <Link href="/login/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {(user.name || user.email || 'U')
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header({ sidebarOpen, toggleSidebar }: { sidebarOpen: boolean; toggleSidebar: () => void }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center">
            <CircleIcon className="h-6 w-6 text-orange-500" />
            <span className="ml-2 text-xl font-semibold text-gray-900">Timesheet AI</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ sidebarOpen, toggleSidebar }: { sidebarOpen: boolean; toggleSidebar: () => void }) {
  const { data: user } = useSWR<UserData>('/api/user', fetcher);
  const hasTeam = user?.team?.teamId;

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true
    },
    {
      name: 'Timesheet',
      href: '/dashboard/timesheet',
      icon: Calendar,
      show: true
    },
    {
      name: 'Analytics',
      href: '/dashboard/timesheet/dashboard',
      icon: TrendingUp,
      show: true
    },
    {
      name: 'Projects',
      href: '/dashboard/projects',
      icon: FolderOpen,
      show: hasTeam
    },
    {
      name: 'Team Members',
      href: '/dashboard',
      icon: Users,
      show: hasTeam
    },
    {
      name: 'Invitations',
      href: '/dashboard/invitations',
      icon: Bell,
      show: true
    },
    {
      name: 'Settings',
      href: '/dashboard/general',
      icon: Settings,
      show: hasTeam
    },
    {
      name: 'Security',
      href: '/dashboard/security',
      icon: Shield,
      show: hasTeam
    }
  ];

  return (
    <aside className={`${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-16'} fixed lg:static inset-y-0 left-0 z-50 bg-gray-50 border-r border-gray-200 transform transition-all duration-200 ease-in-out lg:transition-none`}>
      <div className="p-4">
        {/* Toggle button for desktop */}
        <div className="hidden lg:flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors ${!sidebarOpen && 'lg:justify-center lg:px-2'}`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'lg:mr-0'}`} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 relative">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className={`flex-1 bg-white transition-all duration-200 ease-in-out ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
