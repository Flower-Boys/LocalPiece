import "./index.css";
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "react-hot-toast";

const InitAuth = ({ children }: { children: React.ReactNode }) => {
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      login(token);
    }
  }, [login]);

  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <InitAuth>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </InitAuth>
  </React.StrictMode>
);
