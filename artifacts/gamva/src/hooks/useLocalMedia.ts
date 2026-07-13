import { useCallback, useRef, useState } from "react";

export type LocalMediaState = {
  stream: MediaStream | null;
  micOn: boolean;
  cameraOn: boolean;
  micBusy: boolean;
  cameraBusy: boolean;
  error: string | null;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  stopAll: () => void;
};

type UseLocalMediaOptions = {
  // Called whenever a brand-new track is captured (not on simple mute
  // toggles) so callers can push it onto existing peer connections.
  onTrackAdded?: (track: MediaStreamTrack, stream: MediaStream) => void;
};

/**
 * Manages the local microphone/camera MediaStream. Devices are only ever
 * requested the first time a toggle is switched on; after that, muting just
 * flips `track.enabled` so re-enabling never re-prompts for permission.
 */
export function useLocalMedia({ onTrackAdded }: UseLocalMediaOptions = {}): LocalMediaState {
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micBusy, setMicBusy] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function ensureStream() {
    if (!streamRef.current) {
      streamRef.current = new MediaStream();
      setStream(streamRef.current);
    }
    return streamRef.current;
  }

  const toggleMic = useCallback(async () => {
    setError(null);
    const existing = streamRef.current?.getAudioTracks()[0];
    if (existing) {
      existing.enabled = !existing.enabled;
      setMicOn(existing.enabled);
      return;
    }

    setMicBusy(true);
    try {
      const captured = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = captured.getAudioTracks()[0];
      const target = ensureStream();
      target.addTrack(track);
      setStream(new MediaStream(target.getTracks()));
      setMicOn(true);
      onTrackAdded?.(track, target);
    } catch (err) {
      console.error("Microphone permission error", err);
      setError("Couldn't access your microphone. Check your browser's site permissions.");
    } finally {
      setMicBusy(false);
    }
  }, [onTrackAdded]);

  const toggleCamera = useCallback(async () => {
    setError(null);
    const existing = streamRef.current?.getVideoTracks()[0];
    if (existing) {
      existing.enabled = !existing.enabled;
      setCameraOn(existing.enabled);
      return;
    }

    setCameraBusy(true);
    try {
      const captured = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = captured.getVideoTracks()[0];
      const target = ensureStream();
      target.addTrack(track);
      setStream(new MediaStream(target.getTracks()));
      setCameraOn(true);
      onTrackAdded?.(track, target);
    } catch (err) {
      console.error("Camera permission error", err);
      setError("Couldn't access your camera. Check your browser's site permissions.");
    } finally {
      setCameraBusy(false);
    }
  }, [onTrackAdded]);

  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setMicOn(false);
    setCameraOn(false);
  }, []);

  return { stream, micOn, cameraOn, micBusy, cameraBusy, error, toggleMic, toggleCamera, stopAll };
}
