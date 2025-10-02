import React from "react";

const RecoCourse = () => {
  return (
    <div className="w-full flex flex-col px-4 md:px-20 pt-8 md:pt-25 gap-5">
      <h1 className="text-lg">Learn</h1>
      <div className="w-full max-w-[880px] h-auto md:h-[170px] bg-[#f5f5f5] rounded-2xl p-4 flex flex-col justify-center mx-auto">
        <h1 className="text-[#403F3F]">Recommended Course</h1>
        <h1 className="text-2xl py-2">Communication Skills in English I</h1>
        <div className="flex flex-col md:flex-row md:h-15 justify-between items-center gap-4 md:gap-0">
          <h1 className="text-sm w-full md:w-90 text-[#403F3F]">
            Listening is the ability to accurately receive and interpret
            messages
          </h1>
          <button className="bg-white w-full md:w-50 h-10 border-1 border-[rgba(0,0,0,0.25)] rounded-xl cursor-pointer mt-2 md:mt-0">
            Start Learning Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecoCourse;
