import Avatar from "../assets/img/defAvatar.svg";
import ChevDown from "../assets/img/chevronD.svg";
import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { useState, useEffect, useRef } from "react";
import supabase from "../config/supabaseClient";

const Navlogged = () => {
  const token = JSON.parse(sessionStorage.getItem("token"));
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  return (
    <nav className=" w-full h-15 border-b-1 border-[rgba(0,0,0,0.25)] bg-white flex items-center pl-5 fixed z-50 ">
      <div className="flex w-2/4 ">
        {token?.user ? (
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
      {token?.user && (
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
                src={token.user.user_metadata.avatar_url || Avatar}
                alt="profile"
                className="w-8 h-8 bg-white rounded-full"
              />
              <div className="flex flex-col justify-center items-center">
                <h1>
                  {token.user.user_metadata?.full_name
                    ? token.user.user_metadata.full_name.split(" ")[0]
                    : token.user.user_metadata?.full_name}
                </h1>
                <p className="text-xs text-[#403F3F]">Learner</p>
              </div>
              <img src={ChevDown} alt="" className="w-3 h-3" />
            </a>
          </div>
        </>
      )}
      {/* Attach ref to DropdownMenu */}
      {showMenu && (
        <div ref={menuRef}>
          <DropdownMenu />
        </div>
      )}
    </nav>
  );
};

export default Navlogged;
