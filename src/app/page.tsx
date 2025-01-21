'use client';
import { Prefetch } from '@/components/prefetch';
import { useVad } from '@/vad/use-vad';
import { useWhisper } from '@/whisper/use-whisper';
import { useState } from 'react';

export default function Local() {
  const [transcription, setTranscription] = useState<String[]>([]);
  const { remoteRun } = useWhisper();
  const { recording, processing } = useVad({
    onSpeechEnd: async ({ blob }) => {
      const value = await remoteRun(blob);
      if (value.trim()) {
        setTranscription(pre => {
          const temp = [...pre];
          temp.push(value);
          return temp;
        });
      }
    },
  });

  return (
    <div className="w-[100vw] h-[100vh] p-4 bg-black">
      <div className="rounded-2xl h-full ring-1 ring-zinc-800 px-8 py-8">
        <div className="w-full flex items-center justify-between">
          <div className={`flex items-center text-2xl font-semibold leading-none tracking-tight text-white`}>
            Miles' Recorder
          </div>
          <div className="flex gap-2 items-center">
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
            <Prefetch
              models={[
                {
                  name: 'Download VAD',
                  path: process.env.VAD_MODEL_PATH!,
                },
                // {
                //   name: 'Download WHISPER',
                //   path: process.env.WHISPER_MODEL_PATH!,
                // },
              ]}
            />
          </div>
        </div>

        <ul className="space-y-2 text-white h-full overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:bg-neutral-500">
          {transcription.length > 0 && transcription.map(i => <li className="p-3 bg-gray-800 rounded-md">{i}</li>)}
        </ul>
      </div>
    </div>
  );
}
