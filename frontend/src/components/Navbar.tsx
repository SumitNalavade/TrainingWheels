import React from "react";
//@ts-ignore
import mascot from "../assets/mascot.png";
import { useNavigate } from "react-router";

interface NavbarProps {
  noMargin?: boolean;
  purple?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ noMargin, purple }) => {
  const navigate = useNavigate();
  const routeToSignIn = (event: React.MouseEvent) => {
    event.preventDefault();
    navigate("/signin");
  };
  return (
    <nav
      className={`w-full h-24 bg-[#FBF7FF] ${
        purple ? "bg-[#FBF7FF]" : "bg-[#FFFFFF]"
      } flex items-center justify-between px-6 py-6 ${
        noMargin ? "" : "mb-16"
      } border-b`}
    >
      <div className="flex items-center">
        <img src={mascot} alt="Mascot" className="h-12 w-auto" />
      </div>

      <div className="text-xl font-semibold space-x-6">
        <button className="text-sm antialiased bg-[#F1F0FF] px-2 py-2 rounded-lg">
          Product
        </button>
        <button className="text-sm antialiased">Pricing</button>
        <button className="text-sm antialiased">Contact</button>
        <button
          className="rounded-full px-5 py-2 bg-[#FFFFFF] text-sm text-[#837FFC] border border-[#837FFC] hover:text-[#FFFFFF] hover:bg-[#837FFC] antialiased"
          onClick={routeToSignIn}
        >
          Sign In
        </button>
        <button className="rounded-full px-5 py-2 bg-[#837FFC] text-sm text-[#FFFFFF] border border-transparent hover:text-[#837FFC] hover:bg-[#FFFFFF] hover:border-[#837FFC] antialiased">
          Try it for Free
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
