import React, { useEffect, useState } from "react";
import useAppStore from "../stores/useAppStore";
import Sidebar from "../components/Sidebar";
import { FiUpload } from "react-icons/fi";
import { BsSend } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { ImEmbed2 } from "react-icons/im";
import Chat from "./Chat";
import { v4 as uuid } from "uuid";
import { IoShareSocialOutline } from "react-icons/io5";
import { LiaHistorySolid } from "react-icons/lia";
import EmbedPopup from "../components/EmbedPopup";
// @ts-ignore
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
  };
}

interface IFile extends File {
  url: string;
}

interface FileData {
  name: string;
  url: string;
  type: string;
}

const StudioPage: React.FC = () => {
  const [files, setFiles] = useState<IFile[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [messages, setMessages] = useState<ResponseData[]>([
    {
      type: "ai",
      data: {
        content: "Howdy! How may I help you?",
        additional_kwargs: {},
        response_metadata: {},
        type: "human",
        name: null,
        id: null,
        example: false,
      },
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [conversationId, setConversationId] = useState(uuid());

  const user = useAppStore((state) => state.user);

  const fetchPreviousFiles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:5000/get_file?user_id=${user?.id}`
      );
      const previousFiles = response.data;

      setFiles(previousFiles);
    } catch (error) {
      console.error("Error fetching previous files:", error);
      alert("Failed to load previous files");
    }
  };

  const handleFileChange = async (file: File) => {
    try {
      setFiles((prevFiles) => [...prevFiles, file as IFile]);

      const formData = new FormData();
      formData.append("file", file);

      await axios.post(
        `http://127.0.0.1:5000/upload?user_id=${user?.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file");
    }
  };

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
        example: false,
      },
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage("");

    const response = (
      await axios.post("http://127.0.0.1:5000/search", {
        user_id: user?.id,
        query: inputMessage,
        conversation_id: conversationId,
      })
    ).data;

    setMessages((prevMessages) => [...prevMessages, response]);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPreviousFiles();
    }
  }, [user?.id]);

  const [showModal, setShowModal] = useState(false);

  const showShareModal = () => {
    setShowModal(true);
  };

  const closeShareModal = () => {
    setShowModal(false);
  };
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <div>
      <nav className="w-full h-24 bg-[#FBF7FF] flex items-center justify-between px-6 py-6 border-b">
        <div className="flex items-center">
          <img src={mascot} alt="Mascot" className="h-12 w-auto" />
        </div>

        <div className="text-xl font-semibold space-x-6">
          <button className="text-sm antialiased bg-[#F1F0FF] px-2 py-2 rounded-lg">
            Product
          </button>
          <button className="text-sm antialiased">Pricing</button>
          <button className="text-sm antialiased">Contact</button>
          <button className="rounded-full px-5 py-2 bg-[#837FFC] text-sm text-[#FFFFFF] border border-transparent hover:text-[#837FFC] hover:bg-[#FFFFFF] hover:border-[#837FFC] antialiased inline-flex items-center gap-2">
            Share <IoShareSocialOutline />
          </button>
        </div>
      </nav>

      <div className="flex h-screen">
        <Sidebar
          files={files}
          onFileChange={handleFileChange}
          showSidebar={showSidebar}
          toggleSidebar={toggleSidebar}
        />

        <div className="w-3/4 p-1 pl-12 flex flex-col justify-between">
          {/* <div
            className="flex justify-between items-center mt-2 mb-24"
            onClick={showShareModal}
          >
            <img src={mascot} alt="Mascot" />
            <div className="flex p-3 rounded-lg bg-purple-200 space-x-4 hover:bg-purple-300 cursor-pointer">
              <span className="text-md">Embed</span>
              <ImEmbed2 size={24} />
            </div>
          </div> */}

          {showModal && (
            <EmbedPopup
              onClose={closeShareModal}
              embedCode={`<iframe src="http://localhost:5173/chat/${user?.id}" title="Chat" width="100%" height="600" style={{ border: "none" }}></iframe>`}
            />
          )}

          <div className="space-y-8 overflow-y-auto h-full">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "human" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs text-sm ${
                    message.type === "human" ? "bg-purple-100" : "bg-gray-200"
                  }`}
                >
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

export default StudioPage;
