import Dexie, { type EntityTable } from "dexie";

export type Hitokoto = {
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

interface Phrase extends Hitokoto {
  cid: number;
}

interface HiAudio {
  id: number;
  text: string;
  audio: ArrayBuffer;
}

const db = new Dexie("phrase") as Dexie & {
  hitokotos: EntityTable<Phrase, "cid">;
  audios: EntityTable<HiAudio, "id">;
};

db.version(2).stores({
  hitokotos: "++cid, hitokoto, from_who",
  audios: "++id, text",
});

export type { Phrase, HiAudio };
export { db };
