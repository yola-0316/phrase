"use client";

import { useEffect, useState } from "react";

import { db, Hitokoto } from "@/db-browser";
import { AudioManager } from "@/lib/audio";
import Slogan from "@/components/Slogan";
import Footer from "@/components/Footer";

let lastCallTime = 0;

const choicePhrase = async () => {
  const all = await db.hitokotos.toArray();
  const randomIndex = Math.floor(Math.random() * all.length);
  return all[randomIndex];
};

const fetchPhrase = async () => {
  try {
    const now = Date.now();
    if (now - lastCallTime < 10000) {
      return choicePhrase();
    } else {
      lastCallTime = now;
    }

    const response = await fetch("https://v1.hitokoto.cn/?c=b");
    const data = await response.json();
    data.createdAt = new Date().toISOString();

    const id = await db.hitokotos.add({ ...data });
    console.log("added", id, data.hitokoto);
    return data;
  } catch (error) {
    console.error(error);
    const data = await choicePhrase();
    return data;
  }
};

export default function HomeUI() {
  const [hitokoto, setHitokoto] = useState<Hitokoto>({} as Hitokoto);
  const [playingState, setPlayingState] = useState<{
    isPlaying: boolean;
    currentSrc: string | null;
  }>({
    isPlaying: false,
    currentSrc: null,
  });

  useEffect(() => {
    async function getPhrase() {
      const data = await fetchPhrase();
      setHitokoto(data);
      // sayIt(data.hitokoto);
    }
    getPhrase();
  }, []);

  useEffect(() => {
    const audio = AudioManager.getInstance();

    const cleanup = audio.onStateChange((state) => {
      console.log("state", state);
      setPlayingState(state);
    });

    return () => {
      cleanup();
    };
  }, []);

  const changePhrase = async () => {
    const data = await fetchPhrase();
    setHitokoto(data);
  };

  const handlePlay = (src: string | AudioBuffer | ArrayBuffer) => {
    const audio = AudioManager.getInstance();
    if (playingState.currentSrc === src && playingState.isPlaying) {
      audio.pause();
    } else {
      audio.play(src);
    }
  };

  const sayIt = async (text: string) => {
    const existingAudio = await db.audios.where({ text }).first();
    if (existingAudio) {
      handlePlay(existingAudio.audio);
      return;
    }

    const res = await fetch("/x", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const buffer = await res.arrayBuffer();

    await db.audios.add({
      text,
      audio: buffer,
    });

    handlePlay(buffer);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-1/4">
        <Slogan />

        <p>{hitokoto?.hitokoto}</p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            onClick={() => sayIt(hitokoto.hitokoto)}
          >
            倾听
          </button>
          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            onClick={changePhrase}
          >
            换一条
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
