import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { useUser } from "./auth/useUser";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Premium feature flags
export const PREMIUM_FEATURES = {
  AI_WORKOUT_GENERATION: "ai_workout_generation",
  AI_MEAL_PLAN: "ai_meal_plan",
  AI_SUPPLEMENT_PLAN: "ai_supplement_plan",
  UNLIMITED_REGENERATION: "unlimited_regeneration",
  ADVANCED_ANALYTICS: "advanced_analytics",
  EXERCISE_VIDEO_LIBRARY: "exercise_video_library",
  WEEKLY_AI_ADJUSTMENTS: "weekly_ai_adjustments",
  PROGRESS_PHOTOS: "progress_photos",
  BODY_MEASUREMENTS: "body_measurements",
  PERSONAL_RECORDS: "personal_records",
  EXPORT_DATA: "export_data",
  AD_FREE: "ad_free",
};

// Free tier limits
export const FREE_LIMITS = {
  workoutGenerations: 1,
  mealPlanGenerations: 1,
  supplementPlanGenerations: 1,
  programRegenerations: 0,
  savedPrograms: 3,
  progressPhotos: 5,
  workoutHistory: 7, // days
};

// Premium tier limits (unlimited represented as -1)
export const PREMIUM_LIMITS = {
  workoutGenerations: -1,
  mealPlanGenerations: -1,
  supplementPlanGenerations: -1,
  programRegenerations: -1,
  savedPrograms: -1,
  progressPhotos: -1,
  workoutHistory: -1,
};

export function usePremium() {
  const { user } = useUser();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [usageStats, setUsageStats] = useState(null);

  // Check premium status
  const checkPremiumStatus = useCallback(async () => {
    if (!user?.id) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    try {
      // Check if user has premium_active flag
      if (user.premium_active) {
        setIsPremium(true);
        setLoading(false);
        return;
      }

      // Try to check from API (will fail in Expo Go without backend)
      try {
        const response = await fetch(`/api/subscription/status?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium || false);
          setSubscriptionInfo(data.subscription || null);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        // API not available (Expo Go), use cached/mock status
        console.log("Subscription API not available, using local status");
      }

      // Fallback to cached status
      const cached = await AsyncStorage.getItem(`premium_${user.id}`);
      setIsPremium(cached === "true");
    } catch (error) {
      console.error("Error checking premium status:", error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.premium_active]);

  // Load usage stats
  const loadUsageStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Try API first
      const response = await fetch(`/api/subscription/usage?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data.usage);
        return;
      }
    } catch (error) {
      // API not available, use local storage
      console.log("Usage API not available, using local storage");
    }

    // Fallback to local storage
    try {
      const localUsage = await AsyncStorage.getItem(`usage_${user.id}`);
      if (localUsage) {
        setUsageStats(JSON.parse(localUsage));
      } else {
        // Default usage stats
        setUsageStats({
          workoutGenerations: 0,
          mealPlanGenerations: 0,
          supplementPlanGenerations: 0,
          programRegenerations: 0,
          savedPrograms: 0,
          progressPhotos: 0,
        });
      }
    } catch (error) {
      console.error("Error loading usage stats:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    checkPremiumStatus();
    loadUsageStats();
  }, [checkPremiumStatus, loadUsageStats]);

  // Cache premium status
  useEffect(() => {
    if (user?.id && !loading) {
      AsyncStorage.setItem(`premium_${user.id}`, isPremium.toString());
    }
  }, [isPremium, user?.id, loading]);

  // Check if a specific feature is available
  const hasFeature = useCallback(
    (feature) => {
      if (isPremium) return true;

      // Some features are always free
      const freeFeatures = [
        PREMIUM_FEATURES.PROGRESS_PHOTOS, // Limited
        PREMIUM_FEATURES.PERSONAL_RECORDS,
      ];

      return freeFeatures.includes(feature);
    },
    [isPremium]
  );

  // Check if user has reached a limit
  const hasReachedLimit = useCallback(
    (limitType) => {
      if (isPremium) return false;
      if (!usageStats) return false;

      const limit = FREE_LIMITS[limitType];
      const used = usageStats[limitType] || 0;

      return limit !== -1 && used >= limit;
    },
    [isPremium, usageStats]
  );

  // Get remaining uses for a feature
  const getRemainingUses = useCallback(
    (limitType) => {
      if (isPremium) return -1; // Unlimited

      const limit = FREE_LIMITS[limitType];
      if (limit === -1) return -1;

      const used = usageStats?.[limitType] || 0;
      return Math.max(0, limit - used);
    },
    [isPremium, usageStats]
  );

  // Increment usage counter
  const incrementUsage = useCallback(
    async (limitType) => {
      if (!user?.id) return;

      try {
        // Try API first
        await fetch("/api/subscription/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            type: limitType,
          }),
        });
      } catch (error) {
        // API not available, use local storage
        console.log("Usage API not available, using local storage");
      }

      // Also update local storage
      const newUsage = {
        ...usageStats,
        [limitType]: (usageStats?.[limitType] || 0) + 1,
      };
      setUsageStats(newUsage);
      await AsyncStorage.setItem(`usage_${user.id}`, JSON.stringify(newUsage));
    },
    [user?.id, usageStats]
  );

  // Get current limits based on subscription
  const getLimits = useCallback(() => {
    return isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
  }, [isPremium]);

  // Mock purchase for testing (set premium to true)
  const mockPurchase = useCallback(async () => {
    setIsPremium(true);
    if (user?.id) {
      await AsyncStorage.setItem(`premium_${user.id}`, "true");
    }
    return { success: true };
  }, [user?.id]);

  // Mock restore
  const mockRestore = useCallback(async () => {
    const cached = await AsyncStorage.getItem(`premium_${user?.id}`);
    if (cached === "true") {
      setIsPremium(true);
      return { success: true, isPremium: true };
    }
    return { success: true, isPremium: false };
  }, [user?.id]);

  return {
    isPremium,
    loading,
    subscriptionInfo,
    usageStats,
    hasFeature,
    hasReachedLimit,
    getRemainingUses,
    incrementUsage,
    getLimits,
    checkPremiumStatus,
    // For testing in Expo Go
    purchase: mockPurchase,
    restore: mockRestore,
  };
}

export default usePremium;
