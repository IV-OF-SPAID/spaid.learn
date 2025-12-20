import Avatar from "../assets/img/defAvatar.svg";
import ChevDown from "../assets/img/chevronD.svg";
import { Link, useLocation } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { useState, useEffect, useRef } from "react";

const Navlogged = () => {
  // Synchronous (no-delay) token hydration without useSyncExternalStore
  const [token, setToken] = useState<any>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("token") || "null");
    } catch {
      return null;
    }
  });
  const [profileState, setProfileState] = useState<any>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("profile") || "null");
    } catch {
      return null;
    }
  });
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Listen for profile + token updates (same-tab & cross-tab)
  useEffect(() => {
    function updateProfile(detail?: any) {
      if (detail) {
        setProfileState(detail);
      } else {
        try {
          setProfileState(
            JSON.parse(sessionStorage.getItem("profile") || "null")
          );
        } catch {
          setProfileState(null);
        }
      }
    }
    function updateToken(detail?: any) {
      if (detail) {
        setToken(detail);
      } else {
        try {
          setToken(JSON.parse(sessionStorage.getItem("token") || "null"));
        } catch {
          setToken(null);
        }
      }
    }

    function onProfileUpdated(e: Event) {
      updateProfile((e as CustomEvent).detail);
    }
    function onTokenUpdated(e: Event) {
      updateToken((e as CustomEvent).detail);
    }
    function onStorage(e: StorageEvent) {
      if (e.key === "profile") updateProfile();
      if (e.key === "token") updateToken();
    }

    window.addEventListener(
      "profile_updated",
      onProfileUpdated as EventListener
    );
    window.addEventListener("token_updated", onTokenUpdated as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(
        "profile_updated",
        onProfileUpdated as EventListener
      );
      window.removeEventListener(
        "token_updated",
        onTokenUpdated as EventListener
      );
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const username =
    profileState?.username || token?.user?.user_metadata?.full_name || "";
  const firstName = username ? username.split(" ")[0] : "User";
  const role = profileState?.role ?? "Learner";

  // New: derive a robust logged-in flag from session user
  const isLoggedIn = username ? true : false;

  return (
    <nav className=" w-full h-15 border-b-1 border-[rgba(0,0,0,0.25)] bg-white flex items-center pl-5 fixed z-50 ">
      <div className="flex w-2/4 ">
        {isLoggedIn ? (
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
      {profileState && (
        <div className="w-2/4  h-full flex justify-end items-center">
          <div className="flex gap-1 p-1 bg-[#f5f5f5] rounded-full">
            <Link
              to="/Home"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                location.pathname === "/Home"
                  ? "bg-[#ff9801] text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Home
            </Link>
            {profileState.role == "instuctor" && (
              <Link
                to="/Courses"
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === "/Courses"
                    ? "bg-[#ff9801] text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Learn
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className=" h-11 min-w-[160px] rounded-xl bg-[#f5f5f5] cursor-pointer gap-2 flex px-3 justify-between items-center mx-8"
          >
            <img
              src={
                profileState?.avatar_url ||
                token?.user?.user_metadata?.avatar_url ||
                Avatar
              }
              alt={profileState?.username ?? "profile"}
              className="w-8 h-8 bg-white rounded-full object-cover"
            />
            <div className="flex flex-col justify-center items-center">
              <h1>{firstName}</h1>
              <p className="text-xs text-[#403F3F]">{role}</p>
            </div>
            <img src={ChevDown} alt="" className="w-3 h-3" />
          </button>
        </div>
      )}
      {showMenu && (
        <div ref={menuRef}>
          <DropdownMenu />
        </div>
      )}
    </nav>
  );
};

export default Navlogged;
