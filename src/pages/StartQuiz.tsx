import React from "react";
import { IoMdRepeat, IoMdTime } from "react-icons/io";
import { TbTargetArrow } from "react-icons/tb";
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StartQuiz: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/Home");
  };

  return (
    <div className="w-full flex flex-col items-center min-h-screen px-4 py-6 pt-35">
      <button
        type="button"
        onClick={handleBack}
        className="absolute top-22 cursor-pointer left-15 text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
      >
        <FaChevronLeft />
        <span>Learn / Courses / </span>
      </button>

      {/* Card */}
      <div className="w-[70%]  bg-[#F5F5F5]  border-[rgba(0,0,0,0.1)] rounded-md">
        <div className="px-8 py-10 text-center">
          <div className="text-sm text-black/70 mb-1">Let's Review!</div>
          <div className="text-3xl md:text-4xl poppins-semibold text-black mb-10">
            Ready, Sets, Go!
          </div>

          {/* 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-start">
            <div className="flex flex-col items-center text-center">
              <TbTargetArrow className="w-30 h-30 text-[#ff0300] mb-3" />
              <div className="text-lg text-black">
                Answer 5 questions
                <br />
                correctly
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <IoMdTime className="w-30 h-30 text-[#ff0300] mb-3" />
              <div className="text-xl text-black">No time limit</div>
            </div>

            <div className="flex flex-col items-center text-center">
              <IoMdRepeat className="w-30 h-30 text-[#ff0300] mb-3" />
              <div className="text-lg text-black">
                Repeat as many
                <br />
                times as you want
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start button */}
      <div className="max-w-5xl mx-auto flex justify-center mt-6">
        <button
          type="button"
          className="rounded px-5 py-2 text-sm text-black bg-[#ff9801] cursor-pointer"
          onClick={() => {}}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default StartQuiz;
