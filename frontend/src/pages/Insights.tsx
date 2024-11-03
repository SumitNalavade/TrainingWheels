import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import useAppStore from "../stores/useAppStore";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js';

// Register the required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface KeyTopics {
    [topicIndex: number]: string[];
}

interface DataDistribution {
    png: number;
    jpg: number;
    pdf: number;
    mov: number;
    jpeg: number;
    mp4: number;
}

const Insights: React.FC = () => {
    const [keyTopics, setKeyTopics] = useState<KeyTopics>({});
    const user = useAppStore(state => state.user);
    const chartRef = useRef<ChartJS>();

    const [topics, setTopics] = useState<number>(1);
    const [subtopics, setSubtopics] = useState<number>(1);
    const [fileData, setFileData] = useState<DataDistribution | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_SERVER_URL}/get-key-topics?user_id=${user?.id}&num_topics=${topics}&num_words=${subtopics}`)
            .then((response) => {
                const groupedTopics: KeyTopics = {};
                response.data.forEach((subtopic: string, index: number) => {
                    const topicIndex = Math.floor(index / subtopics);
                    if (!groupedTopics[topicIndex]) groupedTopics[topicIndex] = [];
                    groupedTopics[topicIndex].push(subtopic);
                });
                setKeyTopics(groupedTopics);
            })
            .catch((error) => {
                console.log("Error occurred", error);
            });
    }, [user?.id, topics, subtopics]);

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_SERVER_URL}/get-data-distribution?user_id=${user?.id}`)
            .then((response) => {
                setFileData(response.data);
            })
            .catch((error) => {
                console.log("Error occurred", error);
            });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [user?.id]);

    const handleDotClick = (index: number) => {
        setCurrentIndex(index);
    };

    const pieChartData: ChartData<'pie'> = {

        labels: ["JPEG", "JPG", "MOV", "MP4", "PDF", "PNG"],
        datasets: [
            {
                data: fileData ? Object.values(fileData) : [0, 0, 0, 0, 0, 0],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#FF9F40", "#9966FF"],
                hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#FF9F40", "#9966FF"],
            },
        ],
    };

    const chartOptions: ChartOptions<'pie'> = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar noMargin />

            <header className="text-center text-5xl font-bold my-6">
                Insights
            </header>

            <div className="flex flex-1 min-h-[600px]">
                <div className="w-1/2 flex flex-col items-center justify-center bg-gray-100 p-8">
                    <h1 className="text-3xl text-purple-500 mb-8">File Distribution</h1>
                    {fileData && (
                        <div className="w-full max-w-md">
                            <Pie data={pieChartData} options={chartOptions} />
                        </div>
                    )}
                </div>

                <div className="w-1/2 flex flex-col items-center justify-center p-10 bg-gray-200">
                    <h1 className="text-3xl text-purple-500 mb-4">Key Topics</h1>

                    <div className="flex items-center mb-4 space-x-4">
                        <label className="text-lg">Topics:</label>
                        <select
                            value={topics}
                            onChange={(e) => setTopics(Number(e.target.value))}
                            className="p-2 border rounded-md"
                        >
                            {[...Array(5)].map((_, i) => (
                                <option key={i} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>

                        <label className="text-lg">Key Words:</label>
                        <select
                            value={subtopics}
                            onChange={(e) => setSubtopics(Number(e.target.value))}
                            className="p-2 border rounded-md"
                        >
                            {[...Array(5)].map((_, i) => (
                                <option key={i} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-center h-96 w-96 text-center text-xl bg-white shadow-lg rounded-md p-8">
                        {keyTopics[currentIndex] ? (
                            <ul>
                                {keyTopics[currentIndex].map((subtopic, idx) => (
                                    <li key={idx}>{subtopic}</li>
                                ))}
                            </ul>
                        ) : (
                            <div>Loading Key Topics...</div>
                        )}
                    </div>

                    <div className="flex space-x-2 mt-4">
                        {Object.keys(keyTopics).map((_, index) => (
                            <button
                                key={index}
                                className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-400'}`}
                                onClick={() => handleDotClick(index)}
                            />
                        ))}
                    </div>

                    <div className="flex flex-wrap w-1/2 mt-8">
                        Above is a topic modeling NLP algorithm which detects n key topics and m key words within a topic.
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Insights;