import React, { useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import { div } from "framer-motion/client";

const AccountSettCourses = () => {
  return (
    <div className="p-8 md:px-15 lg:px-30">
      <div className="w-full gap-5 md:gap-10  flex flex-col md:flex-row justify-between bg-[#f5f5f5] rounded-xl md:p-5">
        <div className="flex-1 px-3 flex flex-col justify-between">
          <div>
            <h1 className="text-lg font-medium mb-3">My courses</h1>
            <div className="flex flex-col gap-2 text-sm md:text-base">
              <p>LS1 ENG - I GET IT (RECOGNIZING THE MAIN IDEA)</p>
              <p>LS1 ENG - IN OTHER WORDS (RESTATING INFORMATION)</p>
              <p>LS1 ENG - I MYSELF BELIEVE (EXPRESSING OPINIONS)</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button className="text-[#013F5E] flex items-center gap-2 hover:underline cursor-pointer">
              Show more <FaChevronDown />
            </button>
          </div>
        </div>

        <div className="block h-[1px] md:h-auto md:my-5 md:w-[2px] bg-gray-300 mx-2"></div>

        <div className="flex-1 px-3 flex flex-col justify-between">
          <div>
            <h1 className="text-lg font-medium mb-3">Unfinished courses</h1>
            <div className="flex flex-col gap-2 text-sm md:text-base">
              <p>LS1 ENG - I GET IT (RECOGNIZING THE MAIN IDEA)</p>
              <p>LS1 ENG - IN OTHER WORDS (RESTATING INFORMATION)</p>
              <p>LS1 ENG - I MYSELF BELIEVE (EXPRESSING OPINIONS)</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button className="text-[#013F5E] flex items-center gap-2 hover:underline cursor-pointer">
              Show more <FaChevronDown />
            </button>
          </div>
        </div>

        <div className="block h-[1px] md:h-auto md:my-5 md:w-[2px] bg-gray-300 mx-2"></div>

        <div className="flex-1 px-3 flex flex-col justify-between">
          <div>
            <h1 className="text-lg font-medium mb-3">Finished courses</h1>
            <div className="flex flex-col gap-2 text-sm md:text-base">
              <p>LS1 ENG - I GET IT (RECOGNIZING THE MAIN IDEA)</p>
              <p>LS1 ENG - IN OTHER WORDS (RESTATING INFORMATION)</p>
              <p>LS1 ENG - I MYSELF BELIEVE (EXPRESSING OPINIONS)</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button className="text-[#013F5E] flex items-center gap-2 hover:underline cursor-pointer">
              Show more <FaChevronDown />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettCourses;
