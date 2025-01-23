'use client';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import Local from '@/components/localWhisper';
import Remote from '@/components/remoteWhisper';

export default function Home() {
  const [role, setRole] = useState<'speaker' | 'listener' | null>(null);
  const [mode, setMode] = useState<'remote' | 'local' | null>(null);
  const [receivedSentences, setReceivedSentences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const socket = useRef<Socket | null>(null);
  const isConnect = useRef(false);
  const listBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (receivedSentences.length > 0) {
      listBottomRef.current && listBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [receivedSentences]);

  const setRoleToSpeaker = () => {
    if (isConnect.current) return;
    setIsLoading(true);
    setRole('speaker');
    socket.current = io('https://miles-recorder-server.oreo.ink', {
      transports: ['websocket'],
      extraHeaders: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
      },
    });
    socket.current.on('connect', () => {
      if (isConnect.current) return;
      isConnect.current = true;
      console.log('Connected successfully');
      setIsLoading(false);

      socket.current!.on('error', err => {
        console.log(err);
      });

      socket.current!.on('disconnect', () => {
        console.log('断开连接');
        isConnect.current = false;
      });

      socket.current!.emit('join', 'Speaker');
    });
  };

  const setRoleToListener = () => {
    if (isConnect.current) return;
    setIsLoading(true);
    setRole('listener');
    socket.current = io('wss://miles-recorder-server.oreo.ink', {
      transports: ['websocket'],
      extraHeaders: {
        'Access-Control-Allow-Origin': '*',
      },
    });
    socket.current.on('connect', () => {
      if (isConnect.current) return;
      isConnect.current = true;
      console.log('Connected successfully');
      setIsLoading(false);

      socket.current!.on('error', err => {
        console.log(err);
      });

      socket.current!.on('disconnect', () => {
        console.log('断开连接');
        isConnect.current = false;
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
              Miles's Recorder
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
            <div ref={listBottomRef} />
          </ul>
        </div>
      )}

      <div
        id="popup-modal"
        tabIndex={-1}
        className={`${
          (!isLoading && role && role === 'speaker' && mode) || (!isLoading && role && role === 'listener')
            ? 'hidden'
            : ''
        } bg-[#00000073] backdrop-blur overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-[#0e1013] rounded-lg dark:bg-gray-700 shadow-2xl">
            <div className="p-4 md:p-5 text-center">
              {!role ? (
                <>
                  <h3 className="mb-5 text-lg font-normal text-gray-300 dark:text-gray-400">
                    <div>Welcome to Miles's Recorder !</div>
                    <div>Which is your role ?</div>
                  </h3>
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

              {role && isLoading ? (
                <div className="w-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-300 animate-spin">
                    <path d="M12 2v4" />
                    <path d="m16.2 7.8 2.9-2.9" />
                    <path d="M18 12h4" />
                    <path d="m16.2 16.2 2.9 2.9" />
                    <path d="M12 18v4" />
                    <path d="m4.9 19.1 2.9-2.9" />
                    <path d="M2 12h4" />
                    <path d="m4.9 4.9 2.9 2.9" />
                  </svg>
                </div>
              ) : !isLoading && role === 'speaker' ? (
                <>
                  <h3 className="mb-5 text-lg font-normal text-gray-300 dark:text-gray-400">
                    <div>Please choose a model for Whisper</div>
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
