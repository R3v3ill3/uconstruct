import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, Users, Building, MapPin, Activity, Upload, BarChart3, FolderOpen, FileCheck, Shield, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import cfmeuLogoLight from "@/assets/cfmeu-logo-light.png";
import cfmeuLogoDark from "@/assets/cfmeu-logo-dark.png";

const navItems = [
  { path: "/projects", label: "Projects", icon: FolderOpen },
  { path: "/employers", label: "Employers", icon: Building },
  { path: "/workers", label: "Workers", icon: Users },
  { path: "/site-visits", label: "Site Visits", icon: FileCheck },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      setUserRole(profile?.role || null);
    };

    checkUserRole();
  }, [user]);

  const getVisibleNavItems = () => {
    const items = [...navItems];
    // Insert organiser-focused workspace
    if (userRole === "organiser" || userRole === "lead_organiser" || userRole === "admin") {
      items.splice(1, 0, { path: "/patch", label: "Patch", icon: Users });
    }
    // Show site visits for organizers and above
    if (userRole === "organiser" || userRole === "lead_organiser" || userRole === "admin") {
      // Site visits already in navItems, just filter it for these roles
    } else {
      // Remove site visits for delegates and viewers
      const siteVisitsIndex = items.findIndex(item => item.path === "/site-visits");
      if (siteVisitsIndex > -1) {
        items.splice(siteVisitsIndex, 1);
      }
    }
    if (userRole === "admin") {
      items.push({ path: "/admin", label: "Administration", icon: Shield });
    }
    return items;
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex ${mobile ? "flex-col" : "flex-row"} gap-2`}>
      {getVisibleNavItems().map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setIsOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={cfmeuLogoLight} 
                    alt="CFMEU Construction Union Logo" 
                    className="h-8 w-auto dark:hidden"
                  />
                  <img 
                    src={cfmeuLogoDark} 
                    alt="CFMEU Construction Union Logo" 
                    className="h-8 w-auto hidden dark:block"
                  />
                  <h2 className="text-lg font-semibold">CFMEU Organiser</h2>
                </div>
                <NavItems mobile />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={cfmeuLogoLight} 
              alt="CFMEU Construction Union Logo" 
              className="h-8 w-auto dark:hidden"
            />
            <img 
              src={cfmeuLogoDark} 
              alt="CFMEU Construction Union Logo" 
              className="h-8 w-auto hidden dark:block"
            />
            <h1 className="text-xl font-bold">CFMEU Organiser</h1>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex ml-8">
            <NavItems />
          </nav>

          {/* User menu */}
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;