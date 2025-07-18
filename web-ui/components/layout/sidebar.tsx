"use client";

import { cn } from "@/lib/utils";
import {
  Building,
  CheckSquare,
  Contact,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Target,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Accounts", href: "/accounts", icon: UserCog },
  { name: "Opportunities", href: "/opportunities", icon: Target },
  { name: "Products", href: "/products", icon: Package },
  { name: "Quotes", href: "/quotes", icon: FileText },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Contacts", href: "/contacts", icon: Contact },
  { name: "Customers", href: "/customers", icon: Building },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [organizationName, setOrganizationName] = useState<string>("SALES CRM");

  useEffect(() => {
    getUser()
      .then((user) => {
        setOrganizationName(user.organization_name || "SALES CRM");
      })
      .catch(() => setOrganizationName("SALES CRM"));
  }, []);

  return (
    <div className="flex h-full w-64 flex-col bg-background shadow-sm">
      <div className="flex h-16 items-center px-6">
        <h1
          className="text-xl font-bold text-foreground truncate"
          title={organizationName}
        >
          {organizationName}
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-sidebar-foreground shadow"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
