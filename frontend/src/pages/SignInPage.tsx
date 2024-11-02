import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const SignInPage: React.FC = () => {
    const navigate = useNavigate();
    const handleSignIn = (event: React.MouseEvent) => {
        event.preventDefault();
        navigate("/studio")
    }
    return (
        <div className="flex h-screen">
            <div className="w-5/12 bg-[#FBF7FF] flex flex-col justify-center items-center text-center">
                <h1 className="text-7xl font-bold -mt-2 leading-tight">
                    <span>Your Ideas,</span>
                    <br />
                    <span>Amplified</span>
                </h1>
                <p className="text-lg font-semibold mb-12 mt-12 text-[#656D7A]">
                    Content-first AI that gives you peace of mind
                </p>

                <button
                    type="submit"
                    className="w-2/3 p-2 bg-[#D1D1D1] text-white rounded-lg border border-transparent hover:border-black flex items-center justify-center"
                >
                    <FcGoogle className="mr-2 text-lg" /> Sign In with Google
                </button>

                <form className="w-2/3 flex flex-col items-center mt-8">
                    <div className="w-full mb-4">
                        <p className="mb-1 text-left text-xs font-sans font-semibold">Email or name</p>
                        <input
                            type="email"
                            placeholder="abhiramiruku@utexas.edu"
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="w-full mb-4">
                    <p className="mb-1 text-left text-xs font-sans font-semibold">Password</p>
                        <input 
                            type="password"
                            placeholder="hookem26"
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg" />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 bg-[#D1D1D1] text-white rounded-lg border border-transparent hover:border-black"
                        onClick={handleSignIn}
                    >
                        Sign In
                    </button>
                </form>
            </div>
            
            <div className="w-7/12 bg-[#ffffff] flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-gray-300 flex items-center justify-center border-2 border-dashed border-gray-500 rounded-lg">
                    <p className="text-gray-600 text-lg">Video Placeholder</p>
                </div>
            </div>
        </div>
    );
}

export default SignInPage;
