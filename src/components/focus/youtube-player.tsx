"use client";

import { useEffect, useRef } from "react";

interface YouTubePlayerProps {
  videoId: string;
  playing: boolean;
  /** 0 to 100. */
  volume: number;
}

/** Sends a command to the YouTube iframe. Works without loading the YouTube API script. */
function sendCommand(frame: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
}

/**
 * Hidden audio-only player for a pasted YouTube link. The iframe stays off screen, and
 * play, pause and volume are sent to it as commands.
 */
export function YouTubePlayer({ videoId, playing, volume }: YouTubePlayerProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  // Commands sent before the iframe loads are dropped, so the load handler applies the current state.
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) sendCommand(frameRef.current, playing ? "playVideo" : "pauseVideo");
  }, [playing]);

  useEffect(() => {
    if (loadedRef.current) sendCommand(frameRef.current, "setVolume", [volume]);
  }, [volume]);

  return (
    <iframe
      ref={frameRef}
      title="Background music from YouTube"
      src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&playsinline=1&rel=0`}
      allow="autoplay; encrypted-media"
      tabIndex={-1}
      aria-hidden
      className="pointer-events-none absolute size-px opacity-0"
      onLoad={() => {
        loadedRef.current = true;
        sendCommand(frameRef.current, "setVolume", [volume]);
        sendCommand(frameRef.current, playing ? "playVideo" : "pauseVideo");
      }}
    />
  );
}
