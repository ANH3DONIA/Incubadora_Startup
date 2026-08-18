import { create } from 'zustand';

export interface Participant {
  socketId: string;
  userId: string;
  name: string;
  role: string;
  hasAudio?: boolean;
  hasVideo?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  senderRole: string;
  content: string;
  time: string | Date;
}

interface RoomState {
  currentRoomId: string | null;
  participants: Participant[];
  messages: ChatMessage[];
  isConnected: boolean;
  timer: number;
  isPitchActive: boolean;
  isWarning: boolean;

  setRoomId: (roomId: string | null) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (socketId: string) => void;
  addMessage: (message: ChatMessage) => void;
  setTimer: (seconds: number) => void;
  setPitchActive: (active: boolean) => void;
  setWarning: (warning: boolean) => void;
  setConnected: (connected: boolean) => void;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoomId: null,
  participants: [],
  messages: [],
  isConnected: false,
  timer: 300,
  isPitchActive: false,
  isWarning: false,

  setRoomId: (currentRoomId) => set({ currentRoomId }),
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants.filter((p) => p.socketId !== participant.socketId), participant],
    })),
  removeParticipant: (socketId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.socketId !== socketId),
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setTimer: (timer) => set({ timer }),
  setPitchActive: (isPitchActive) => set({ isPitchActive }),
  setWarning: (isWarning) => set({ isWarning }),
  setConnected: (isConnected) => set({ isConnected }),
  resetRoom: () =>
    set({
      currentRoomId: null,
      participants: [],
      messages: [],
      isConnected: false,
      timer: 300,
      isPitchActive: false,
      isWarning: false,
    }),
}));
