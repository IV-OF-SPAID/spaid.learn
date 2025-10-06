import React, { useEffect, useState } from "react";
import Avatarcard from "../assets/img/defAvatar.svg";
import { FaPencilAlt, FaCamera } from "react-icons/fa";
import supabase from "../config/supabaseClient";


const AccountProf = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        if (user) {
          const { data} = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

        }  
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className=" h-95 w-full px-30 py-20 relative">
      <div className="relative ">
        <div className="w-1080px h-50 bg-[#f5f5f5]  rounded-md">
          <FaCamera className="text-[#989898] text-3xl absolute top-5 right-7" />
        </div>
        <div className="absolute  bottom-[-90px] h-[120px]  w-full flex items-center">
          <div className="flex items-center  w-2/4 gap-5 pl-5 ">
            <img
              src={user?.user_metadata?.avatar_url}
              alt="Pfp"
              className="w-[120px] rounded-full "
            />
            <h1 className="text-2xl">
              {user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                username}
            </h1>
            {user && (
              <button className=" ml-2 flex bg-[#f5f5f5] w-30 justify-center items-center h-10 rounded-md cursor-pointer">
                Add Course
              </button>
            )}
            <FaCamera className="text-[#989898] text-3xl absolute bottom-0 left-27" />
          </div>
          <div className="w-2/4 h-full  flex justify-end items-center">
            <button
              type="button"
              className="flex bg-[#f5f5f5] w-30 justify-center items-center h-10 rounded-md gap-2 cursor-pointer"
            >
              <FaPencilAlt />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProf;
