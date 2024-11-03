import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { BsFiletypePdf, BsCameraVideo } from "react-icons/bs";
import { CiImageOn } from "react-icons/ci";
import { BsFillImageFill } from "react-icons/bs";
import { FiUpload, FiSidebar } from "react-icons/fi";
import { FaPenNib } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";

const fileTypes = ["jpeg", "jpg", "png", "mov", "pdf", "mp4"];

interface IFile extends File {
    url: string
}

interface SidebarProps {
    files: IFile[];
    onFileChange: (file: File) => void;
    showSidebar: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    files,
    onFileChange,
    showSidebar,
    toggleSidebar,
}) => {
    const getFileIcon = (file: File) => {
        const iconClass = "text-4xl text-gray-600 transition-colors duration-200";

        switch (file.type) {
            case "image/jpeg":
            case "image/jpg":
            case "image/png":
                return <CiImageOn className={iconClass} />;
            case "video/quicktime":
            case "video/mp4":
                return <BsCameraVideo className={iconClass} />;
            case "application/pdf":
            case "pdf":
                return <BsFiletypePdf className={iconClass} />;
            default:
                return <BsFillImageFill className={iconClass} />;
        }
    };

    if (!showSidebar) {
        return (
            <div className="w-16 bg-[#FBF7FF] border-r border-gray-200 p-4 flex flex-col">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg transition-colors duration-200"
                >
                    <FiSidebar className="text-2xl text-gray-600" />
                </button>
            </div>
        );
    }

    return (
        <div className="w-80 border-r border-gray-200 flex flex-col h-full bg-[#FBF7FF]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg transition-colors duration-200"
                >
                    <FiSidebar className="text-2xl text-gray-600" />
                </button>
                <FaPenNib className="text-2xl" />
            </div>

            <div className="p-4">
                <div className="relative">
                    <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Content..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pl-4 pr-4 pb-4">
                <FileUploader
                    handleChange={onFileChange}
                    name="file"
                    types={fileTypes}
                >
                    <div className="h-full w-full border-dashed border-2 border-gray-300 rounded-lg p-4">
                        {files.length ? (
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
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-gray-500 text-center">
                                    Drag and drop or upload.
                                </div>
                            </div>
                        )}
                    </div>
                </FileUploader>
            </div>

        </div >
    );
};

export default Sidebar;