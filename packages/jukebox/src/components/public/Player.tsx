import style from "./Player.module.scss";
import {
  Paper,
  CardContent,
  Typography,
  Slider,
  IconButton,
  Fab,
  CircularProgress,
} from "@material-ui/core";
import React, { useState, useEffect, useDebugValue, RefObject } from "react";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import RepeatOneIcon from "@material-ui/icons/RepeatOne";
import { formatTime } from "../../frontendUtils/strings";
import { useAppContext } from "./AppContext";
import { useNamedState } from "../../frontendUtils/hooks";

export default function Player() {
  const [time, setTime] = useNamedState(0, "time");
  const [isDragging, setIsDragging] = useNamedState(false, "isDragging");
  const [isLoading, setIsLoading] = useNamedState(false, "isLoading");
  const [duration, setDuration] = useNamedState(0, "duration");
  const [loadProgress, setLoadProgress] = useNamedState(0, "loadProgress");

  const { playerRef, playlist } = useAppContext();

  function updateTime() {
    // console.log("updateTime, playerRef", playerRef.current, playerRef);
    if (playerRef.current !== null && !isDragging) {
      setTime(playerRef.current.currentTime);
    }
  }

  function clickPlay() {
    if (playlist.nowPlaying === null && playlist.tracks.length > 0) {
      playlist.playTrack(0);
      playerRef.current.play();
      return;
    }
    if (playerRef.current.paused) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }

  function onPlay() {
    // setIsPlaying(true);
  }

  function onPause() {
    // setIsPlaying(false);
  }

  function updateDuration() {
    setDuration(playerRef.current?.duration);
  }

  function onSliderChange(event: unknown, newValue: number) {
    setTime(newValue);
    setIsDragging(true);
  }

  function onSliderChangeCommitted(event: unknown, newValue: number) {
    playerRef.current.currentTime = newValue;
    setTime(newValue);
    setIsDragging(false);
  }

  function updateProgress() {
    if (!playerRef.current) {
      setLoadProgress(0);
      setIsLoading(false);
      return;
    }
    const duration = playerRef.current.duration,
      buffered = playerRef.current.buffered;
    let loaded = 0;
    if (duration > 0) {
      for (let i = 0; i < buffered.length; i++) {
        loaded += buffered.end(i) - buffered.start(i);
      }
      setLoadProgress((loaded / duration) * 100);
      setIsLoading(duration - loaded > 1e-6);
    } else {
      setLoadProgress(0);
      setIsLoading(false);
    }
  }

  function nextTrack() {
    const isPlaying = !playerRef.current.paused;
    if (isPlaying) playerRef.current.pause();
    playlist.playNext();
    if (isPlaying && playerRef.current) {
      // console.log("called play");
      playerRef.current.play();
    }
  }
  function previousTrack() {
    const isPlaying = !playerRef.current.paused;
    if (isPlaying) playerRef.current.pause();
    playlist.playPrevious();
    if (isPlaying && playerRef.current) {
      // console.log("called play");
      playerRef.current.play();
    }
  }

  useEffect(() => {
    const playerElm = playerRef.current;
    // console.log("trying to register listeners");
    if (playerElm !== null) {
      // console.log("registering listeners");
      playerElm.addEventListener("timeupdate", updateTime);
      playerElm.addEventListener("playing", onPlay);
      playerElm.addEventListener("pause", onPause);
      playerElm.addEventListener("durationchange", updateDuration);
      playerElm.addEventListener("loadedmetadata", updateDuration);
      playerElm.addEventListener("progress", updateProgress);
      updateTime();
      updateDuration();
    }
    return function cleanUp() {
      // console.log("trying to remove listeners");
      if (playerElm !== null) {
        // console.log("removing listeners");
        playerElm.removeEventListener("timeupdate", updateTime);
        playerElm.removeEventListener("playing", onPlay);
        playerElm.removeEventListener("pause", onPause);
        playerElm.removeEventListener("durationchange", updateDuration);
        playerElm.removeEventListener("loadedmetadata", updateDuration);
        playerElm.removeEventListener("progress", updateProgress);
      }
    };
  }, [playerRef]);

  return (
    <Paper className={style.playerPaper}>
      <CardContent>
        <div>
          {/* <div>image</div> */}
          <div>
            <Typography variant="h6">
              {playlist.getCurrentSong()?.trackName || "No track"}
            </Typography>
            <Typography variant="subtitle1">
              {playlist.getCurrentSong()?.artistName ||
                "Select a track to start."}
            </Typography>
          </div>
        </div>
        <Slider
          defaultValue={0}
          value={time}
          getAriaValueText={formatTime}
          max={duration}
          onChange={onSliderChange}
          onChangeCommitted={onSliderChangeCommitted}
        />
        <div className={style.sliderLabelContainer}>
          <Typography
            variant="body2"
            component="span"
            className={style.sliderLabelText}
          >
            {formatTime(time)}
          </Typography>
          <span className={style.sliderLabelStretcher}></span>
          <Typography
            variant="body2"
            component="span"
            className={style.sliderLabelText}
          >
            {formatTime(duration)}
          </Typography>
        </div>
        <div className={style.controlContainer}>
          <IconButton
            color="default"
            aria-label="Shuffle"
            style={{ opacity: 0.5 }}
          >
            <ShuffleIcon />
          </IconButton>
          <IconButton
            color="default"
            aria-label="Previous track"
            onClick={previousTrack}
          >
            <SkipPreviousIcon />
          </IconButton>
          <div className={style.loadProgressContainer}>
            <Fab
              color="primary"
              aria-label={playerRef.current?.paused ? "Play" : "Pause"}
              size="medium"
              className={style.playPauseButton}
              onClick={clickPlay}
            >
              {playerRef.current?.paused ? <PlayArrowIcon /> : <PauseIcon />}
            </Fab>
            {isLoading && (
              <CircularProgress
                size={60}
                thickness={2.4}
                color="secondary"
                value={loadProgress}
                className={style.loadProgressSpinner}
                variant="static"
              />
            )}
          </div>
          <IconButton
            color="default"
            aria-label="Next track"
            onClick={nextTrack}
          >
            <SkipNextIcon />
          </IconButton>
          <IconButton
            color="default"
            aria-label="Repeat one"
            style={{ opacity: 0.5 }}
          >
            <RepeatOneIcon />
          </IconButton>
        </div>
      </CardContent>
    </Paper>
  );
}
