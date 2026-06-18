import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import SkipNextRounded from "@mui/icons-material/SkipNextRounded";
import SkipPreviousRounded from "@mui/icons-material/SkipPreviousRounded";
import VolumeUpRounded from "@mui/icons-material/VolumeUpRounded";
import VolumeDownRounded from "@mui/icons-material/VolumeDownRounded";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import { PlayerContext } from "../../context/PlayerContext";
import MusicPlayer from "../MusicPlayer/MusicPlayer";
import styles from "./mini-player.module.css";
import defaultTrackCover from "../../photos/track.png";

function formatDuration(value: any) {
  if (!isFinite(value)) return "0:00";
  const minute = Math.floor(value / 60);
  const secondLeft = Math.floor(value - minute * 60);
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
}

export default function MiniPlayer() {
  const [expanded, setExpanded] = useState(false);
  const {
    currentTrack,
    paused,
    currentTime,
    duration,
    volume,
    togglePlay,
    seek,
    setVolume,
    playPrevTrack,
    playNextTrack,
  } = useContext(PlayerContext);

  if (!currentTrack) return null;

  return (
    <>
      {expanded && <MusicPlayer onClose={() => setExpanded(false)} />}

      <div className={styles.bar}>
        <div className={styles.left}>
          <div className={styles.trackInfo}>
            <img
              src={currentTrack.coverUrl || defaultTrackCover}
              alt={currentTrack.title}
              className={styles.cover}
            />
            <div className={styles.text}>
              <span className={styles.title}>{currentTrack.title}</span>
              {currentTrack.username ? (
                <Link
                  to={`/user/${currentTrack.username}`}
                  className={styles.artistLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentTrack.username}
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className={styles.center}>
          <div className={styles.controls}>
            <IconButton
              aria-label="previous"
              onClick={playPrevTrack}
              className={styles.navBtn}
              size="small"
            >
              <SkipPreviousRounded fontSize="small" />
            </IconButton>
            <IconButton
              aria-label={paused ? "play" : "pause"}
              onClick={togglePlay}
              className={styles.playBtn}
            >
              {paused ? (
                <PlayArrowRounded />
              ) : (
                <PauseRounded />
              )}
            </IconButton>
            <IconButton
              aria-label="next"
              onClick={playNextTrack}
              className={styles.navBtn}
              size="small"
            >
              <SkipNextRounded fontSize="small" />
            </IconButton>
          </div>
          <div className={styles.seekWrap}>
            <span className={styles.time}>{formatDuration(currentTime)}</span>
            <Slider
              aria-label="time-indicator"
              size="small"
              value={currentTime}
              min={0}
              step={1}
              max={duration || 1}
              onChange={(_, value) => seek(value)}
              className={styles.slider}
            />
            <span className={styles.time}>{formatDuration(duration)}</span>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.volumeWrap}>
            <VolumeDownRounded fontSize="small" />
            <Slider
              aria-label="Volume"
              value={volume}
              min={0}
              max={1}
              step={0.01}
              onChange={(_, value) => setVolume(value)}
              className={styles.volumeSlider}
            />
            <VolumeUpRounded fontSize="small" />
          </div>
          <button
            className={styles.expandBtn}
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse player" : "Expand player"}
          >
            {expanded ? <ExpandMoreRounded /> : <ExpandLessRounded />}
          </button>
        </div>
      </div>
    </>
  );
}
