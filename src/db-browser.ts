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

const db = new Dexie("phrase") as Dexie & {
  hitokotos: EntityTable<Phrase, "cid">;
};

db.version(1).stores({
  hitokotos: "++cid, hitokoto, from_who",
});

export type { Phrase };
export { db };
