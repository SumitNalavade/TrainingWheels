import React from "react";
import mascot from "../assets/mascot.png";
import { useNavigate } from "react-router-dom";
import { LuMessageSquare } from "react-icons/lu";
import { FiCloudLightning } from "react-icons/fi";
import { GrDocumentText } from "react-icons/gr";
import { BsUpload } from "react-icons/bs";
import { GoDatabase } from "react-icons/go";
import { PiBracketsAngleThin } from "react-icons/pi";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const handleStartToday = (event: React.MouseEvent) => {
    event.preventDefault();
    navigate("/signup");
  };
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7FF]">
      <nav className="w-full h-20 bg-[#FBF7FF] flex items-center justify-between px-8 py-4 mb-14">
        <div className="flex items-center">
          <img src={mascot} alt="Mascot" className="h-10 w-auto" />
        </div>

        <div className="text-lg font-semibold">
          <button
            className="rounded-lg px-4 py-2 bg-[#E0E0E0] text-sm text-[#999999] border border-transparent hover:border-black"
            onClick={handleStartToday}
          >
            Start Today - It's Free
          </button>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center px-8 bg-[#FBF7FF]">
        <div className="flex w-full max-w-5xl space-x-8">
          <div className="flex-1">
            <h1 className="text-5xl font-bold">
              <span>Add AI Chat to Your</span>
              <br />
              <span>Website in Minutes</span>
            </h1>
            <p className="mt-4 text-xs text-[#656D7A]">
              Create custom AI chatbots trained on your content. Embed them
              anywhere.
              <br />
              <span className="block text-center">No coding required.</span>
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                className="w-48 px-4 py-2 bg-[#E0E0E0] text-[#999999] text-xs rounded-lg border border-transparent hover:border-black"
                onClick={handleStartToday}
              >
                Get Started For Free
              </button>
              <button className="w-48 px-4 py-2 bg-[#FBF7FF] text-[#999999] text-xs rounded-lg border border-transparent hover:border-black">
                View Demo
              </button>
            </div>
          </div>
          <div className="flex-1 bg-gray-200 h-64 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg">
            <p className="text-gray-500">Demo Video Placeholder</p>
          </div>
        </div>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center px-8 text-center my-20 bg-[#FBF7FF]">
        <h1 className="text-5xl font-bold">See It In Action</h1>
        <p className="mt-4 text-xs text-[#656D7A]">
          Our chatbots provide natural, engaging responses based on your
          content.
          <br />
          <span className="block">Try our demo to see how it works</span>
        </p>
      </div>

      <div className="flex-grow flex items-center justify-center px-8 mb-20 ">
        <div className="flex w-full max-w-5xl space-x-8">
          <div className="flex-1 bg-gray-200 h-64 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg">
            <p className="text-gray-500">Demo Functionality Placeholder</p>
          </div>
          <div className="flex-1 space-y-20">
            <div className="flex items-center space-x-2">
              <LuMessageSquare className="text-3xl" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold">
                  Natural Conversations
                </span>
                <span className="text-xs text-gray-500">
                  Engaging responses that feel human-like
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FiCloudLightning className="text-3xl" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold">Lightning Fast</span>
                <span className="text-xs text-gray-500">
                  Instant responses to keep your users engaged
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <GrDocumentText className="text-3xl" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold">
                  Custom Knowledge Base
                </span>
                <span className="text-xs text-gray-500">
                  Enhance responses with your own documents and data
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center text-5xl mt-12">
        <h1>How It Works</h1>
      </div>
      <div className="flex items-center justify-center mt-12">
        <div className="flex space-x-10 max-w-5xl w-full px-4">
          <div className="flex-1 bg-[#EFEFEF] flex flex-col items-center justify-center rounded-lg p-4 min-h-[150px]">
            <BsUpload className="text-4xl" />
            <p className="font-bold text-lg">Upload Your Content</p>
            <p className="text-center text-sm text-gray-600 mt-2">
              Simply upload your documents, FAQs, or knowledge base. We'll
              process and index your content automatically.
            </p>
          </div>
          <div className="flex-1 bg-[#EFEFEF] flex flex-col items-center justify-center rounded-lg p-4 min-h-[150px]">
            <GoDatabase className="text-4xl" />
            <p className="font-bold text-lg">Train Your Bot</p>
            <p className="text-center text-sm text-gray-600 mt-2">
              Simply upload your documents, FAQs, or knowledge base. We'll
              process and index your content automatically.
            </p>
          </div>
          <div className="flex-1 bg-[#EFEFEF] flex flex-col items-center justify-center rounded-lg p-4 min-h-[150px]">
            <PiBracketsAngleThin className="text-4xl" />
            <p className="font-bold text-lg">Embed Anywhere</p>
            <p className="text-center text-sm text-gray-600 mt-2">
              Simply upload your documents, FAQs, or knowledge base. We'll
              process and index your content automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#EFEFEF] flex flex-col items-center justify-center rounded-lg p-4 mt-36">
        <h1 className="text-5xl font-bold my-6">Ready to Get Started?</h1>
        <p className="text-[#656D7A] mb-6">
          Join thousands of websites already using our chatbots to engage their
          <br />
          <span className="block text-center">
            visitors and provide better support.
          </span>
        </p>
        <button
          className="w-48 px-4 py-2 bg-[#E0E0E0] text-[#999999] text-xs rounded-lg border border-transparent hover:border-black"
          onClick={handleStartToday}
        >
          Create Your Chatbot Now
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
