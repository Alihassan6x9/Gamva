import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

export default function CallControls({
  micOn,
  cameraOn,
  micBusy,
  cameraBusy,
  onToggleMic,
  onToggleCamera,
  onLeaveCall,
  compact = false,
}: {
  micOn: boolean;
  cameraOn: boolean;
  micBusy?: boolean;
  cameraBusy?: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onLeaveCall?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`call-controls${compact ? " call-controls-compact" : ""}`}>
      <button
        type="button"
        className={`call-control-btn${micOn ? " call-control-btn-on" : ""}`}
        onClick={onToggleMic}
        disabled={micBusy}
        aria-pressed={micOn}
        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        title={micOn ? "Mute microphone" : "Unmute microphone"}
      >
        {micOn ? <Mic size={18} /> : <MicOff size={18} />}
      </button>
      <button
        type="button"
        className={`call-control-btn${cameraOn ? " call-control-btn-on" : ""}`}
        onClick={onToggleCamera}
        disabled={cameraBusy}
        aria-pressed={cameraOn}
        aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
        title={cameraOn ? "Turn camera off" : "Turn camera on"}
      >
        {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
      </button>
      {onLeaveCall && (
        <button
          type="button"
          className="call-control-btn call-control-btn-leave"
          onClick={onLeaveCall}
          aria-label="Leave call"
          title="Leave call"
        >
          <PhoneOff size={18} />
        </button>
      )}
    </div>
  );
}
