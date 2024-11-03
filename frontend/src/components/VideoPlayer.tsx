import React from 'react';

const VideoPlayer = ({ video }) => {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-white shadow-[0_0_175px_#c1bff5]">
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
      >
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>

  );
};

export default VideoPlayer;