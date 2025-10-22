import Avatar from "../assets/img/defAvatar.svg";
import ChevDown from "../assets/img/chevronD.svg";
import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { useState, useEffect, useRef } from "react";

const Navlogged = () => {
  const token = JSON.parse(sessionStorage.getItem("token") || "null");
  // move profile into state so UI can react to updates
  const [profileState, setProfileState] = useState<any>(() =>
    JSON.parse(sessionStorage.getItem("profile") || "null")
  );
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMenu]);

  useEffect(() => {
    // handler for custom same-tab updates
    function onProfileUpdated(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail) setProfileState(detail);
      else
        setProfileState(
          JSON.parse(sessionStorage.getItem("profile") || "null")
        );
    }
    // handler for cross-tab updates (storage event)
    function onStorage(e: StorageEvent) {
      if (e.key === "profile") {
        setProfileState(JSON.parse(e.newValue || "null"));
      }
    }
    window.addEventListener(
      "profile_updated",
      onProfileUpdated as EventListener
    );
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(
        "profile_updated",
        onProfileUpdated as EventListener
      );
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const username = profileState?.username || token?.user_metadata?.full_name;
  const role = profileState?.role ?? "Learner";

  return (
    <nav className=" w-full h-15 border-b-1 border-[rgba(0,0,0,0.25)] bg-white flex items-center pl-5 fixed z-50 ">
      <div className="flex w-2/4 ">
        {token ? (
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
      {token && (
        <>
          <div className="w-2/4  h-full flex justify-end items-center">
            <Link to="/Courses" className="poppins-regular">
              Courses
            </Link>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className=" h-11 max-w-50 rounded-xl bg-[#f5f5f5] cursor-pointer gap-2 flex px-3 justify-between items-center mx-8"
            >
              <img
                // prefer avatar from stored profile, then auth metadata, then default
                src={
                  profileState?.avatar_url ||
                  token?.user?.user_metadata?.avatar_url ||
                  Avatar
                }
                alt={profileState?.username ?? "profile"}
                className="w-8 h-8 bg-white rounded-full object-cover"
              />
              <div className="flex flex-col justify-center items-center">
                <h1>{username.split(" ")[0]}</h1>
                <p className="text-xs text-[#403F3F]">{role}</p>
              </div>
              <img src={ChevDown} alt="" className="w-3 h-3" />
            </button>
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
