import { RecordingStatusEnum } from "../enum/recordingStatus"
import React, { useEffect, useRef, useState } from "react"

const HomePage: React.FC<HomePageProps> = ({ setAudioStream, setFile }) => {
    const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>(RecordingStatusEnum.INACTIVE as RecordingStatus)
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])
    const [duration, setDuration] = useState(0)

    const mediaRecorder = useRef<null | MediaRecorder>(null)

    const mimeType = 'audio/webm'

    async function startRecording() {
        let tempStream
        console.log('Start recording')

        try {
            const streamData = navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            tempStream = await streamData;
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log("An unknown error occurred");
            }
            return;
        }
        setRecordingStatus(RecordingStatusEnum.RECORDING as RecordingStatus);

        if (tempStream) {
            // create new Media recoder instance using the stream
            const media = new MediaRecorder(tempStream, { mimeType })

            mediaRecorder.current = media;
            mediaRecorder.current.start();
            const localAudioChunks: Blob[] = [];
            mediaRecorder.current.ondataavailable = (event) => {
                if (typeof event.data === "undefined") { return }
                if (event.data.size === 0) { return }
                localAudioChunks.push(event.data)
            }
            setAudioChunks(localAudioChunks)
        }
    }

    async function stopRecording() {
        setRecordingStatus(RecordingStatusEnum.INACTIVE as RecordingStatus);
        console.log('Stop recording')

        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            mediaRecorder.current.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: mimeType })
                setAudioStream(audioBlob)
                setAudioChunks([])
                setDuration(0)
            }
        }
    }

    useEffect(() => {
        if (recordingStatus === RecordingStatusEnum.INACTIVE) { return }

        const interval = setInterval(() => {
            setDuration((prev) => prev + 1)
        }, 1000)

        return () => clearInterval(interval);
    }, [recordingStatus])

    return (
        <main className="flex-1 p-4 flex flex-col gap-3 sm:gap-4 md:gap-5 justify-center text-center pb-20">
            <h1 className="font-bold text-5xl sm:text-6xl md:text-7xl">Tran<span className="text-blue-400">Scribe</span>X</h1>
            <h3 className='font-medium md:text-lg'>Record <span className='text-blue-400'>&rarr;</span> Transcribe <span className='text-blue-400'>&rarr;</span> Translate</h3>
            <button onClick={recordingStatus === RecordingStatusEnum.RECORDING ? stopRecording : startRecording} className='flex specialBtn font-semibold px-4 py-2 rounded-xl items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4'>
                <p className='text-blue-400'>{recordingStatus === RecordingStatusEnum.INACTIVE ? "Record" : "Stop recording"}</p>
                <div className='flex items-center gap-2'>
                    {duration !== 0 && (
                        <p className='text-sm'>{duration}s</p>
                    )}
                    <i className={"fa-solid duration-200 fa-microphone " + (recordingStatus === RecordingStatusEnum.RECORDING ? ' text-rose-300' : "")}></i>
                </div>
            </button>
            <p className='text-base font-semibold'>
                Or
                <label className='text-blue-400 cursor-pointer hover:text-blue-600 duration-200'> upload
                    <input onChange={(e) => {
                        const tempFile = e.target.files?.[0];
                        if (tempFile) {
                            setFile(tempFile)
                        }
                    }} className='hidden' type='file' accept='.mp3,.wave' />
                </label> a mp3 file
            </p>
            <p className='italic text-slate-400'>Free now free forever</p>
        </main>
    )
}

export default HomePage