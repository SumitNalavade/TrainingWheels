import React from "react";
//@ts-ignore
import mascot from "../assets/mascot.png";
import { useNavigate } from "react-router-dom";
import { LuMessageSquare } from "react-icons/lu";
import { FiCloudLightning } from "react-icons/fi";
import { GrDocumentText } from "react-icons/gr";
import { BsUpload } from "react-icons/bs";
import { GoDatabase } from "react-icons/go";
import { PiBracketsAngleThin } from "react-icons/pi";
import Footer from "../components/Footer";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const handleStartToday = (event: React.MouseEvent) => {
    event.preventDefault();
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7FF]">
      <nav className="w-full h-24 bg-[#FBF7FF] flex items-center justify-between max-w-5xl mx-auto px-6 py-6 mb-16">
        <div className="flex items-center">
          <img src={mascot} alt="Mascot" className="h-12 w-auto" />
        </div>

        <div className="text-xl font-semibold">
          <button
            className="rounded-lg px-5 py-2 bg-[#E0E0E0] text-md text-[#999999] border border-transparent hover:border-black"
            onClick={handleStartToday}
          >
            Start Today - It's Free
          </button>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center px-10 bg-[#FBF7FF]">
        <div className="flex w-full max-w-6xl space-x-10">
          <div className="flex-1">
            <h1 className="text-5xl font-bold">
              <span>Add AI Chat to Your</span>
              <br />
              <span>Website in Minutes</span>
            </h1>
            <p className="mt-6 text-sm text-[#656D7A]">
              Create custom AI chatbots trained on your content. Embed them
              anywhere.
              <br />
              <span className="block text-center">No coding required.</span>
            </p>
            <div className="flex justify-center space-x-6 mt-8">
              <button
                className="w-52 px-6 py-3 bg-[#E0E0E0] text-[#999999] text-sm rounded-lg border border-transparent hover:border-black"
                onClick={handleStartToday}
              >
                Get Started For Free
              </button>
              <button className="w-52 px-6 py-3 bg-[#FBF7FF] text-[#999999] text-sm rounded-lg border border-transparent hover:border-black">
                View Demo
              </button>
            </div>
          </div>
          <div className="flex-1 bg-gray-200 h-72 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg">
            <p className="text-gray-500 text-lg">Demo Video Placeholder</p>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center px-10 text-center my-24 bg-[#FBF7FF]">
        <h1 className="text-5xl font-bold">See It In Action</h1>
        <p className="mt-6 text-sm text-[#656D7A]">
          Our chatbots provide natural, engaging responses based on your
          content.
          <br />
          <span className="block">Try our demo to see how it works</span>
        </p>
      </div>

      <div className="flex-grow flex items-center justify-center px-10 mb-24">
        <div className="flex w-full max-w-6xl space-x-10">
          <div className="flex-1 bg-gray-200 h-72 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg">
            <p className="text-gray-500 text-lg">
              Demo Functionality Placeholder
            </p>
          </div>
          <div className="flex-1 space-y-24">
            <div className="flex items-center space-x-4">
              <LuMessageSquare className="text-4xl" />
              <div className="flex flex-col">
                <span className="text-md font-semibold">
                  Natural Conversations
                </span>
                <span className="text-md text-gray-500">
                  Engaging responses that feel human-like
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FiCloudLightning className="text-4xl" />
              <div className="flex flex-col">
                <span className="text-md font-semibold">Lightning Fast</span>
                <span className="text-md text-gray-500">
                  Instant responses to keep your users engaged
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <GrDocumentText className="text-4xl" />
              <div className="flex flex-col">
                <span className="text-md font-semibold">
                  Custom Knowledge Base
                </span>
                <span className="text-md text-gray-500">
                  Enhance responses with your own documents and data
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center text-5xl mt-16">
        <h1>How It Works</h1>
      </div>

      <div className="flex items-center justify-center mt-16">
        <div className="flex space-x-12 max-w-6xl w-full px-6">
          <div className="flex-1 bg-[#EFEFEF] flex flex-col items-center justify-center rounded-lg p-6 min-h-[180px]">
            <BsUpload className="text-5xl" />
            <p className="font-bold text-xl">Upload Your Content</p>
            <p className="text-center text-md text-gray-600 mt-3">
              Simply upload your documents, FAQs, or knowledge base. We'll
              process and index your content automatically.
            </p>
          </div>
          <div className="flex-1 bg-[#EFEFEF] flex flex-col items-center justify-center rounded-lg p-6 min-h-[180px]">
            <GoDatabase className="text-5xl" />
            <p className="font-bold text-xl">Train Your Bot</p>
            <p className="text-center text-md text-gray-600 mt-3">
              Simply upload your documents, FAQs, or knowledge base. We'll
              process and index your content automatically.
            </p>
          </div>
          <div className="flex-1 bg-[#EFEFEF] flex flex-col items-center justify-center rounded-lg p-6 min-h-[180px]">
            <PiBracketsAngleThin className="text-5xl" />
            <p className="font-bold text-xl">Embed Anywhere</p>
            <p className="text-center text-md text-gray-600 mt-3">
              Simply upload your documents, FAQs, or knowledge base. We'll
              process and index your content automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#EFEFEF] flex flex-col items-center justify-center rounded-lg p-8 mt-36">
        <h1 className="text-5xl font-bold my-8">Ready to Get Started?</h1>
        <p className="text-[#656D7A] mb-8 text-md">
          Join thousands of websites already using our chatbots to engage their
          <br />
          <span className="block text-center">
            visitors and provide better support.
          </span>
        </p>
        <button
          className="w-52 px-6 py-3 bg-[#E0E0E0] text-[#999999] text-sm rounded-lg border border-transparent hover:border-black"
          onClick={handleStartToday}
        >
          Create Your Chatbot Now
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;