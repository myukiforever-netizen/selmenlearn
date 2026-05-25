import { prisma } from "../lib/prisma.js";

export async function updateStreak(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastStudy: true },
  });
  if (!user) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastStudy = user.lastStudy ? new Date(user.lastStudy) : null;
  if (lastStudy) lastStudy.setHours(0, 0, 0, 0);

  // Déjà compté aujourd'hui
  if (lastStudy && lastStudy.getTime() === today.getTime()) {
    return user.streak;
  }

  let newStreak: number;

  if (!lastStudy || lastStudy < yesterday) {
    // Plus de 24h de gap → reset
    newStreak = 1;
  } else {
    // Étudié hier → incrément
    newStreak = user.streak + 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, lastStudy: new Date() },
  });

  return newStreak;
}
