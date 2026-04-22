import React, { Suspense } from "react";
import { Authenticated, Refine } from "@refinedev/core";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import routerProvider from "@refinedev/react-router";
import { CreditCard } from "lucide-react";

import { authProvider } from "@/providers/auth-provider/auth-provider";
import { transactionsDataProvider } from "@/providers/data-provider/transactions";
import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { ErrorComponent } from "@/components/refine-ui/layout/error-component";
import LoginPage from "@/pages/login";

// Micro-frontend de transacciones cargado dinámicamente vía Module Federation
const TransactionsMFE = React.lazy(() => import("transactionsMfe/TransactionsPage"));

function App() {
  const notificationProvider = useNotificationProvider();

  return (
    <ThemeProvider defaultTheme="system" storageKey="tenpista-theme">
      <BrowserRouter>
        <Refine
          routerProvider={routerProvider}
          authProvider={authProvider}
          dataProvider={transactionsDataProvider}
          notificationProvider={notificationProvider}
          resources={[
            {
              name: "transactions",
              list: "/transactions",
              meta: {
                label: "Transacciones",
                icon: <CreditCard size={16} />,
              },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            disableTelemetry: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <Authenticated key="private-routes" fallback={<Navigate to="/login" replace />}>
                  <AppLayout />
                </Authenticated>
              }
            >
              <Route index element={<Navigate to="/transactions" replace />} />
              <Route
                path="/transactions"
                element={
                  <Suspense fallback={
                    <div className="flex h-full items-center justify-center">
                      <span className="text-muted-foreground text-sm">Cargando transacciones...</span>
                    </div>
                  }>
                    <TransactionsMFE />
                  </Suspense>
                }
              />
            </Route>

            <Route path="*" element={<ErrorComponent />} />
          </Routes>

          <Toaster richColors closeButton position="bottom-right" />
        </Refine>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
