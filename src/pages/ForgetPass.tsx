import React, { useState } from "react";
import supabase from "../config/supabaseClient";
import { FaChevronLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdEmail } from "react-icons/md";

const ForgetPass = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/passRecover",
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setEmailSent(true);
      setMessage("Password reset email sent. Please check your inbox.");
    }
  };

  const handleResend = () => {
    setEmailSent(false);
    setMessage("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative">
      <Link
        to="/"
        className="absolute top-20 text-sm hover:underline left-20 text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
      >
        <FaChevronLeft size={13} />
        back
      </Link>

      {emailSent ? (
        <div className="bg-[#f5f5f5] border border-[rgba(0,0,0,0.25)] p-8 shadow-md w-full max-w-md flex flex-col gap-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <MdEmail className="text-3xl text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Check Your Email</h1>
          <p className="text-gray-600">We've sent a password reset link to:</p>
          <p className="font-medium text-[#013F5E]">{email}</p>
          <p className="text-sm text-gray-500">
            Click the link in your email to reset your password. If you don't
            see the email, check your spam folder.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={handleResend}
              className="text-[#013F5E] hover:underline text-sm"
            >
              Didn't receive the email? Try again
            </button>
            <Link
              to="/"
              className="bg-[#013F5E] text-white py-2 rounded-md hover:bg-[#012a3f] transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-[#f5f5f5] border border-[rgba(0,0,0,0.25)] p-8 shadow-md w-full max-w-md flex flex-col gap-4"
        >
          <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[rgba(0,0,0,0.25)] p-2 rounded-md focus:outline-none focus:border-[#013F5E]"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#013F5E] text-white py-2 rounded-md hover:bg-[#012a3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="text-center mt-2">
            <Link to="/" className="text-sm text-[#013F5E] hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgetPass;
