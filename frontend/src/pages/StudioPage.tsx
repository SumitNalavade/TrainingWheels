import React from "react";
import useAppStore from "../stores/useAppStore";

const StudioPage: React.FC = () => {
    const user = useAppStore(state => state.user);
    
    return (
        <>
            <h1>Studio Page</h1>

            <p>{user?.name}</p>
        </>
    )
}

export default StudioPage;