import { useState } from "react"
import Header from "./components/Header"
import HomePage from "./components/HomePage"
import FileDisplay from "./components/FileDisplay"

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)

  const isAudioStream = file || audioStream;
  const handleWarnings = () => {
    setFile(null)
    setAudioStream(null)
  }
  return (
    <div className="flex flex-col max-w-[1000px] mx-auto w-full">
      <section className="min-h-screen flex flex-col" onClick={handleWarnings}>
        <Header />
        {isAudioStream ?
          <FileDisplay />
          : <HomePage />}
      </section>
    </div>
  )
}

export default App
