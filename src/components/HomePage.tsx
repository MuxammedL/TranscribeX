const HomePage = () => {
    return (
        <main className="flex-1 p-4 flex flex-col gap-3 sm:gap-4 md:gap-5 justify-center text-center pb-20">
            <h1 className="font-bold text-5xl sm:text-6xl md:text-7xl">Tran<span className="text-blue-400">Scribe</span>X</h1>
            <h3 className='font-medium md:text-lg'>Record <span className='text-blue-400'>&rarr;</span> Transcribe <span className='text-blue-400'>&rarr;</span> Translate</h3>
            <button className='flex specialBtn font-semibold px-4 py-2 rounded-xl items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4'>
                <p className='text-blue-400'>Record</p>
                <div className='flex items-center gap-2'>
                    <i className={"fa-solid duration-200 fa-microphone "}></i>
                </div>
            </button>
            <p className='text-base font-semibold'>Or <label className='text-blue-400 cursor-pointer hover:text-blue-600 duration-200'>upload <input className='hidden' type='file' accept='.mp3,.wave' /></label> a mp3 file</p>
            <p className='italic text-slate-400'>Free now free forever</p>
        </main>
    )
}

export default HomePage