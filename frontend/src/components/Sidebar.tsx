import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { IoSearchOutline } from "react-icons/io5";
import { FiUpload } from "react-icons/fi";
import { FiSidebar } from "react-icons/fi";
import { BsFiletypePdf } from "react-icons/bs";
import { BsCameraVideo } from "react-icons/bs";
import { BsUpload } from "react-icons/bs";
import { CiImageOn } from "react-icons/ci";

const fileTypes = ["jpeg", "jpg", "png", "mov", "pdf", "mp4"];

interface IFile extends File {
    url: string;
}

interface SidebarProps {
    files: IFile[];
    onFileChange: (file: File) => void;
    showSidebar: boolean;
    toggleSidebar: () => void;
    isUploading,
}

const Sidebar: React.FC<SidebarProps> = ({
    files,
    onFileChange,
    showSidebar,
    toggleSidebar,
    isUploading,
}) => {
    const getFileIcon = (file: File) => {
        const iconClass = "text-4xl text-gray-500";

        switch (file.type) {
            case "image/jpeg":
            case "image/jpg":
            case "image/png":
                return <CiImageOn className={iconClass} />;
            case "video/quicktime":
            case "video/mp4":
            case "mp4":
                return <BsCameraVideo className={iconClass} />;
            case "application/pdf":
            case "pdf":
                return <BsFiletypePdf className={iconClass} />;
            default:
                return <BsFiletypePdf className={iconClass} />;
        }
    };

    if (!showSidebar) {
        return (
            <div className="w-16 bg-[#FBF7FF] border-r border-gray-100 p-4 flex flex-col">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                    <FiSidebar className="text-2xl" />
                </button>
            </div>
        );
    }

    return (
        <div className="w-96 bg-[#F5F5F5] border-r border-gray-100 flex flex-col h-full">
            <div className="p-4 flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                    <FiSidebar className="text-2xl" />
                </button>
            </div>

            <div className="px-4 mb-4">
                <div className="relative">
                    <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search content"
                        className="w-full pl-10 pr-4 py-2 border-2 border-[#837FFC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pl-4 pr-4 pb-4">
                <div className="border-2 border-dashed border-[#837FFC] rounded-lg p-6">
                    <FileUploader
                        handleChange={onFileChange}
                        name="file"
                        hoverTitle=""
                    >
                        <div className="text-gray-500 text-center flex flex-col items-center justify-center">
                            <BsUpload className="text-xl text-gray-500" />
                            <p className="font-semibold">Upload Files</p>
                        </div>
                    </FileUploader>
                </div>

                {isUploading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="loader">Loading...</div>
                    </div>
                ) : (
                    <div className="h-full w-full border-dashed rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {files.map((file, index) => (
                                <a
                                    key={index}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="m-1"
                                >
                                    <div className="group flex flex-col items-center p-2 space-y-1 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer">
                                        {getFileIcon(file)}
                                        <span className="text-xs text-gray-600 text-center truncate w-full">
                                            {file.name}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div >
    );
};

export default Sidebar;