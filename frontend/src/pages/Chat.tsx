import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { BsSend } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { ImEmbed2 } from "react-icons/im";
import { v4 as uuid } from "uuid";
import mascot from "../assets/mascot.png";
import axios from "axios";

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

        const response = (await axios.post("http://localhost:5000/search", { user_id: user_id, query: inputMessage, conversation_id: conversationId })).data

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

    return (
        <div className="h-screen p-1 pl-10 pr-10 flex flex-col justify-between">
            <div
                className="flex justify-between items-center mt-2 mb-24"
                onClick={showShareModal}
            >
                <img src={mascot} alt="Mascot" className="w-15 h-15" />
                <div className="flex p-3 rounded-lg bg-purple-200 space-x-4 hover:bg-purple-300 cursor-pointer">
                    <span className="text-md">
                        Embed
                    </span>
                    <ImEmbed2 size={24} />
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Embed This!</h2>
                            <button onClick={closeShareModal}>
                                <AiOutlineClose size={20} />
                            </button>
                        </div>
                        <p> {`<iframe src="http://localhost:5173/chat/${user_id}" title="Chat" width="100%" height="600" style={{ border: "none" }}></iframe>`}</p>
                    </div>
                </div>
            )}

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
    );
};

export default Chat;