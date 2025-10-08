import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import MainLayout from "./layout/MainLayout";
import AccountSettingPage from "./pages/AccountSettingPage";
import NotFoundPage from "./pages/NotFoundPage";
import Login from "./components/Login";
import { useState, useEffect } from "react";

function App() {
  const [token, setToken] = useState(false);

  useEffect(() => {
    const tokenString = sessionStorage.getItem("token");
    if (tokenString) {
      const data = JSON.parse(tokenString);
      setToken(data);
      console.log(token);
    }
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Login setToken={setToken} />} />
        <Route path="/Home" element={<HomePage token={token} />} />
        <Route
          path="/AccountSetting"
          element={<AccountSettingPage token={token} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;
