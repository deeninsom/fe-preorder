import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/features/Auth/context/authContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ToastContainer from "@/components/ui/Toast";
import { router } from "@/routes";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer />
          <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
