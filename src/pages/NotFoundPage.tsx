import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

const NotFoundPage = () => {
  return (
    <div className="bg-white h-screen flex justify-center items-center flex-col">
      <FaExclamationTriangle className="text-black text-9xl" />
      <h1 className="text-6xl font-bold mb-5">404 NOT FOUND</h1>
      <h1>THIS PAGE IS NOT FOUND</h1>
      <Link
        to="/"
        className="bg-{#f5f5f5} border border-[rgba(0,0,0,0.25)] px-3 py-2 my-4 rounded-xl cursor-pointer"
      >
        GO BACK
      </Link>
    </div>
  );
};

export default NotFoundPage;
