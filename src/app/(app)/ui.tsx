"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Hitokoto = {
  id: number;
  hitokoto: string;
  type: string;
  from: string;
  from_who: string;
  creator: string;
  creator_uid: number;
  reviewer: number;
  uuid: string;
  commit_from: string;
  created_at: string;
  length: number;
};

export default function HomeUI() {
  const [hitokoto, setHitokoto] = useState<Hitokoto>({} as Hitokoto);

  useEffect(() => {
    async function fetchPhrase() {
      const response = await fetch("https://v1.hitokoto.cn/?c=b");
      const data = await response.json();
      setHitokoto(data);
      // sayIt(data.hitokoto);
    }
    fetchPhrase();
  }, []);

  const sayIt = async (text: string) => {
    const res = await fetch("/x", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const buffer = await res.arrayBuffer();

    const audioContext = new AudioContext();
    audioContext.decodeAudioData(buffer, (audioBuffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    });
  };

  const changePhrase = async () => {
    const response = await fetch("https://v1.hitokoto.cn/?c=b");
    const data = await response.json();
    setHitokoto(data);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl sm:text-6xl">一言一语</h1>

        <p>{hitokoto.hitokoto}</p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            onClick={() => sayIt(hitokoto.hitokoto)}
          >
            Say it
          </button>
          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            onClick={changePhrase}
          >
            换一条
          </button>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://hitokoto.cn/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          一言
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.jinrishici.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          今日诗词
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to Next →
        </a>
      </footer>
    </div>
  );
}
