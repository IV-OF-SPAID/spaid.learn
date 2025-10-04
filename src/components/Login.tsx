import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Glogo from "../assets/img/gLogo.svg";
import Flogo from "../assets/img/fLogo.svg";
import supabase from "../config/supabaseClient";

const Login = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (
      !/(?=.*[a.z])/.test(registerPassword) ||
      !/(?=.*[A-Z])/.test(registerPassword) ||
      !/(?=.*\d)/.test(registerPassword) ||
      registerPassword.length < 8

    ) {
      setRegisterError(
        "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number"
      );
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      options: {
        data: { username: registerEmail },
      },
    });

    if (error) {
      setRegisterError(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          role: "student",
          username: registerEmail
        },
      ]);
    }
    setIsVisible(false);
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data: users, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email);

    if (fetchError) {
      setError("Error fetching user data");
      return;
    }

    if (!users || users.length === 0) {
      setError("No user found with this email");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Error signing in: " + signInError.message);
      return;
    }

    navigate("/Home");
  }
  
  return (
    <>
      <div className="min-h-screen w-full flex justify-center items-center bg-white px-2 py-8">
        <div className="w-full max-w-3xl md:h-[421px] border-1 border-[rgba(0,0,0,0.25)] flex flex-col md:flex-row  overflow-hidden shadow-md bg-white">
          <div className="w-full md:w-[55%] h-full bg-[#f5f5f5] border-b-1 md:border-b-0 md:border-r-1 border-[rgba(0,0,0,0.25)] hidden md:flex flex-col justify-center items-center p-6 md:p-0">
            <div className="w-full max-w-xs h-auto flex flex-col justify-between">
              <h1 className="text-2xl md:text-4xl poppins-medium mb-2">
                Start learning now
              </h1>
              <p className="poppin-regular text-base">
                A smart learning platform that empowers students to grow at
                their own pace through interactive lessons, engaging quizzes,
                and real-time feedback
              </p>
            </div>
          </div>
          <div
            id="signUpIn"
            className="w-full relative md:w-[45%] h-full  flex flex-col items-center border-[rgba(0,0,0,0.25)] "
          >
            <div
              className={`w-full h-full p-6 md:p-10 flex flex-col items-center border-[rgba(0,0,0,0.25)]  md:absolute ${
                !isVisible ? "flex" : "hidden"
              }`}
            >
              <h1 className="poppins-regular text-lg md:text-xl">Sign In</h1>
              <div className="w-full h-10 flex items-center justify-center gap-2 pt-2">
                <a
                  href="#"
                  onClick={handleGoogleLogin}
                  className="w-10 h-10 rounded-xl border-1 border-[rgba(0,0,0,0.25)] flex justify-center items-center"
                >
                  <img src={Glogo} alt="Google" className="w-7 h-7" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl border-1 border-[rgba(0,0,0,0.25)] flex justify-center items-center"
                >
                  <img src={Flogo} alt="Facebook" className="w-7 h-7" />
                </a>
              </div>
              <div className="flex items-center w-full py-3">
                <hr className="flex-grow border-t border-gray-300"></hr>
                <p className="text-xs mx-5 poppins-regular">or</p>
                <hr className="flex-grow border-t border-gray-300"></hr>
              </div>
              <form
                action=""
                method="get"
                onSubmit={handleEmailLogin}
                className="w-full gap-2 flex flex-col"
              >
                <h1 className="poppins-regular text-xs">Email: </h1>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-10 text-xs p-3 border-1 border-[rgba(0,0,0,0.25)] rounded-lg"
                />
                <h1 className="poppins-regular text-xs">Password: </h1>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-10 text-xs p-3 border-1 border-[rgba(0,0,0,0.25)] rounded-lg"
                />
                <div className="flex items-center px-2">
                  <input type="checkbox" name="" id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-[10px] poppins-regular px-1"
                  >
                    Remember me
                  </label>
                </div>
                {error && <div className="text-red-500 text-xs">{error}</div>}
                <div className="w-full flex justify-end px-4">
                  <button
                    type="submit"
                    className="text-base poppins-regular w-20 rounded-md cursor-pointer border-1 border-[rgba(0,0,0,0.25)]"
                  >
                    Log In
                  </button>
                </div>
              </form>
              <div className="flex gap-1 mt-8">
                <h1 className="text-[10px]">Don’t have an account?</h1>
                <button
                  className="text-[10px] text-[#013F5E] hover:underline cursor-pointer "
                  onClick={() => setIsVisible(!isVisible)}
                >
                  Sign up 
                </button>
              </div>
            </div>
            <div
              className={`w-full md:absolute md:w-full h-full p-6 md:px-10 flex-col items-center  border-[rgba(0,0,0,0.25)]   ${
                isVisible ? "flex" : "hidden"
              }`}
            >
              <h1 className="poppins-regular text-lg md:text-xl">Sign Up</h1>
              <div className="w-full h-10 flex items-center justify-center gap-2 pt-2">
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl border-1 border-[rgba(0,0,0,0.25)] flex justify-center items-center"
                >
                  <img src={Glogo} alt="Google" className="w-7 h-7" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl border-1 border-[rgba(0,0,0,0.25)] flex justify-center items-center"
                >
                  <img src={Flogo} alt="Facebook" className="w-7 h-7" />
                </a>
              </div>
              <div className="flex items-center w-full py-3">
                <hr className="flex-grow border-t border-gray-300"></hr>
                <p className="text-xs mx-5 poppins-regular">or</p>
                <hr className="flex-grow border-t border-gray-300"></hr>
              </div>
              <form onSubmit={handleRegister}
                action=""
                method="get"
                className="w-full gap-2 flex flex-col"
              >
                <h1 className="poppins-regular text-xs">Email: </h1>
                <input
                  type="text"
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={e => setRegisterEmail(e.target.value)}
                  className="w-full h-8 text-xs p-3 border-1 border-[rgba(0,0,0,0.25)] rounded-lg"
                />
                <h1 className="poppins-regular text-xs">Password: </h1>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={registerPassword}
                  onChange={e => setRegisterPassword(e.target.value)}
                  className="w-full h-8 text-xs p-3 border-1 border-[rgba(0,0,0,0.25)] rounded-lg"
                />
                <h1 className="poppins-regular text-xs">Confirm Password: </h1>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={registerConfirmPassword}
                  onChange={e => setRegisterConfirmPassword(e.target.value)}
                  className="w-full h-8 text-xs p-3 border-1 border-[rgba(0,0,0,0.25)] rounded-lg"
                />
                {registerError && <div className="text-red-500 text-xs">{registerError}</div>}
                <div className="w-full flex justify-end px-4">
                  <button
                    type="submit"
                    className="text-sm p-1 poppins-regular max-w-50 rounded-md cursor-pointer border-1 border-[rgba(0,0,0,0.25)]"
                  >
                    Create Account
                  </button>
                </div>
              </form>
              <div className="flex gap-1 mt-8">
                <h1 className="text-[10px]">Already have an account?</h1>
                <button
                  className="text-[10px] text-[#013F5E] hover:underline cursor-pointer "
                  onClick={() => setIsVisible(!isVisible)}
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
