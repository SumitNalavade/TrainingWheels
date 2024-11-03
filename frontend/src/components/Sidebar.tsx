import React from "react";
import { FileUploader } from "react-drag-drop-files";
import { IoSearchOutline } from "react-icons/io5";
import { FiUpload } from "react-icons/fi";
import { FiSidebar } from "react-icons/fi";
import { BsFiletypePdf } from "react-icons/bs";
import { BsCameraVideo } from "react-icons/bs";
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
}

const Sidebar: React.FC<SidebarProps> = ({
    files,
    onFileChange,
    showSidebar,
    toggleSidebar,
}) => {
    const getFileIcon = (file: File) => {
        const iconClass = "text-4xl text-[#837FFC]";

        switch (file.type) {
            case "jpeg":
            case "jpg":
            case "png":
                return <CiImageOn className={iconClass} />;
            case "quicktime":
            case "mp4":
                return <BsCameraVideo className={iconClass} />;
            case "pdf":
                return <BsFiletypePdf className={iconClass} />;
            default:
                return <BsFiletypePdf className={iconClass} />;
        }
    };

    if (!showSidebar) {
        return (
            <div className="w-16 bg-gray-200 border-r border-gray-100 p-4 flex flex-col">
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
        <div className="w-96 bg-gray-200 border-r border-gray-100 flex flex-col h-full">
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
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                    />
                </div>
            </div>

            <div className="px-4 mb-4">
                <FileUploader
                    handleChange={onFileChange}
                    name="file"
                    types={fileTypes}
                >
                    <button className="w-full py-3 px-4 bg-[#837FFC] hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                        <FiUpload className="text-xl" />
                        <span>Upload files</span>
                    </button>
                </FileUploader>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
                <div className="grid grid-cols-2 gap-4">
                    {files.map((file, index) => (
                        <a
                            key={index}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <div className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                                <div className="flex flex-col items-center">
                                    {getFileIcon(file)}
                                    <span className="mt-2 text-sm text-gray-600 text-center truncate w-full">
                                        {file.name}
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;