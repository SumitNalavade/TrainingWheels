import React from "react";
import useAppStore from "../stores/useAppStore";
import Sidebar from '../components/Sidebar';

const StudioPage: React.FC = () => {
    const user = useAppStore(state => state.user);

    return (
        <>
            <div>
                <Sidebar />
            </div>

            <p>{user?.name}</p>
        </>
    )
}

export default StudioPage;