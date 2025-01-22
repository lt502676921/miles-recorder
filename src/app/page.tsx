'use client';
import { useState } from 'react';
import Local from '@/components/localWhisper';
import Remote from '@/components/remoteWhisper';

export default function Home() {
  const [mode, setMode] = useState<'remote' | 'local' | null>(null);

  const setModeToRemote = () => setMode('remote');

  const setModeToLocal = () => setMode('local');

  return (
    <div className="w-[100vw] h-[100vh] p-4 bg-black">
      {mode ? (
        <>{{ remote: <Remote />, local: <Local /> }[mode]}</>
      ) : (
        <div className="rounded-2xl h-full ring-1 ring-zinc-800 px-8 py-8 flex flex-col">
          <div className="w-full flex items-center justify-between pb-4">
            <div className={`flex items-center text-2xl font-semibold leading-none tracking-tight text-white`}>
              Miles' Recorder
            </div>
          </div>
        </div>
      )}

      <div
        id="popup-modal"
        tabIndex={-1}
        className={`${
          mode ? 'hidden' : ''
        } bg-[#00000073] backdrop-blur overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-[#0e1013] rounded-lg dark:bg-gray-700 shadow-2xl">
            <div className="p-4 md:p-5 text-center">
              <h3 className="mb-5 text-lg font-normal text-gray-300 dark:text-gray-400">
                Welcome to Miles' Recorder !<div>Please choose a model</div>
              </h3>
              <button
                data-modal-hide="popup-modal"
                type="button"
                className="ease-in-out duration-300 w-24	py-2.5 text-sm font-medium focus:outline-none border border-[#1C1E22] bg-[#1C1E22] text-[#ccc5d9] rounded-lg hover:bg-[#1C1E22] hover:text-[#ac5dd9] hover:border-[#ac5dd9] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={setModeToRemote}>
                remote
              </button>
              <button
                data-modal-hide="popup-modal"
                type="button"
                className="ease-in-out duration-300 w-24 ms-3 text-white bg-[#AC5DD9] hover:bg-[#8644b3] focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm py-2.5"
                onClick={setModeToLocal}>
                local
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
