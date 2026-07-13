import { useEffect, useRef } from "react";
import { Mic, MicOff, VideoOff } from "lucide-react";

export default function VideoTile({
  stream,
  name,
  isSelf = false,
  cameraOn,
  micOn,
  compact = false,
}: {
  stream: MediaStream | null;
  name: string;
  isSelf?: boolean;
  cameraOn: boolean;
  micOn: boolean;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = cameraOn && !!stream && stream.getVideoTracks().length > 0;
  // Player records can be transiently incomplete (e.g. a snapshot mid-write,
  // or a stale reference to a player who just left) — never let a missing
  // name crash the whole call UI.
  const safeName = (name ?? "").trim();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = hasVideo ? stream : null;
    }
  }, [stream, hasVideo]);

  return (
    <div
      className="video-tile"
      style={{
        width: compact ? 96 : "100%",
        height: compact ? 72 : undefined,
        aspectRatio: compact ? undefined : "4 / 3",
      }}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isSelf}
          className="video-tile-video"
        />
      ) : (
        <div className="video-tile-placeholder">
          <span className="video-tile-initial">{safeName.charAt(0).toUpperCase() || "?"}</span>
          <VideoOff size={compact ? 12 : 16} className="video-tile-camera-off-icon" />
        </div>
      )}

      <div className="video-tile-footer">
        <span className="video-tile-name">{isSelf ? `${safeName || "You"} (you)` : safeName || "Player"}</span>
        {micOn ? <Mic size={12} /> : <MicOff size={12} className="video-tile-muted-icon" />}
      </div>
    </div>
  );
}
