import React from "react";
import { FaChevronDown } from "react-icons/fa";

const AccountSettCourses = () => {
  return (
    <div className=" w-full px-30 mt-5 flex justify-between items-center">
      <div className="h-70 w-100 bg-[#f5f5f5] rounded-xl p-5">
        <h1>My Courses</h1>
        <div className=" h-3/4 flex flex-col gap-1">
          <h1>LS1 ENG - I GET IT (RECOGNIZING THE MAIN IDEA)</h1>
          <h1>LS1 ENG - IN OTHER WORDS (RESTATING INFORMATION)</h1>
          <h1>LS1 ENG - I MYSELF BELIEVE (EXPRESSING OPINIONS)</h1>
        </div>
        <div className="flex justify-end">
          <button className="text-[#013F5E] flex justify-center items-center gap-2">
            Show more <FaChevronDown />
          </button>
        </div>
      </div>
      <div className="h-70 w-100 bg-[#f5f5f5] rounded-xl p-5">
        <h1>Unfinished Courses</h1>
        <div className=" h-3/4 flex flex-col gap-1">
          <h1>LS1 ENG - I GET IT (RECOGNIZING THE MAIN IDEA)</h1>
          <h1>LS1 ENG - IN OTHER WORDS (RESTATING INFORMATION)</h1>
          <h1>LS1 ENG - I MYSELF BELIEVE (EXPRESSING OPINIONS)</h1>
        </div>
        <div className="flex justify-end">
          <button className="text-[#013F5E] flex justify-center items-center gap-2">
            Show more <FaChevronDown />
          </button>
        </div>
      </div>
      <div className="h-70 w-100 bg-[#f5f5f5] rounded-xl p-5">
        <h1>Finished Courses</h1>
        <div className=" h-3/4 flex flex-col gap-1">
          <h1>LS1 ENG - I GET IT (RECOGNIZING THE MAIN IDEA)</h1>
          <h1>LS1 ENG - IN OTHER WORDS (RESTATING INFORMATION)</h1>
          <h1>LS1 ENG - I MYSELF BELIEVE (EXPRESSING OPINIONS)</h1>
        </div>
        <div className="flex justify-end">
          <button className="text-[#013F5E] flex justify-center items-center gap-2">
            Show more <FaChevronDown />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettCourses;
