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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Login />} />
      <Route path="/Home" element={<HomePage />} />
      <Route path="/AccountSetting" element={<AccountSettingPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
