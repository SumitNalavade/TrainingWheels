import React, { useEffect, useState } from "react";
import useAppStore from "../stores/useAppStore";
import Sidebar from '../components/Sidebar';
import mascot from "../assets/mascot.png";
import { FiUpload } from "react-icons/fi";
import { BsSend } from "react-icons/bs";

interface ResponseData {
    type: string,
    data: {
        content: string,
        additional_kwargs: {},
        response_metadata: {},
        type: string,
        name: null,
        id: null,
        example: false,
        tool_calls?: any[];
        invalid_tool_calls?: any[];
        usage_metadata?: any;
    }
}

const StudioPage: React.FC = () => {

    const [files, setFiles] = useState<File[]>([]);
    const [showSidebar, setShowSidebar] = useState(true);

    const handleFileChange = (file: File) => {
        setFiles((prevFiles) => [...prevFiles, file]);
    };

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    const [messages, setMessages] = useState<ResponseData[]>([]);
    const [inputMessage, setInputMessage] = useState("");

    const handleSendMessage = () => {
        if (inputMessage.trim()) {

            const newMessage: ResponseData = {
                type: "human",
                data: {
                    content: inputMessage,
                    additional_kwargs: {},
                    response_metadata: {},
                    type: "human",
                    name: null,
                    id: null,
                    example: false
                }
            }

            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setInputMessage("");
        }
    };

    useEffect(() => {
        console.log("Updated messages:", messages);
    }, [messages]);

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
    };

    useEffect(() => {
        const sampleMessages: ResponseData[] = [
            {
                type: "human",
                data: {
                    content: "is it safe to travel for new born babies?",
                    additional_kwargs: {},
                    response_metadata: {},
                    type: "human",
                    name: null,
                    id: null,
                    example: false
                }
            },
            {
                type: "ai",
                data: {
                    content: "It tends to be safer to avoid unnecessary travel with newborn babies, as they are more vulnerable to infections and need time to adjust to their new environment. It's important to consult with a healthcare provider before making any travel plans with a newborn.",
                    additional_kwargs: {},
                    response_metadata: {},
                    type: "ai",
                    name: null,
                    id: null,
                    example: false,
                    tool_calls: [],
                    invalid_tool_calls: [],
                    usage_metadata: null
                }
            },
        ];

        setMessages(sampleMessages);
    }, []);

    return (
        <div className="flex h-screen">
            <Sidebar
                files={files}
                onFileChange={handleFileChange}
                showSidebar={showSidebar}
                toggleSidebar={toggleSidebar}
            />

            <div className="w-3/4 p-1 pl-10 pr-10 flex flex-col justify-between">

                <div className="flex justify-between items-center mt-2 mb-24">
                    <img src={mascot}></img>
                    <div className="flex p-3 rounded-lg bg-purple-200 space-x-4 hover:bg-purple-300 cursor-pointer">
                        <span className="text-md">
                            Share
                        </span>
                        <FiUpload size={20} />
                    </div>
                </div>

                <div className="space-y-8 overflow-y-auto h-full">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.type === "human" ? "justify-end" : "justify-start"}`}>
                            <div className={`p-3 rounded-lg max-w-xs text-sm ${message.type === "human" ? "bg-purple-100" : "bg-gray-200"}`}>
                                {message.data.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center mt-4 border-t border-gray-200 pt-4 pb-4">
                    <input
                        type="text"
                        placeholder="Type your message here..."
                        className="w-full p-2 border border-gray-300 bg-[#E0E0E0] rounded-md focus:outline-none text-sm"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <button onClick={handleSendMessage} className="ml-2 p-2 text-purple-500 hover:text-purple-700">
                        <BsSend size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StudioPage;