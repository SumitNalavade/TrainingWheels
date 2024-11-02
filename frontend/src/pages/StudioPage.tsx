import React from "react";
import useAppStore from "../stores/useAppStore";
import Sidebar from '../components/Sidebar';

const StudioPage: React.FC = () => {
    const user = useAppStore(state => state.user);

    return (
        <>
            {/* <div className="flex h-screen"> */}
            {/* <div className="w-[30%] bg-[#FBF7FF] p-4 flex"> */}

            <div>
                <Sidebar />

            </div>

            <p>{user?.name}</p>
        </>
    )
}

export default StudioPage;