import { OnSpeechEnd, OnSpeechStart, SpeechChunks } from '@/vad/speech-chunks';
import { useEffect, useRef, useState } from 'react';

export const useVad = ({ onSpeechStart, onSpeechEnd }: { onSpeechStart?: OnSpeechStart; onSpeechEnd: OnSpeechEnd }) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);

  const chunks = useRef<SpeechChunks | null>(null);

  useEffect(() => {
    if (!chunks.current) {
      chunks.current = new SpeechChunks(
        () => {
          setRecording(true);
          onSpeechStart?.();
        },
        async ({ blob, float32Array }) => {
          setRecording(false);
          setProcessing(true);
          await onSpeechEnd({ blob, float32Array });
          setProcessing(false);
        }
      );
    }

    const speechChunk = chunks.current;
    void speechChunk.start();
    return () => {
      void speechChunk.close();
      chunks.current = null;
    };
  }, [onSpeechStart, onSpeechEnd]);

  return { recording, processing };
};
