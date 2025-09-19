import React from "react";

const Review = () => {
  return (
    <div className="w-full  flex flex-col px-20 pt-5 gap-5 ">
      <div className="w-[880px] h-[170px] bg-[#f5f5f5] rounded-2xl p-4 flex flex-col justify-center gap-2">
        <h1>Reviewer</h1>
        <div className="w-full  flex justify-between items-center">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="border border-[rgba(0,0,0,0.25)] w-60 h-25  p-5"
            >
              <h1>Reviewer {index}</h1>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Review;
