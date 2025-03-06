declare type HomePageProps = {
  setAudioStream: React.Dispatch<React.SetStateAction<Blob | null>>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
};

declare type FileDisplayProps = {
  handleAudioReset: () => void;
  file: File | null;
  audioStream: Blob | null;
};

declare type RecordingStatus = "inactive" | "recording" | "paused";

declare type TranscribingProps = {
  downloading: boolean;
};

declare type InformationTabs = "transcription" | "translation";
