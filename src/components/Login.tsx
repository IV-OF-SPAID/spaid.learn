import React, { useState } from "react";
import Glogo from "../assets/img/gLogo.svg";
import Flogo from "../assets/img/fLogo.svg";
import NavLogin from "./NavLogin";
import { div } from "framer-motion/client";
import supabase from "../config/supabaseClient";

const Login = () => {
  return (
    <>
      <NavLogin />
      <div className="h-screen w-auto flex justify-center items-center">
        <div className="w-[807px] h-[421px] border-1 border-[rgba(0,0,0,0.25)] flex">
          <div className="w-[453px] h-full bg-[#f5f5f5] border-1 border-[rgba(0,0,0,0.25)] flex flex-col justify-center items-center">
            <div className="w-[355px] h-[145px] flex flex-col justify-between">
              <h1 className=" text-4xl poppins-medium">Start learning now</h1>
              <p className="poppin-regular text-base">
                A smart learning platform that empowers students to grow at
                their own pace through interactive lessons, engaging quizzes,
                and real-time feedback
              </p>
            </div>
          </div>
          <div className="w-[355px] h-full p-10  border-1 border-[rgba(0,0,0,0.25)] flex flex-col items-center ">
            <h1 className="poppins-regular">Sign Up</h1>
            <div className="w-full h-10  flex items-center justify-center gap-2 pt-2">
              <a
                href="#"
                className=" w-10 h-10 rounded-xl border-1 border-[rgba(0,0,0,0.25)] flex justify-center items-center"
              >
                <img src={Glogo} alt="" className="w-7 h-7" />
              </a>
              <a
                href="#"
                className=" w-10 h-10 rounded-xl border-1 border-[rgba(0,0,0,0.25)] flex justify-center items-center"
              >
                <img src={Flogo} alt="" className="w-7 h-7" />
              </a>
            </div>
            <div className="flex items-center w-full py-3">
              <hr className="flex-grow border-t border-gray-300"></hr>
              <p className="text-xs mx-5 poppins-regular">or</p>
              <hr className="flex-grow border-t border-gray-300"></hr>
            </div>
            <form
              className=" w-full h-50 gap-2 flex flex-col"
            >
              <h1 className="poppins-regular text-xs">Email Address: </h1>
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full h-10 text-xs p-5 border-1 border-[rgba(0,0,0,0.25)] rounded-lg"
                required
              />
              <h1 className="poppins-regular text-xs">Password: </h1>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full h-10 text-xs p-5 border-1 border-[rgba(0,0,0,0.25)] rounded-lg"
                required
              />
              <div className="flex items-center px-2">
                <input type="checkbox" name="" id="remember" />
                <label
                  htmlFor="remember"
                  className="text-[10px] poppins-regular px-1 hover:cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <div className="w-full h-10px  flex justify-end px-4">
                <button
                  type="submit"
                  className="text-base poppins-regular w-20 rounded-md cursor-pointer border-1 border-[rgba(0,0,0,0.25)]"
                >
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
