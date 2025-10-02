import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import Navlogged from "../components/Navlogged";
import type {User} from "@supabase/supabase-js";

const MainLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data}) => {
      setUser(data.user);

      if (data.user) {
        navigate("/Home");
      }

      if (data.user) {
        const { data: profile} = await supabase
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
  }, []);

  return (
    <>
      <Navlogged />
      <Outlet />
    </>
  );
};

export default MainLayout;
