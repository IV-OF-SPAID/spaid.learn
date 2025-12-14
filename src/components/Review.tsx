import React from "react";

const Review = () => {
  return (
    <div className="w-full flex flex-col px-4 md:px-20 pt-5 gap-5">
      <div className="w-full max-w-[880px] h-auto md:h-[170px] bg-[#ffffff] rounded-2xl p-4 flex flex-col justify-center gap-2 mx-auto">
        <h1>Reviewer</h1>
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-4">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className=" w-full md:w-65 h-20 md:h-25 p-5 rounded-xl flex justify-center items-center bg-[url('../../public/pallete.png')] bg-cover bg-center  "
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
