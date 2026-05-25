import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string | null;
  setXP: (xp: number) => void;
  addXP: (amount: number) => void;
  setStreak: (streak: number) => void;
  setLevel: (level: number) => void;
  hydrate: (data: { xp: number; level: number; streak: number; lastStudyDate: string | null }) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastStudyDate: null,

      setXP: (xp) => set({ xp }),
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      setStreak: (streak) => set({ streak }),
      setLevel: (level) => set({ level }),
      hydrate: (data) => set(data),
    }),
    {
      name: "selmenlearn-user",
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        lastStudyDate: state.lastStudyDate,
      }),
    }
  )
);
