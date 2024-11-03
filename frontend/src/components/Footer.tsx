import React from "react";
import mascot from "../assets/mascot.png";
import x from "../assets/x.svg";
import ig from "../assets/ig.svg";
import git from "../assets/git.svg";
import linkedin from "../assets/linkedin.svg";
import yt from "../assets/yt.svg";

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-50 p-8 pb-24">
            <div className="container mx-auto flex items-start">

                <div className="flex flex-col space-y-4">
                    <img src={mascot} alt="Logo" className="h-14 w-14" />
                    <div className="flex gap-4 text-[#837FFC]">
                        <img src={x} alt="X icon" className="h-6 w-6" />
                        <img src={ig} alt="Instagram icon" className="h-6 w-6" />
                        <img src={git} alt="GitHub icon" className="h-6 w-6" />
                        <img src={yt} alt="YouTube icon" className="h-6 w-8"/>
                        <img src={linkedin} alt="LinkedIn icon" className="h-6 w-6" />
                    </div>
                </div>


                <div className="flex-1 flex justify-center space-x-40">

                    <div>
                        <h3 className="text-[#837FFC]">Use cases</h3>
                        <ul className="mt-2 space-y-2">
                            <li className="text-gray-700 ">Personal websites</li>
                            <li className="text-gray-700 ">Small businesses</li>
                            <li className="text-gray-700 ">Corporations</li>
                            <li className="text-gray-700 ">Students</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[#837FFC] font-semibold">Resources</h3>
                        <ul className="mt-2 space-y-2">
                            <li className="text-gray-700 ">Tutorials</li>
                            <li className="text-gray-700 ">Client use cases</li>
                            <li className="text-gray-700 ">Documentation</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[#837FFC] font-semibold">Contact</h3>
                        <ul className="mt-2 space-y-2">
                            <li className="text-gray-700 ">Email</li>
                            <li className="text-gray-700 ">LinkedIn</li>
                            <li className="text-gray-700 ">Instagram</li>
                            <li className="text-gray-700 ">Support</li>
                        </ul>
                    </div>

                </div>
            </div>
        </footer>
    );
}

export default Footer;
