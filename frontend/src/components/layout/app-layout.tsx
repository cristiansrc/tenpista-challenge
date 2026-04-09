import { useState } from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { Outlet } from "react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

interface Identity {
  name?: string;
  avatar?: string;
}

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<Identity>();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className="flex items-center gap-2 h-16 px-4 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <span className="text-sidebar-primary-foreground font-bold text-sm">T</span>
        </div>
        <span className="font-semibold text-sidebar-foreground text-sm">Tenpista</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <NavLink
          to="/transactions"
          onClick={() => isMobile && setMobileMenuOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )
          }
        >
          <CreditCard className="h-4 w-4 shrink-0" />
          Transacciones
        </NavLink>
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className="p-3 space-y-2">
        {identity?.name && (
          <div className="flex items-center gap-2 px-3 py-2">
            {identity.avatar ? (
              <img src={identity.avatar} alt={identity.name} className="h-6 w-6 rounded-full" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="text-xs text-sidebar-primary-foreground font-medium">
                  {identity.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs text-sidebar-foreground truncate">{identity.name}</span>
          </div>
        )}

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Cambiar tema"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent text-xs h-8"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background md:flex md:h-screen">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">T</span>
          </div>
          <span className="font-semibold text-sm">Tenpista</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </header>

      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:bg-sidebar">
        <SidebarContent />
      </aside>

      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="left-0 top-0 h-full max-w-[85vw] w-72 translate-x-0 translate-y-0 rounded-none p-0">
          <DialogTitle className="sr-only">Menú de navegación</DialogTitle>
          <aside className="flex h-full flex-col bg-sidebar">
            <SidebarContent isMobile />
          </aside>
        </DialogContent>
      </Dialog>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
