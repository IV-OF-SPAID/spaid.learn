import Avatar from "../assets/img/defAvatar.svg";
import ChevDown from "../assets/img/chevronD.svg";
import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { useState, useEffect } from "react";
import supabase from "../config/supabaseClient";

const Navlogged = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
  }, []);

  const [showMenu, setShowMenu] = useState(false);
  return (
    <nav className=" w-full h-15 border-b-1 border-[rgba(0,0,0,0.25)] bg-white flex items-center pl-5 fixed z-50 ">
      <div className="flex w-2/4 ">
        {user ? (
          <Link to="/Home" className="flex">
            <h1 className="poppins-extrabold text-3xl text-[#ff0000]">SPAID</h1>
            <h1 className="poppins-extrabold text-3xl text-[#ff8c00]">LEARN</h1>
          </Link>
        ) : (
          <div className="flex">
            <h1 className="poppins-extrabold text-3xl text-[#ff0000]">SPAID</h1>
            <h1 className="poppins-extrabold text-3xl text-[#ff8c00]">LEARN</h1>
          </div>
        )}
      </div>
      {user && (
        <>
          <div className="w-2/4  h-full flex justify-end items-center">
            <Link to="/Courses" className="poppins-regular">
              Courses
            </Link>
            <a
              href="#"
              onClick={() => setShowMenu(!showMenu)}
              className=" h-11 max-w-50 rounded-xl bg-[#f5f5f5] gap-2 flex px-3 justify-between items-center mx-8"
            >
              <img
                src={user.user_metadata.avatar_url}
                alt="profile"
                className="w-8 h-8 bg-white rounded-full"
              />
              <div className="flex flex-col justify-center items-center">
                <h1>{user.user_metadata.name.split(" ")[0]}</h1>
                <p className="text-xs text-[#403F3F]">Learner</p>
              </div>
              <img src={ChevDown} alt="" className="w-3 h-3" />
            </a>
          </div>
        </>
      )}
      {showMenu && <DropdownMenu />}
    </nav>
  );
};

export default Navlogged;
