declare type HomePageProps = {
  setAudioStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
};

declare type FileDisplayProps = {
  handleAudioReset: () => void;
  file: File | null;
  audioStream: MediaStream | null;
};
