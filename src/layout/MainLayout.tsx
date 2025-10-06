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
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);

      // Redirect authenticated users from "/" to "/Home"
      if (data.user && location.pathname === "/") {
        navigate("/Home", { replace: true });
      }

      // Redirect unauthenticated users to "/" (login)
      if (!data.user && location.pathname !== "/") {
        setUser(null);
        navigate("/", { replace: true });
      }

      // Insert profile if not exists
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (!profile) {
          await supabase.from("profiles").insert([
            {
              id: data.user.id,
              name: data.user.user_metadata.full_name,
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