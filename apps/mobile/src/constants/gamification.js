export const XP_LEVELS = [
  0, 500, 1200, 2000, 3000, 4500, 6500, 9000, 12000, 15500, 20000, 25000, 30000,
  36000, 43000, 51000, 60000, 70000, 81000, 93000, 106000,
];

export function calculateLevelProgress(totalXP) {
  let currentLevel = 1;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (totalXP >= XP_LEVELS[i]) {
      currentLevel = i + 1;
    } else {
      break;
    }
  }

  const currentLevelXP = XP_LEVELS[currentLevel - 1] || 0;
  const nextLevelXP =
    XP_LEVELS[currentLevel] || XP_LEVELS[XP_LEVELS.length - 1] + 10000;
  const progressXP = totalXP - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min((progressXP / requiredXP) * 100, 100);

  return {
    currentLevel,
    progressXP,
    requiredXP,
    progressPercent,
    nextLevelXP,
    totalXP,
  };
}

export function getLevelTitle(level) {
  if (level <= 5) return "Beginner Iron";
  if (level <= 10) return "Steel Seeker";
  if (level <= 20) return "Iron Warrior";
  if (level <= 30) return "Titan Mode";
  if (level <= 50) return "Apex Physique";
  return "Legend Tier";
}

export function getLevelColor(level) {
  if (level <= 5) return "#9ca3af"; // Gray
  if (level <= 10) return "#60a5fa"; // Blue
  if (level <= 20) return "#a78bfa"; // Purple
  if (level <= 30) return "#f59e0b"; // Orange
  if (level <= 50) return "#FFD700"; // Gold
  return "#ef4444"; // Red
}
