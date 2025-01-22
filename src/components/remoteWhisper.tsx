import { Prefetch } from '@/components/prefetch';
import { useVad } from '@/vad/use-vad';
import { useWhisper } from '@/whisper/use-whisper';
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

export default function Remote({ socket }: { socket: Socket | null }) {
  const [transcription, setTranscription] = useState<String[]>([]);
  const { remoteRun } = useWhisper();
  const { recording, processing } = useVad({
    onSpeechEnd: async ({ blob }) => {
      let value = await remoteRun(blob);
      if (value.trim()) {
        // if (transcription.length > 0) {
        //   const lastItem = transcription[transcription.length - 1];
        //   const splitArr = value.split(lastItem as string);
        //   console.log(splitArr);
        // } else {
        //   setTranscription(pre => {
        //     const temp = [...pre];
        //     temp.push(value);
        //     return temp;
        //   });
        // }
        setTranscription(pre => {
          const temp = [...pre];
          temp.push(value);
          return temp;
        });
      }
    },
  });

  useEffect(() => {
    if (socket && transcription.length > 0) {
      socket.emit('broadcastSentence', transcription[transcription.length - 1]);
    }
  }, [transcription, socket]);

  return (
    <div className="rounded-2xl h-full ring-1 ring-zinc-800 px-8 py-8 flex flex-col">
      <div className="w-full flex items-center justify-between pb-4">
        <div className={`flex items-center text-2xl font-semibold leading-none tracking-tight text-white`}>
          Miles's Recorder
        </div>
        <div className="flex gap-2 items-center">
          <Prefetch
            models={[
              {
                name: 'Download VAD',
                path: process.env.VAD_MODEL_PATH!,
              },
            ]}
          />
          <div className="flex items-center gap-2 text-white px-3 py-1 rounded-full text-sm font-medium bg-gray-700 hover:bg-gray-600">
            {recording ? (
              <svg
                className="fill-red-500 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
              </svg>
            ) : (
              <svg
                className={`size-4 fill-green-500 stroke-green-600 ${
                  processing ? 'fill-amber-500 stroke-amber-600' : ''
                }`}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M2 10v3" />
                <path d="M6 6v11" />
                <path d="M10 3v18" />
                <path d="M14 8v7" />
                <path d="M18 5v13" />
                <path d="M22 10v3" />
              </svg>
            )}
            {recording ? 'Recording' : `Not Recording`}
          </div>
        </div>
      </div>

      <ul
        className={`flex flex-col items-center ${
          transcription && transcription.length === 0 && 'justify-center'
        } flex-1 space-y-2 text-white overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:bg-neutral-500`}>
        {transcription.length > 0 ? (
          transcription.map((text, index) => (
            <li key={index} className="w-full p-3 bg-gray-800 rounded-md">
              {text}
            </li>
          ))
        ) : (
          <div className="text-gray-400 text-lg">Speak please</div>
        )}
      </ul>
    </div>
  );
}
