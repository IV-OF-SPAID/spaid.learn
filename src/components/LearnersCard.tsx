import React from "react";
import Avatarcard from "../assets/img/defAvatar.svg";

const LearnersCard = () => {
  return (
    <div className="h-screen ">
      <div className="w-[420px] h-[170px] border-1 border-[rgba(0,0,0,0.25)] absolute right-15 top-25 flex">
        <div className="w-[150px] h-full  flex flex-col border-r-1 border-[rgba(0,0,0,0.25)]">
          <a
            href="#"
            className="h-full flex flex-col justify-center items-center "
          >
            <img
              src={Avatarcard}
              alt=""
              className="w-20 bg-[#f5f5f5] rounded-full"
            />
            <div className=" h-2/5 w-full flex flex-col justify-center items-center">
              <h1 className="text-lg">Sid</h1>
              <p className="text-xs text-[#403F3F] border-1 border-[rgba(0,0,0,0.25)] px-2 rounded-3xl">
                Learner
              </p>
            </div>
          </a>
        </div>
        <div className="w-[270px] h-full bg-[#f5f5f5] flex flex-col justify-between items-center">
          <div className="w-full h-10/21  flex flex-col justify-center px-4">
            <h1 className="text-[#403F3F]">Courses Completed</h1>
            <h1 className="text-xl">0</h1>
          </div>
          <div className="flex items-center w-9/10 py-3">
            <hr className="flex-grow border-t border-gray-300"></hr>
          </div>
          <div className="w-full h-10/21  flex flex-col justify-center px-4">
            <h1 className="text-[#403F3F]">Ongoing Courses</h1>
            <h1 className="text-xl">0</h1>
          </div>
        </div>
      </div>

      <div className="w-[420px] h-[165px] border-1 border-[rgba(0,0,0,0.25)] absolute right-15 top-73 flex">
        <div className="w-7/10 h-full  flex flex-col mt-5 px-5 gap-1">
          <h1 className="text-xs w-40 text-center border-1 border-[rgba(0,0,0,0.25)] rounded-full px-4">
            Continue Learning
          </h1>
          <h1 className="text-base">
            MATHEMATICAL AND PROBLEM-SOLVING SKILLS II
          </h1>
          <p className="text-xs">25% Completed</p>
        </div>
        <div className=" w-3/10 flex justify-center items-end py-4">
          <a href="" className="text-[#013F5E]">
            View Course
          </a>
        </div>
      </div>
    </div>
  );
};

export default LearnersCard;
