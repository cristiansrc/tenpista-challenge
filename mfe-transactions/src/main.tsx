import React from "react";
import ReactDOM from "react-dom/client";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Route, Routes } from "react-router";
import { transactionsDataProvider } from "./providers/data-provider/transactions";
import { authProvider } from "./providers/auth-provider/auth-provider";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { Toaster } from "sonner";
import TransactionList from "./pages/transactions";
import "./index.css";

function App() {
  const notificationProvider = useNotificationProvider();
  return (
    <BrowserRouter>
      <Refine
        routerProvider={routerProvider}
        authProvider={authProvider}
        dataProvider={transactionsDataProvider}
        notificationProvider={notificationProvider}
        resources={[{ name: "transactions", list: "/transactions" }]}
        options={{ disableTelemetry: true }}
      >
        <Routes>
          <Route path="*" element={<TransactionList />} />
        </Routes>
        <Toaster richColors closeButton position="bottom-right" />
      </Refine>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
