import { useGetIdentity, useLogout } from "@refinedev/core";
import { Outlet } from "react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

interface Identity {
  name?: string;
  avatar?: string;
}

export function AppLayout() {
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<Identity>();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 border-r bg-sidebar shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 h-16 px-4 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm">T</span>
          </div>
          <span className="font-semibold text-sidebar-foreground text-sm">Tenpista</span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to="/transactions"
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

        {/* Footer del sidebar */}
        <div className="p-3 space-y-2">
          {/* Info usuario */}
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

          {/* Acciones */}
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
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
