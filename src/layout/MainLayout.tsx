import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import Navlogged from "../components/Navlogged";
import type { User } from "@supabase/supabase-js";

const MainLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data?.session;
      const user = session?.user || null;
      setUser(user);

      // Store session globally if logged in
      if (session) {
        sessionStorage.setItem("token", JSON.stringify(session));
      } else {
        sessionStorage.removeItem("token");
      }

      // Redirect authenticated users from "/" to "/Home"
      if (user && location.pathname === "/") {
        navigate("/Home", { replace: true });
      }

      // Redirect unauthenticated users to "/" (login)
      if (!user && location.pathname !== "/") {
        setUser(null);
        navigate("/", { replace: true });
      }

      // Insert profile if not exists
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile) {
          await supabase.from("profiles").insert([
            {
              id: user.id,
              name: user.user_metadata.full_name,
              role: "student",
            },
          ]);
        }
      }
    });
  }, [location.pathname, navigate]);

  return (
    <>
      <Navlogged />
      <Outlet />
    </>
  );
};

export default MainLayout;
