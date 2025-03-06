import { useEffect, useState } from "react"
import Header from "./components/Header"
import HomePage from "./components/HomePage"
import FileDisplay from "./components/FileDisplay"
import Information from "./components/Information"
import Transcribing from "./components/Transcribing"

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [audioStream, setAudioStream] = useState<Blob | null>(null)
  const [output, setOutput] = useState<boolean | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const isAudioStream = file || audioStream;

  function handleAudioReset() {
    setFile(null)
    setAudioStream(null)
  }

  useEffect(() => {
    console.log("audioStream", audioStream);
    setOutput(null)
    setLoading(false)
  }, [audioStream])

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
