import { useEffect, useRef, useState } from "react"
import Header from "./components/Header"
import HomePage from "./components/HomePage"
import FileDisplay from "./components/FileDisplay"
import Information from "./components/Information"
import Transcribing from "./components/Transcribing"
import { MessageTypes } from "./enum/MessageTypes"

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [audioStream, setAudioStream] = useState<Blob | null>(null)
  const [output, setOutput] = useState<boolean | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [downloading, setDownloading] = useState<boolean>(false)
  const [finished, setFinished] = useState<boolean>(false)

  const isAudioStream = file || audioStream;

  function handleAudioReset() {
    setFile(null)
    setAudioStream(null)
  }

  const worker = useRef<Worker | null>(null)
  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./utlis/whisper.worker.ts', import.meta.url), { type: 'module' })
    }

    const onMessageReceived = async (e: MessageEvent) => {
      switch (e.data.type) {
        case MessageTypes.DOWNLOADING:
          setDownloading(true);
          console.log("Downloading");
          break;
        case MessageTypes.LOADING:
          setLoading(true);
          console.log("Loading");
          break;
        case MessageTypes.RESULT:
          setOutput(e.data.results);
          break;
        case MessageTypes.INFERENCE_DONE:
          setFinished(true);
          console.log("DONE");
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);

    return () => {
      worker.current?.removeEventListener('message', onMessageReceived);
    }
  })

  async function readFromFile(file: File | Blob) {
    const sampling_rate = 16000;
    const audioCTX = new AudioContext({ sampleRate: sampling_rate });
    const response = await file.arrayBuffer();
    const decoded = await audioCTX.decodeAudioData(response);
    const audio = decoded.getChannelData(0);
    return audio;
  }

  async function handleFormSubmission() {
    if (!file && !audioStream) return;

    const audio = await readFromFile(file ? file : audioStream!);
    const model_name = `openai/whisper-tiny.en`

    worker.current?.postMessage({
      type: MessageTypes.INFERENCE_DONE,
      audio, model_name
    })
  }

  useEffect(() => {
    console.log("audioStream", audioStream, finished, downloading);
    setOutput(null)
    setLoading(false)
    handleFormSubmission();
  })

  return (
    <div className="flex flex-col max-w-[1000px] mx-auto w-full">
      <section className="min-h-screen flex flex-col" >
        <Header />
        {output ?
          <Information />
          : loading ?
            <Transcribing downloading={loading} />
            : isAudioStream ?
              <FileDisplay handleAudioReset={handleAudioReset} file={file} audioStream={audioStream} />
              : <HomePage setFile={setFile} setAudioStream={setAudioStream} />}
      </section>
    </div>
  )
}

export default App
