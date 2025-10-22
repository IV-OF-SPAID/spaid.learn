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
import ForgetPass from "./pages/ForgetPass";
import PassRecover from "./pages/PassRecover";
import AddCoursePage from "./pages/AddCoursePage";
import CoursePage from "./pages/CoursePage";
import ViewCoursePage from "./pages/ViewCoursePage";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Login />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/AccountSetting" element={<AccountSettingPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/reset" element={<ForgetPass />} />
        <Route path="/passRecover" element={<PassRecover />} />
        <Route path="/add-course" element={<AddCoursePage />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/view-course/:id" element={<ViewCoursePage />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;
