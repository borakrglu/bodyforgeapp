import { useEffect, useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import { create } from "zustand";

const ENTITLEMENT_ID = "premium";

const useRevenueCatStore = create((set, get) => ({
  isConfigured: false,
  isPremium: false,
  loading: true,
  customerInfo: null,
  offerings: null,

  configure: async (userId) => {
    if (get().isConfigured) return;

    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      const apiKey =
        Platform.OS === "ios"
          ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
          : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

      if (!apiKey) {
        console.error("RevenueCat API key not found");
        set({ loading: false, isConfigured: false });
        return;
      }

      await Purchases.configure({ apiKey });

      // Set user ID for RevenueCat
      if (userId) {
        await Purchases.logIn(userId.toString());
      }

      set({ isConfigured: true });
      await get().checkSubscription();
    } catch (error) {
      console.error("RevenueCat configuration error:", error);
      set({ loading: false, isConfigured: false });
    }
  },

  checkSubscription: async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium =
        typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";

      set({
        isPremium,
        customerInfo,
        loading: false,
      });

      return isPremium;
    } catch (error) {
      console.error("Error checking subscription:", error);
      set({ loading: false, isPremium: false });
      return false;
    }
  },

  getOfferings: async () => {
    try {
      const offerings = await Purchases.getOfferings();
      set({ offerings });
      return offerings;
    } catch (error) {
      console.error("Error fetching offerings:", error);
      return null;
    }
  },

  purchasePackage: async (packageToPurchase) => {
    try {
      const { customerInfo } =
        await Purchases.purchasePackage(packageToPurchase);
      const isPremium =
        typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";

      set({
        isPremium,
        customerInfo,
      });

      return { success: true, isPremium };
    } catch (error) {
      if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return { success: false, cancelled: true };
      }

      console.error("Purchase error:", error);
      return { success: false, error: error.message };
    }
  },

  restorePurchases: async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium =
        typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";

      set({
        isPremium,
        customerInfo,
      });

      return { success: true, isPremium };
    } catch (error) {
      console.error("Restore error:", error);
      return { success: false, error: error.message };
    }
  },
}));

export function useRevenueCat(userId) {
  const {
    isConfigured,
    isPremium,
    loading,
    customerInfo,
    offerings,
    configure,
    checkSubscription,
    getOfferings,
    purchasePackage,
    restorePurchases,
  } = useRevenueCatStore();

  useEffect(() => {
    if (userId && !isConfigured) {
      configure(userId);
    }
  }, [userId, isConfigured]);

  const purchase = useCallback(
    async (packageId) => {
      if (!offerings) {
        await getOfferings();
      }

      const currentOfferings = useRevenueCatStore.getState().offerings;
      if (!currentOfferings?.current) {
        Alert.alert("Error", "No packages available");
        return { success: false };
      }

      const packageToPurchase = currentOfferings.current.availablePackages.find(
        (pkg) => pkg.identifier === packageId,
      );

      if (!packageToPurchase) {
        Alert.alert("Error", "Package not found");
        return { success: false };
      }

      return await purchasePackage(packageToPurchase);
    },
    [offerings, purchasePackage, getOfferings],
  );

  const restore = useCallback(async () => {
    const result = await restorePurchases();

    if (result.success && result.isPremium) {
      Alert.alert("Success", "Your purchases have been restored!");
    } else if (result.success && !result.isPremium) {
      Alert.alert("No Purchases Found", "No active subscriptions to restore.");
    } else {
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    }

    return result;
  }, [restorePurchases]);

  return {
    isPremium,
    loading,
    customerInfo,
    offerings,
    purchase,
    restore,
    checkSubscription,
    getOfferings,
  };
}

export default useRevenueCat;
