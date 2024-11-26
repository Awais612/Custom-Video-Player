import React, { useRef, useState, useEffect } from "react";
import "./App.css";

const CustomVideoPlayer = ({url}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
  const handleFullscreen = () => {
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    } else if (videoRef.current.mozRequestFullScreen) {
      videoRef.current.mozRequestFullScreen();
    } else if (videoRef.current.msRequestFullscreen) {
      videoRef.current.msRequestFullscreen();
    }
    setIsFullscreen(true);
    document.addEventListener("fullscreenchange", exitFullscreenListener);
  };

  // Exit fullscreen listener
  const exitFullscreenListener = () => {
    if (!document.fullscreenElement) {
      setIsFullscreen(false);
      document.removeEventListener("fullscreenchange", exitFullscreenListener);
    }
  };

  // Sync mute state between fullscreen and normal mode
  const syncMuteState = () => {
    if (videoRef.current) {
      setMuted(videoRef.current.muted);
    }
  };

  // Toggle mute state
  const toggleMute = () => {
    setMuted((prevMuted) => {
      const newMuted = !prevMuted;
      videoRef.current.muted = newMuted;
      return newMuted;
    });
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Update progress bar
  const handleProgress = () => {
    const currentTime = videoRef.current.currentTime;
    const videoDuration = videoRef.current.duration;
    const progress = (currentTime / videoDuration) * 100;
    setPlayed(progress);
    document.documentElement.style.setProperty(
      "--seekbar-progress",
      `${progress}%`
    );
  };

  // Handle seek bar changes
  const handleSeek = (e) => {
    e.stopPropagation();
    const newTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setPlayed(e.target.value);
    document.documentElement.style.setProperty(
      "--seekbar-progress",
      `${e.target.value}%`
    );
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    if (!muted) {
      videoRef.current.muted = false;
    }
    const volumeProgress = newVolume * 100;
    document.documentElement.style.setProperty(
      "--volume-progress",
      `${volumeProgress}%`
    );
  };

  // Format time
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Effect to sync mute state on fullscreen change
  useEffect(() => {
    document.addEventListener("fullscreenchange", syncMuteState);
    return () => {
      document.removeEventListener("fullscreenchange", syncMuteState);
    };
  }, []);

  // Effect to unmute after autoplay
  useEffect(() => {
    const videoElement = videoRef.current;
    const handleAutoPlay = () => {
      if (videoElement && !muted) {
        videoElement.muted = false; // Unmute after autoplay
      }
    };

    if (videoElement) {
      videoElement.addEventListener("play", handleAutoPlay);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("play", handleAutoPlay);
      }
    };
  }, [muted]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "800px",
        margin: "auto",
        background: "linear-gradient(to right, #f0f0f0, #f08080)",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        onClick={isFullscreen ? null : togglePlayPause}
        style={{
          position: "relative",
          width: "100%",
          cursor: "pointer",
        }}
      >
        <video
          ref={videoRef}
          onTimeUpdate={handleProgress}
          onLoadedMetadata={() => setDuration(videoRef.current.duration)}
          style={{ width: "100%", height: "auto", display: "block" }}
          src="https://www.w3schools.com/html/mov_bbb.mp4" //url
          autoPlay
          loop
          muted={muted}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate"
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={played}
          onChange={handleSeek}
          className="custom-seekbar"
          style={{
            flex: "1",
            margin: "0 10px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px", whiteSpace: "nowrap" }}>
            {formatTime(videoRef.current?.currentTime || 0)} /{" "}
            {formatTime(duration)}
          </span>

          <div className="volume-container">
            <button
              onClick={toggleMute}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              {muted || volume === 0 ? (
                "🔇"
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.7479 4.99993C21.1652 6.97016 22 9.38756 22 11.9999C22 14.6123 21.1652 17.0297 19.7479 18.9999M15.7453 7.99993C16.5362 9.13376 17 10.5127 17 11.9999C17 13.4872 16.5362 14.8661 15.7453 15.9999M9.63432 5.36561L6.46863 8.5313C6.29568 8.70425 6.2092 8.79073 6.10828 8.85257C6.01881 8.9074 5.92127 8.9478 5.81923 8.9723C5.70414 8.99993 5.58185 8.99993 5.33726 8.99993H3.6C3.03995 8.99993 2.75992 8.99993 2.54601 9.10892C2.35785 9.20479 2.20487 9.35777 2.10899 9.54594C2 9.75985 2 10.0399 2 10.5999V13.3999C2 13.96 2 14.24 2.10899 14.4539C2.20487 14.6421 2.35785 14.7951 2.54601 14.8909C2.75992 14.9999 3.03995 14.9999 3.6 14.9999H5.33726C5.58185 14.9999 5.70414 14.9999 5.81923 15.0276C5.92127 15.0521 6.01881 15.0925 6.10828 15.1473C6.2092 15.2091 6.29568 15.2956 6.46863 15.4686L9.63431 18.6342C10.0627 19.0626 10.2769 19.2768 10.4608 19.2913C10.6203 19.3038 10.7763 19.2392 10.8802 19.1175C11 18.9773 11 18.6744 11 18.0686V5.9313C11 5.32548 11 5.02257 10.8802 4.88231C10.7763 4.76061 10.6203 4.69602 10.4608 4.70858C10.2769 4.72305 10.0627 4.93724 9.63432 5.36561Z"
                    stroke="white"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="custom-volume"
              style={{
                width: "80px",
                verticalAlign: "middle",
              }}
            />
          </div>

          <button
            onClick={handleFullscreen}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 9L4 4M4 4V8M4 4H8"
                stroke="white"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M15 9L20 4M20 4V8M20 4H16"
                stroke="white"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9 15L4 20M4 20V16M4 20H8"
                stroke="white"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M15 15L20 20M20 20V16M20 20H16"
                stroke="white"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
