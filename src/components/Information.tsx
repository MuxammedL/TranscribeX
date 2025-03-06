import { InformationTabsEnum } from "../enum/InformationTabs"
import { useState } from "react"
import Transcription from "./Transcription"
import Translation from "./Translation"

const Information = () => {
    const [tab, setTab] = useState<InformationTabs>(InformationTabsEnum.TRANSCRIPTION as InformationTabs)
    return (
        <main className='flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto'>
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl whitespace-nowrap'>Your <span className='text-blue-400 bold'>Transcription</span></h1>
            <div className='grid grid-cols-2 sm:mx-auto bg-white  rounded overflow-hidden items-center p-1 blueShadow border-[2px] border-solid border-blue-300'>
                <button onClick={() => setTab(InformationTabsEnum.TRANSCRIPTION as InformationTabs)} className={'px-4 rounded duration-200 cursor-pointer py-1' + (tab === InformationTabsEnum.TRANSCRIPTION ? ' bg-blue-300 text-white' : ' text-blue-400 hover:text-blue-300')}>Transcription</button>
                <button onClick={() => setTab(InformationTabsEnum.TRANSLATION as InformationTabs)} className={'px-4 rounded duration-200 py-1 cursor-pointer' + (tab === InformationTabsEnum.TRANSLATION ? ' bg-blue-300 text-white' : ' text-blue-400 hover:text-blue-300')}>Translation</button>
            </div>
            {tab === InformationTabsEnum.TRANSCRIPTION ? <Transcription /> : <Translation />}
        </main>
    )
}

export default Information