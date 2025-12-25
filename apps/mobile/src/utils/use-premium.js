import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { useUser } from "./auth/useUser";
import useRevenueCat from "./use-revenuecat";
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

  // Use RevenueCat for native mobile
  const revenueCat = Platform.OS !== "web" ? useRevenueCat(user?.id) : null;

  // Check premium status
  const checkPremiumStatus = useCallback(async () => {
    if (!user?.id) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    try {
      // For native mobile, use RevenueCat
      if (Platform.OS !== "web" && revenueCat) {
        setIsPremium(revenueCat.isPremium);
        setLoading(revenueCat.loading);
        return;
      }

      // For web or as fallback, check database
      const response = await fetch(`/api/subscription/status?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.isPremium || false);
        setSubscriptionInfo(data.subscription || null);
      } else {
        // Fallback to user profile premium_active field
        setIsPremium(user.premium_active || false);
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
      // Fallback to cached status
      const cached = await AsyncStorage.getItem(`premium_${user.id}`);
      setIsPremium(cached === "true");
    } finally {
      setLoading(false);
    }
  }, [user?.id, revenueCat]);

  // Load usage stats
  const loadUsageStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/subscription/usage?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data.usage);
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
        await fetch("/api/subscription/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            type: limitType,
          }),
        });
        // Reload usage stats
        await loadUsageStats();
      } catch (error) {
        console.error("Error incrementing usage:", error);
      }
    },
    [user?.id, loadUsageStats]
  );

  // Get current limits based on subscription
  const getLimits = useCallback(() => {
    return isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
  }, [isPremium]);

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
    // RevenueCat methods for mobile
    purchase: revenueCat?.purchase,
    restore: revenueCat?.restore,
  };
}

export default usePremium;
