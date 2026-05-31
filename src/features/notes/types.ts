import { Timestamp } from 'firebase/firestore';

export type NoteStatus = 'active' | 'archived';
export type NoteListFilter = 'active' | 'archived';

export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  status: NoteStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type CreateNoteInput = {
  title: string;
  body?: string;
  tags?: string[];
  pinned?: boolean;
};

export type UpdateNoteInput = Partial<{
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  status: NoteStatus;
}>;
