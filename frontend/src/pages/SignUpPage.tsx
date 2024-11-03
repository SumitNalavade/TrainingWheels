import React, { FormEvent, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import useAppStore from "../stores/useAppStore";
import { signInWithGoogle } from "../services/authService"; 

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const setUser = useAppStore(state => state.setUser);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = async (event: FormEvent) => {
        event.preventDefault();
        
        try {
            const response = await axios.post("http://127.0.0.1:5000/signup", { name, email, password });
            const user = response.data;

            if (user) {
                setUser(user);
                navigate("/studio");
            }
        } catch (error) {
            console.error("Error signing up:", error);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            await signInWithGoogle();
            const user = useAppStore.getState().user;
            if (user) {
                navigate("/studio");
            }
        } catch (error) {
            console.error("Google Sign-Up Error:", error);
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-5/12 bg-[#FBF7FF] flex flex-col justify-center items-center text-center">
                <h1 className="text-7xl font-bold -mt-2 leading-tight">
                    <span>Your Ideas,</span>
                    <br />
                    <span>Amplified</span>
                </h1>
                <p className="text-2xl font-semibold mb-12 mt-6 text-[#656D7A]">
                    Content-first AI that gives you peace of mind
                </p>

                <button
                    type="button"
                    className="w-2/3 p-2 bg-[#837FFC] text-white rounded-lg border border-transparent flex items-center justify-center"
                    onClick={handleGoogleSignUp}
                >
                    <FcGoogle className="mr-2 text-lg" /> Sign Up with Google
                </button>

                <form className="w-2/3 flex flex-col items-center mt-8" onSubmit={handleSignUp}>
                    <div className="w-full mb-4">
                        <p className="mb-1 text-left text-xs font-sans font-semibold">Name</p>
                        <input
                            type="text"
                            placeholder="Abhiram Iruku"
                            onChange={(evt) => setName(evt.target.value)}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="w-full mb-4">
                        <p className="mb-1 text-left text-xs font-sans font-semibold">Email</p>
                        <input
                            type="email"
                            placeholder="abhiramiruku@utexas.edu"
                            onChange={(evt) => setEmail(evt.target.value)}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="w-full mb-4">
                        <p className="mb-1 text-left text-xs font-sans font-semibold">Password</p>
                        <input 
                            type="password"
                            placeholder="hookem26"
                            onChange={(evt) => setPassword(evt.target.value)}
                            className="w-full p-2 mb-4 border border-gray-300 rounded-lg" 
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 bg-[#837FFC] text-white rounded-lg border border-transparent"
                    >
                        Sign Up
                    </button>

                    <p className="mt-6 text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link to="/signin" className="text-[#837FFC] hover:underline font-semibold">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
            
            <div className="w-7/12 bg-[#ffffff] flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-gray-300 flex items-center justify-center border-2 border-dashed border-gray-500 rounded-lg">
                    <p className="text-gray-600 text-lg">Video Placeholder</p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;