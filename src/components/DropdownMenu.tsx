import React from "react";
import { Link } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";

const DropdownMenu = () => {
  const navigate = useNavigate();
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    sessionStorage.removeItem("token");
    navigate("/");
    window.location.reload(); // Ensure all user state is cleared after sign out
  }
  return (
    <div className="absolute bg-white right-2 md:right-8 rounded-md border border-[rgba(0,0,0,0.25)] top-18  max-w-xs  shadow-lg z-50">
      <ul className="p-2 md:p-3 flex flex-col gap-3 md:gap-5 items-center">
        <li>
          <Link
            to=""
            className="px-4 md:px-8 py-2 md:py-3 w-full  text-center rounded-md text-base md:text-lg"
          >
            PROFILE
          </Link>
        </li>
        <li>
          <button
            className="cursor-pointer px-4 md:px-8 py-2 md:py-3 text-center rounded-md text-base md:text-lg"
            onClick={signOut}
          >
            LOG OUT
          </button>
        </li>
      </ul>
    </div>
  );
};

export default DropdownMenu;
