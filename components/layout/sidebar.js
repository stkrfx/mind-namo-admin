"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  AlertTriangle,
  Settings,
  Mail,
  FileText,
  LogOut,
  ShieldAlert,
  Megaphone
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

// Define the navigation items
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users & Experts",
    href: "/users",
    icon: Users,
  },
  {
    title: "Organisations",
    href: "/organisations",
    icon: Building2,
  },
  {
    title: "Support Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: AlertTriangle,
  },
  {
    title: "Email Templates",
    href: "/templates",
    icon: FileText,
  },
  {
    title: "Newsletter",
    href: "/newsletter",
    icon: Megaphone,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ className }) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12 min-h-screen border-r bg-card", className)}>
      <div className="space-y-4 py-4">
        {/* Logo Section */}
        <div className="px-6 py-2 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">MindAmo Admin</h2>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              // Check if the current path starts with the item href
              // This ensures /users/123 still highlights /users
              const isActive = pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Logout Section */}
      <div className="absolute bottom-4 w-full px-4">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}