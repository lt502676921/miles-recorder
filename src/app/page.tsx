'use client';
import { useRef, useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import Local from '@/components/localWhisper';
import Remote from '@/components/remoteWhisper';

export default function Home() {
  const [role, setRole] = useState<'speaker' | 'listener' | null>(null);
  const [mode, setMode] = useState<'remote' | 'local' | null>(null);

  const [receivedSentences, setReceivedSentences] = useState<string[]>([]);

  const socket = useRef<Socket | null>(null);

  const setRoleToSpeaker = () => {
    setRole('speaker');
    socket.current = io('https://miles-recorder-server.oreo.ink');
    socket.current.on('connect', () => {
      console.log('Connected successfully');

      socket.current!.on('error', err => {
        console.log(err);
      });

      socket.current!.emit('join', 'Speaker');
    });
  };

  const setRoleToListener = () => {
    setRole('listener');

    socket.current = io('https://miles-recorder-server.oreo.ink');
    socket.current.on('connect', () => {
      console.log('Connected successfully');

      socket.current!.on('error', err => {
        console.log(err);
      });

      socket.current!.emit('join', 'Listener');

      socket.current!.on('newSentence', sentence => {
        setReceivedSentences(pre => [...pre, sentence]);
      });
    });
  };

  const setModeToRemote = () => setMode('remote');

  const setModeToLocal = () => setMode('local');

  return (
    <div className="w-[100vw] h-[100vh] p-4 bg-black">
      {role === 'speaker' && mode ? (
        <>{{ remote: <Remote socket={socket.current} />, local: <Local socket={socket.current} /> }[mode]}</>
      ) : (
        <div className="rounded-2xl h-full ring-1 ring-zinc-800 px-8 py-8 flex flex-col">
          <div className="w-full flex items-center justify-between pb-4">
            <div className={`flex items-center text-2xl font-semibold leading-none tracking-tight text-white`}>
              Miles' Recorder
            </div>
          </div>

          <ul
            className={`flex flex-col items-center ${
              receivedSentences && receivedSentences.length === 0 && 'justify-center'
            } flex-1 space-y-2 text-white overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:bg-neutral-500`}>
            {receivedSentences.length > 0 ? (
              receivedSentences.map((text, index) => (
                <li key={index} className="w-full p-3 bg-gray-800 rounded-md">
                  {text}
                </li>
              ))
            ) : (
              <div className="text-gray-400 text-lg">The speaker has not spoken yet</div>
            )}
          </ul>
        </div>
      )}

      <div
        id="popup-modal"
        tabIndex={-1}
        className={`${
          (role && role === 'speaker' && mode) || (role && role === 'listener') ? 'hidden' : ''
        } bg-[#00000073] backdrop-blur overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-[#0e1013] rounded-lg dark:bg-gray-700 shadow-2xl">
            <div className="p-4 md:p-5 text-center">
              {!role ? (
                <>
                  <h3 className="mb-5 text-lg font-normal text-gray-300 dark:text-gray-400">What is your role ?</h3>
                  <button
                    data-modal-hide="popup-modal"
                    type="button"
                    className="ease-in-out duration-300 w-24	py-2.5 text-sm font-medium focus:outline-none border border-[#1C1E22] bg-[#1C1E22] text-[#ccc5d9] rounded-lg hover:bg-[#1C1E22] hover:text-[#ac5dd9] hover:border-[#ac5dd9] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    onClick={setRoleToSpeaker}>
                    Speaker
                  </button>
                  <button
                    data-modal-hide="popup-modal"
                    type="button"
                    className="ease-in-out duration-300 w-24 ms-3 text-white bg-[#AC5DD9] hover:bg-[#8644b3] focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm py-2.5"
                    onClick={setRoleToListener}>
                    Listener
                  </button>
                </>
              ) : null}

              {role === 'speaker' ? (
                <>
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
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
