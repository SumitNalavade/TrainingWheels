import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from 'react-router-dom';
import { BsSend } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { ImEmbed2 } from "react-icons/im";
import { v4 as uuid } from "uuid";
import mascot from "../assets/mascot.png";
import axios from "axios";

import EmbedPopup from "../components/EmbedPopup";
import { IoShareSocialOutline } from "react-icons/io5";

interface ResponseData {
    type: string;
    data: {
        content: string;
        additional_kwargs: {};
        response_metadata: {};
        type: string;
        name: null;
        id: null;
        example: false;
        tool_calls?: any[];
        invalid_tool_calls?: any[];
        usage_metadata?: any;
    }
}

const Chat: React.FC = () => {
    const { id: user_id } = useParams(); // Get the dynamic ID

    const [messages, setMessages] = useState<ResponseData[]>([{
        type: "ai",
        data: {
            content: "Howdy! How may I help you?",
            additional_kwargs: {},
            response_metadata: {},
            type: "human",
            name: null,
            id: null,
            example: false
        }
    }]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [conversationId, setConversationId] = useState(uuid());

    const handleSendMessage = async () => {
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
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputMessage("");

        const response = (await axios.post(`${import.meta.env.VITE_SERVER_URL}/search`, { user_id: user_id, query: inputMessage, conversation_id: conversationId })).data

        setMessages((prevMessages) => [...prevMessages, response]);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
    };

    const [showModal, setShowModal] = useState(false);

    const showShareModal = () => {
        setShowModal(true);
    };

    const closeShareModal = () => {
        setShowModal(false);
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="h-screen flex flex-col">
            <nav className="flex items-center justify-between px-6 py-4 bg-[#FBF7FF] border-b">
                <div className="flex items-center">
                    <Link to="/"> <img src={mascot} alt="Mascot" className="h-12 w-auto" /></Link>

                </div>
                <div className="text-xl font-semibold space-x-6">
                    <button onClick={showShareModal} className="rounded-full px-5 py-2 bg-[#837FFC] text-sm text-[#FFFFFF] border border-transparent  hover:border-[#837FFC] hover:bg-indigo-600 antialiased inline-flex items-center gap-2">
                        Share <IoShareSocialOutline />
                    </button>
                </div>
            </nav>

            <div className="flex-1 flex min-h-0">
                <div className="flex-1 flex flex-col p-1 pl-12">
                    <div className="flex-1 min-h-0 space-y-8 flex flex-col justify-end" ref={messagesEndRef}>
                        <div className="overflow-y-auto">
                            {messages.map((message, index) => (
                                <div key={index} className={`flex ${message.type === "human" ? "justify-end" : "justify-start"} mb-8`}>
                                    <div className={`p-3 rounded-lg max-w-xs text-sm ${message.type === "human" ? "bg-[#FBF7FF] text-gray-500 mr-12" : "text-gray-500 bg-gray-100"}`}>
                                        {message.data.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center border-t border-gray-200 pt-4 pb-4">
                        <input
                            type="text"
                            placeholder="Type your message here..."
                            className="w-full p-2 border bg-[#FBF7FF] border-gray-300 rounded-md focus:outline-none text-sm"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="ml-2 p-2 text-[#837FFC]"
                        >
                            <BsSend size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;