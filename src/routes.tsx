import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "@/components/layout/Layout";

import Login from "@/pages/Auth/LoginPage";
import Register from "@/pages/Auth/RegisterPage";

import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import Inventory from "@/pages/Inventory";
import Warehouses from "@/pages/Warehouses";
import Shipments from "@/pages/Shipments";
import Analytics from "@/pages/Analytics";
import AlertsPage from "@/pages/AlertsPage";
import Settings from "@/pages/Settings";

import PreOrderPage from "@/pages/PreOrder/PreOrderPage";
import PaymentPage from "@/pages/Payment/PaymentPage";
import ProductPage from "@/pages/Product/ProductPage";

import { useAuth } from "@/features/Auth/hooks/useAuth";
import { ProductProvider } from "@/features/Product/context/productContext";

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },

      {
        path: "orders",
        element: <Orders />,
      },

      {
        path: "preorders",
        element: <PreOrderPage />,
      },

      {
        path: "products",
        element: (
          <ProductProvider>
            <ProductPage />
          </ProductProvider>
        ),
      },

      {
        path: "payments",
        element: <PaymentPage />,
      },

      {
        path: "inventory",
        element: <Inventory />,
      },

      {
        path: "warehouses",
        element: <Warehouses />,
      },

      {
        path: "shipments",
        element: <Shipments />,
      },

      {
        path: "analytics",
        element: <Analytics />,
      },

      {
        path: "alerts",
        element: <AlertsPage />,
      },

      {
        path: "settings",
        element: <Settings />,
      },

      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);