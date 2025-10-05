import { data, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import Navlogged from "../components/Navlogged";
import NavLogin from "../components/NavLogin";
import type { User } from "@supabase/supabase-js";

const MainLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);

      if (data.user) {
        navigate("/Home");
      }

      if (!data.user) {
        setUser(null);
        navigate("/");
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
  }, []);

  return (
    <>
      {user ? <Navlogged userData={user?.id} /> : <NavLogin />}
      {console.log(user)}
      <Outlet />
    </>
  );
};

export default MainLayout;
