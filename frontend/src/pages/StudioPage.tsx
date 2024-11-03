import React, { useEffect, useState } from "react";
import useAppStore from "../stores/useAppStore";
import Sidebar from '../components/Sidebar';
import { FiUpload } from "react-icons/fi";
import { BsSend } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { ImEmbed2 } from "react-icons/im";

// @ts-ignore
import mascot from "../assets/mascot.png";
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

import axios from "axios";
import Chat from "../components/Chat";

const StudioPage: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [showSidebar, setShowSidebar] = useState(true);

    const user = useAppStore(state => state.user);

    const handleFileChange = async (file: File) => {
        setFiles((prevFiles) => [...prevFiles, file]);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`http://localhost:5000/upload?user_id=${user?.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch {
            alert("An error occured, please try again later")
        }
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

            <div className="w-5/6">
                <Chat />
            </div>
        </div>
    );
}

export default StudioPage;