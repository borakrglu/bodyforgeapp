import { useState, useEffect } from "react";

export function useUserXP(userId) {
  const [userXP, setUserXP] = useState({ totalXP: 0, currentLevel: 1 });

  const loadUserXP = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserXP({
          totalXP: data.user.total_xp || 0,
          currentLevel: data.user.current_level || 1,
        });
      }
    } catch (error) {
      console.error("Error loading user XP:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserXP();
    }
  }, [userId]);

  return { userXP, loadUserXP };
}
