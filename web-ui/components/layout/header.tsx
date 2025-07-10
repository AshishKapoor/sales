import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout, getUser } from "@/lib/auth";
import { useEffect, useState } from "react";

export function Header() {
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    getUser()
      .then((user) => {
        setFirstName(user.first_name || "");
      })
      .catch(() => setFirstName(""));
  }, []);

  return (
    <header className="bg-background px-6 py-4 border-sidebar-border shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              className="w-80 pl-10 bg-background border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {firstName && (
                <span className="hidden cursor-pointer sm:inline text-sm font-medium max-w-[120px] rounded-full bg-gray-200 text-gray-800 px-2 py-1">
                  {firstName.charAt(0).toUpperCase() + firstName.charAt(1)}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  await logout();
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
