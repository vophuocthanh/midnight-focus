import { Waves } from "lucide-react";
import { Input } from "@/components/ui/input";
import { parseYouTubeId } from "@/lib/youtube";
import { AMBIENT_OPTIONS } from "@/lib/ambient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AmbientSound } from "@/types";

interface AmbientControlProps {
  sound: AmbientSound;
  volume: number;
  youtubeUrl: string;
  onSoundChange: (sound: AmbientSound) => void;
  onVolumeChange: (volume: number) => void;
  onYoutubeUrlChange: (url: string) => void;
}

export function AmbientControl({
  sound,
  volume,
  youtubeUrl,
  onSoundChange,
  onVolumeChange,
  onYoutubeUrlChange,
}: AmbientControlProps) {
  const current = AMBIENT_OPTIONS.find((option) => option.value === sound) ?? AMBIENT_OPTIONS[0];
  const linkInvalid = sound === "youtube" && youtubeUrl.trim() !== "" && parseYouTubeId(youtubeUrl) === null;

  return (
    <div className="flex flex-col items-center gap-2 text-sm text-text-secondary">
    <div className="flex items-center gap-3">
      <Waves className="size-4 shrink-0" aria-hidden />
      <Select
        value={sound}
        onValueChange={(value) => {
          const next = AMBIENT_OPTIONS.find((option) => option.value === value);
          if (next) onSoundChange(next.value);
        }}
      >
        <SelectTrigger aria-label="Background sound" className="w-36">
          <SelectValue>{current.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {AMBIENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={volume}
        disabled={sound === "off"}
        aria-label="Background sound volume"
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        className="w-24 accent-primary disabled:opacity-40"
      />
    </div>
      {sound === "youtube" && (
        <div className="flex w-full max-w-sm flex-col gap-1">
          <Input
            type="url"
            inputMode="url"
            placeholder="Paste a YouTube link"
            aria-label="YouTube link"
            aria-invalid={linkInvalid}
            value={youtubeUrl}
            onChange={(event) => onYoutubeUrlChange(event.target.value)}
          />
          {linkInvalid && <p className="text-xs text-danger">That does not look like a YouTube video link.</p>}
        </div>
      )}
    </div>
  );
}
