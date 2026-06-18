import { useContext } from "react";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import SkipNextRounded from "@mui/icons-material/SkipNextRounded";
import SkipPreviousRounded from "@mui/icons-material/SkipPreviousRounded";
import VolumeUpRounded from "@mui/icons-material/VolumeUpRounded";
import VolumeDownRounded from "@mui/icons-material/VolumeDownRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { PlayerContext } from "../../context/PlayerContext";
import styles from "./music-player.module.css";

function formatDuration(value: number) {
  if (!isFinite(value)) return "0:00";
  const minute = Math.floor(value / 60);
  const secondLeft = Math.floor(value - minute * 60);
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
}

interface MusicPlayerProps {
  onClose?: () => void;
}

export default function MusicPlayer({ onClose }: MusicPlayerProps) {
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

  return (
    <div className={styles.overlay}>
      <div className={styles.widget}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close player">
          <CloseRounded />
        </button>

        <div className={styles.topRow}>
          <div className={styles.coverImage}>
            <img
              alt={currentTrack?.title || "track cover"}
              src={currentTrack?.coverUrl || ""}
            />
          </div>
          <div className={styles.info}>
            <span className={styles.caption}>
              {currentTrack?.username || ""}
            </span>
            <span className={styles.title}>
              <b>{currentTrack?.title || "Untitled"}</b>
            </span>
          </div>
        </div>

        <Slider
          aria-label="time-indicator"
          size="small"
          value={currentTime}
          min={0}
          step={1}
          max={duration || 1}
          onChange={(_, value) => seek(value as number)}
          className={styles.seekSlider}
        />

        <div className={styles.timeRow}>
          <span className={styles.tinyText}>
            {formatDuration(currentTime)}
          </span>
          <span className={styles.tinyText}>
            {duration
              ? `-${formatDuration(duration - currentTime)}`
              : "0:00"}
          </span>
        </div>

        <div className={styles.controls}>
          <IconButton aria-label="previous" onClick={playPrevTrack}>
            <SkipPreviousRounded fontSize="large" />
          </IconButton>
          <IconButton
            aria-label={paused ? "play" : "pause"}
            onClick={togglePlay}
          >
            {paused ? (
              <PlayArrowRounded className={styles.playIcon} />
            ) : (
              <PauseRounded className={styles.playIcon} />
            )}
          </IconButton>
          <IconButton aria-label="next" onClick={playNextTrack}>
            <SkipNextRounded fontSize="large" />
          </IconButton>
        </div>

        <Stack spacing={2} direction="row" className={styles.volumeRow}>
          <VolumeDownRounded />
          <Slider
            aria-label="Volume"
            value={volume}
            min={0}
            max={1}
            step={0.01}
            onChange={(_, value) => setVolume(value as number)}
            className={styles.volumeSlider}
          />
          <VolumeUpRounded />
        </Stack>
      </div>
    </div>
  );
}
