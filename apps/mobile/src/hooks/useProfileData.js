import { useState, useEffect } from "react";

export function useProfileData(userId) {
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const userRes = await fetch(`/api/users/${userId}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setProfileData(userData.user);
      }

      const progressRes = await fetch(`/api/progress?userId=${userId}`);
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        const entries = progressData.entries || [];

        if (entries.length > 0) {
          const latest = entries[0];
          const oldest = entries[entries.length - 1];

          setStats({
            currentWeight: latest.weight_kg,
            startWeight: oldest.weight_kg,
            totalEntries: entries.length,
            currentBodyFat: latest.body_fat_percentage,
          });
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return { profileData, stats, loading };
}
