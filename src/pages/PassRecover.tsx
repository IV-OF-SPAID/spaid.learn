import React, { useState, useEffect } from "react";
import supabase from "../config/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa";

const PassRecover = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the hash fragment from Supabase recovery link
    const handleRecoveryFromHash = async () => {
      const hash = window.location.hash;

      // Check if this is a recovery link (contains access_token and type=recovery)
      if (hash && hash.includes("type=recovery")) {
        // Supabase client will automatically handle the hash and create a session
        // We just need to wait for it
        setIsValidSession(true);
        setIsLoading(false);
        return true;
      }
      return false;
    };

    // Listen for auth state changes to detect PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setIsLoading(false);
      } else if (event === "SIGNED_IN" && session) {
        // Check if this is from a recovery flow
        const hash = window.location.hash;
        if (hash && hash.includes("type=recovery")) {
          setIsValidSession(true);
          setIsLoading(false);
        }
      }
    });

    // Check if there's already an active session or recovery hash
    const checkSession = async () => {
      // First check if we have a recovery hash
      const isRecovery = await handleRecoveryFromHash();
      if (isRecovery) return;

      // Then check for existing session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      }
      setIsLoading(false);
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Password validation
    if (
      !/(?=.*[a-z])/.test(newPassword) ||
      !/(?=.*[A-Z])/.test(newPassword) ||
      !/(?=.*\d)/.test(newPassword) ||
      newPassword.length < 8
    ) {
      setError(
        "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Password has been reset successfully! Redirecting to login..."
      );
      // Sign out the user after password reset
      await supabase.auth.signOut();
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#013F5E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white relative">
        <Link
          to="/"
          className="absolute top-20 text-sm hover:underline left-20 text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
        >
          <FaChevronLeft size={13} />
          back
        </Link>
        <div className="bg-[#f5f5f5] border border-[rgba(0,0,0,0.25)] p-8 shadow-md w-full max-w-md flex flex-col gap-4 text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-500">
            Invalid or Expired Link
          </h1>
          <p className="text-gray-600">
            This password reset link is invalid or has expired. Please request a
            new password reset.
          </p>
          <Link
            to="/reset"
            className="bg-[#013F5E] text-white py-2 rounded-md text-center"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative">
      <Link
        to="/"
        className="absolute top-20 text-sm hover:underline left-20 text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
      >
        <FaChevronLeft size={13} />
        back
      </Link>
      <form
        onSubmit={handleResetPassword}
        className="bg-[#f5f5f5] border border-[rgba(0,0,0,0.25)] p-8 shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-2">
          Enter your new password below.
        </p>
        <div className="relative">
          <input
            type={showNewPass ? "text" : "password"}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border border-[rgba(0,0,0,0.25)] p-2 rounded-md w-full pr-10"
            required
          />
          {showNewPass ? (
            <AiOutlineEyeInvisible
              className="absolute right-3 top-3 text-lg text-[rgba(0,0,0,0.25)] hover:text-[#013f5edb] cursor-pointer"
              onClick={() => setShowNewPass(!showNewPass)}
            />
          ) : (
            <AiOutlineEye
              className="absolute right-3 top-3 text-lg text-[rgba(0,0,0,0.25)] hover:text-[#013f5edb] cursor-pointer"
              onClick={() => setShowNewPass(!showNewPass)}
            />
          )}
        </div>
        <div className="relative">
          <input
            type={showConfirmPass ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-[rgba(0,0,0,0.25)] p-2 rounded-md w-full pr-10"
            required
          />
          {showConfirmPass ? (
            <AiOutlineEyeInvisible
              className="absolute right-3 top-3 text-lg text-[rgba(0,0,0,0.25)] hover:text-[#013f5edb] cursor-pointer"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
            />
          ) : (
            <AiOutlineEye
              className="absolute right-3 top-3 text-lg text-[rgba(0,0,0,0.25)] hover:text-[#013f5edb] cursor-pointer"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
            />
          )}
        </div>
        <p className="text-xs text-gray-500">
          Password must be at least 8 characters with uppercase, lowercase, and
          a number.
        </p>
        <button
          type="submit"
          className="bg-[#013F5E] text-white py-2 rounded-md hover:bg-[#012a3f] transition-colors"
        >
          Reset Password
        </button>
        {message && <div className="text-green-600 text-sm">{message}</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
    </div>
  );
};

export default PassRecover;
