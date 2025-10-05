import { data, Outlet, useNavigate, useLocation } from "react-router-dom";
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

      if (data.user) {
        // If logged in and not on /Home, redirect to /Home
        if (location.pathname === "/") {
          navigate("/Home", { replace: true });
        }
      }

      if (!data.user) {
        setUser(null);
        // If not logged in and not on login page, redirect to login
        if (location.pathname !== "/") {
          navigate("/", { replace: true });
        }
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        console.log(user);

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
  }, [location.pathname]);

  return (
    <>
      <Navlogged />
      <Outlet />
    </>
  );
};

export default MainLayout;
