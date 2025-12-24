import { useState, useEffect } from "react";

export function useQuests(userId) {
  const [dailyQuests, setDailyQuests] = useState([]);
  const [weeklyQuests, setWeeklyQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQuests = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/gamification/quests?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setDailyQuests(data.dailyQuests || []);
        setWeeklyQuests(data.weeklyQuests || []);
      }
    } catch (error) {
      console.error("Error loading quests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadQuests();
    }
  }, [userId]);

  return { dailyQuests, weeklyQuests, loading, loadQuests };
}
