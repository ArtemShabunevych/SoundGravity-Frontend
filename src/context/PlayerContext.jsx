import { createContext, useCallback, useEffect, useRef, useState } from "react";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(() => {
    try {
      const saved = localStorage.getItem("player_track");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [paused, setPaused] = useState(() => {
    try {
      const saved = localStorage.getItem("player_paused");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [currentTime, setCurrentTime] = useState(() => {
    try {
      const saved = localStorage.getItem("player_time");
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("player_volume");
    return saved ? parseFloat(saved) : 0.5;
  });
  const [queue, setQueueState] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const setNextOnEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("player_volume", String(volume));
  }, [volume]);

  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem("player_track", JSON.stringify(currentTrack));
    } else {
      localStorage.removeItem("player_track");
    }
  }, [currentTrack]);

  useEffect(() => {
    localStorage.setItem("player_paused", JSON.stringify(paused));
  }, [paused]);

  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem("player_time", String(currentTime));
    }
  }, [currentTime, currentTrack]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setNextOnEndRef.current && setNextOnEndRef.current();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.volume = volume;

    if (currentTrack?.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.currentTime = currentTime || 0;
      audio.load();
      if (!paused) {
        const resume = () => audio.play().catch(() => setPaused(true));
        if (audio.readyState >= 2) {
          resume();
        } else {
          audio.addEventListener("canplay", resume, { once: true });
        }
      }
    }

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const setNextOnEnd = useCallback(() => {
    setPaused(true);
    setCurrentTime(0);
    if (queueIndex >= 0 && queueIndex < queue.length - 1) {
      const next = queue[queueIndex + 1];
      const audio = audioRef.current;
      if (!audio) return;
      setQueueIndex(queueIndex + 1);
      audio.src = next.audioUrl || "";
      audio.currentTime = 0;
      audio.play().catch(() => {});
      setCurrentTrack(next);
      setCurrentTime(0);
      setDuration(0);
      setPaused(false);
    }
  }, [queue, queueIndex]);

  setNextOnEndRef.current = setNextOnEnd;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = useCallback((track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.audioUrl === track.audioUrl) {
      audio.play().catch(() => {});
      setPaused(false);
      return;
    }

    audio.src = track.audioUrl || "";
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);
    setPaused(false);
    const idx = queue.findIndex(t => t.audioUrl === track.audioUrl);
    if (idx >= 0) setQueueIndex(idx);
  }, [currentTrack, queue]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    setPaused(!paused);
  }, [paused, currentTrack]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const skip = useCallback((seconds) => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const newTime = Math.min(Math.max(audio.currentTime + seconds, 0), duration);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [currentTrack, duration]);

  const changeVolume = useCallback((value) => {
    setVolume(value);
  }, []);

  const selectTrack = useCallback((track) => {
    const audio = audioRef.current;
    if (!audio || !track.audioUrl) return;
    if (currentTrack?.audioUrl === track.audioUrl) return;
    audio.src = track.audioUrl;
    audio.currentTime = 0;
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);
    setPaused(true);
    const idx = queue.findIndex(t => t.audioUrl === track.audioUrl);
    if (idx >= 0) setQueueIndex(idx);
  }, [currentTrack, queue]);

  const setQueue = useCallback((tracks, currentAudioUrl) => {
    setQueueState(tracks);
    if (currentAudioUrl) {
      const idx = tracks.findIndex(t => t.audioUrl === currentAudioUrl);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else {
      setQueueIndex(0);
    }
  }, []);

  const playNextTrack = useCallback(() => {
    if (queueIndex < 0 || queueIndex >= queue.length - 1) return;
    const next = queue[queueIndex + 1];
    setQueueIndex(queueIndex + 1);
    playTrack(next);
  }, [queue, queueIndex, playTrack]);

  const playPrevTrack = useCallback(() => {
    if (queueIndex <= 0) return;
    const prev = queue[queueIndex - 1];
    setQueueIndex(queueIndex - 1);
    playTrack(prev);
  }, [queue, queueIndex, playTrack]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        paused,
        currentTime,
        duration,
        volume,
        playTrack,
        selectTrack,
        togglePlay,
        seek,
        skip,
        setVolume: changeVolume,
        setQueue,
        playNextTrack,
        playPrevTrack,
        queue,
        queueIndex,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
