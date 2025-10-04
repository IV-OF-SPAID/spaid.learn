
import Avatar from "../assets/img/defAvatar.svg";
import ChevDown from "../assets/img/chevronD.svg";
import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";

interface UserData {
  name: string;
}

const Navlogged = ({ userData }: { userData: UserData | null}) => {
  return (
    <nav className=" w-full h-15 border-b-1 border-[rgba(0,0,0,0.25)] bg-white flex items-center pl-5 fixed z-50 ">
      <div className="flex w-2/4 ">
        <Link to="/Home" className="flex">
          <h1 className="poppins-extrabold text-3xl text-[#ff0000]">SPAID</h1>
          <h1 className="poppins-extrabold text-3xl text-[#ff8c00]">LEARN</h1>
        </Link>
      </div>
      {userData && (
        <>
          <div className="w-2/4  h-full flex justify-end items-center">
            <Link to="/Courses" className="poppins-regular">
              Courses
            </Link>
            <a
              href="#"
              className=" h-11 w-35 rounded-xl bg-[#f5f5f5] flex px-3 justify-between items-center mx-8"
            >
              <img
                src={Avatar}
                alt="profile"
                className="w-8 h-8 bg-white rounded-full"
              />
              <div className="flex flex-col justify-center items-center">
                <h1>Sid</h1>
                <p className="text-xs text-[#403F3F]">Learner</p>
              </div>
              <img src={ChevDown} alt="" className="w-3 h-3" />
            </a>
          </div>
        </>
      )}
      <DropdownMenu />
    </nav>
  );
};

export default Navlogged;
