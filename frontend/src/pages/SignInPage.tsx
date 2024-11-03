import React, { FormEvent, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import useAppStore from "../stores/useAppStore";
import { signInWithGoogle } from "../services/authService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    { id: 1, content: "Slide 1 Content" },
    { id: 2, content: "Slide 2 Content" },
    { id: 3, content: "Slide 3 Content" },
    { id: 4, content: "Slide 4 Content" },
  ];

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const user = (
        await axios.post("http://127.0.0.1:5000/signin", { email, password })
      ).data;

      if (user) {
        setUser(user);
        navigate("/studio");
      }
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      const user = useAppStore.getState().user;

      if (user) {
        navigate("/studio");
      } else {
        console.warn("User not found after Google sign-in.");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar noMargin />
      <div className="flex flex-grow min-h-[90vh]">
        <div className="w-5/12 bg-[#FBF7FF] flex flex-col justify-center items-center text-center">
          <h1 className="text-7xl font-bold leading-tight">
            <span>Your Ideas,</span>
            <br />
            <span>Amplified</span>
          </h1>
          <p className="text-2xl font-semibold my-6 text-[#656D7A]">
            Content-first AI that gives you peace of mind
          </p>

          <button
            type="button"
            className="w-2/3 py-2 bg-[#837FFC] text-white rounded-lg flex items-center justify-center"
            onClick={handleGoogleSignIn}
          >
            <FcGoogle className="mr-2 text-lg" /> Sign In with Google
          </button>

          <form
            className="w-2/3 flex flex-col items-center mt-8"
            onSubmit={handleSignIn}
          >
            <div className="w-full mb-4">
              <p className="mb-1 text-left text-xs font-sans font-semibold">
                Email
              </p>
              <input
                type="email"
                placeholder="abhiramiruku@utexas.edu"
                onChange={(evt) => setEmail(evt.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="w-full mb-4">
              <p className="mb-1 text-left text-xs font-sans font-semibold">
                Password
              </p>
              <input
                type="password"
                placeholder="hookem26"
                onChange={(evt) => setPassword(evt.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#837FFC] text-white rounded-lg"
            >
              Sign In
            </button>

            <p className="mt-6 text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#837FFC] hover:underline font-semibold"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>

        <div className="w-7/12 bg-[#ffffff] flex flex-col items-center justify-center gap-y-5">
          <div className="w-3/4 h-3/4 bg-gray-300 flex items-center justify-center rounded-lg" >
            <p className="text-gray-600 text-lg">{slides[currentIndex].content}</p>
          </div>

          <div className="flex mt-4 space-x-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className={`w-2.5 h-2.5 rounded-full ${currentIndex === index ? 'bg-gray-600' : 'bg-gray-300'}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignInPage;
