import { create } from "zustand";

export type LumiMood =
  | "neutral"
  | "happy"
  | "sad"
  | "surprised"
  | "proud"
  | "excited"
  | "thinking";

interface LumiState {
  mood:    LumiMood;
  message: string;
  visible: boolean;
  setMood: (mood: LumiMood, message?: string) => void;
  hide:    () => void;
}

export const useLumiStore = create<LumiState>((set) => ({
  mood:    "neutral",
  message: "",
  visible: false,
  setMood: (mood, message = "") => set({ mood, message, visible: true }),
  hide:    () => set({ visible: false }),
}));
