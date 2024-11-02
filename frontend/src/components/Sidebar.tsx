import React from "react";
import { FileUploader } from "react-drag-drop-files";
import { BsFiletypePdf } from "react-icons/bs";
import { CiImageOn } from "react-icons/ci";
import { BsFillImageFill } from "react-icons/bs";
import { FiUpload } from "react-icons/fi";
import { FaPenNib } from "react-icons/fa";
import { FiSidebar } from "react-icons/fi";
import { BsCameraVideo } from "react-icons/bs";

const fileTypes = ["jpeg", "jpg", "png", "mov", "pdf", "mp4"];

interface SidebarProps {
    files: File[];
    onFileChange: (file: File) => void;
    showSidebar: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ files, onFileChange, showSidebar, toggleSidebar }) => {
    const getFileIcon = (file: File) => {
        switch (file.type) {
            case "image/jpeg":
            case "image/jpg":
            case "image/png":
                return <CiImageOn className="text-5xl" />;
            case "video/quicktime":
            case "video/mp4":
                return <BsCameraVideo className="text-5xl" />;
            case "application/pdf":
                return <BsFiletypePdf className="text-5xl" />;
            default:
                return <BsFillImageFill className="text-5xl" />;
        }
    };

    return (
        <>
            {showSidebar ? (
                <div className="w-[30%] bg-[#FBF7FF] p-4 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-4 p-2">
                        <FiSidebar size={30} onClick={toggleSidebar} className="cursor-pointer" />
                        <FaPenNib size={30} />
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search Content..."
                            className="w-full p-2 text-md border rounded-lg focus:outline-none text-gray-700 placeholder-gray-500 bg-[#E0E0E0]"
                        />
                    </div>
                    <div className="flex-grow overflow-y-auto p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                            {files.map((file, index) => (
                                <div key={index} className="flex flex-col items-center space-y-2">
                                    {getFileIcon(file)}
                                    <span className="text-sm text-center">{file.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <FileUploader
                        handleChange={onFileChange}
                        name="file"
                        types={fileTypes}
                    >
                        <div className="flex justify-center">
                            <div className="flex justify-center mt-4 w-3/4 p-3 border-gray-300 rounded-lg text-center cursor-pointer text-lg text-gray-600 bg-[#E0E0E0] hover:bg-gray-300 space-x-2 transition-colors duration-200">
                                <FiUpload size={26} />
                                <span className="hidden lg:inline">Upload Content</span>
                            </div>
                        </div>
                    </FileUploader>
                </div>
            ) : (
                <div className="w-[6%] bg-[#FBF7FF] p-4 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-4 p-2">
                        <FiSidebar size={30} onClick={toggleSidebar} className="cursor-pointer" />
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
