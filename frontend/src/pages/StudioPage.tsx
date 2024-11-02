import React, { useState } from "react";
import useAppStore from "../stores/useAppStore";
import Sidebar from '../components/Sidebar';

const StudioPage: React.FC = () => {

    const [files, setFiles] = useState<File[]>([]);
    const [showSidebar, setShowSidebar] = useState(true);

    const handleFileChange = (file: File) => {
        setFiles((prevFiles) => [...prevFiles, file]);
    };

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    return (
        <div className="flex h-screen">
            <Sidebar
                files={files}
                onFileChange={handleFileChange}
                showSidebar={showSidebar}
                toggleSidebar={toggleSidebar}
            />
            <div className="w-3/4 p-6 flex flex-col justify-between">
                <div className="space-y-4 overflow-y-auto">
                    <div className="flex justify-start">
                        <div className="bg-gray-200 p-3 rounded-lg max-w-xs text-sm">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="bg-purple-100 p-3 rounded-lg max-w-xs text-sm">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center mt-4 border-t border-gray-200 pt-4">
                    <input
                        type="text"
                        placeholder="Type your message here..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                    />
                </div>
            </div>
        </div>
    );
}

export default StudioPage;