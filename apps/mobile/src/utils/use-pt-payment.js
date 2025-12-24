import { useState, useCallback } from "react";
import { Linking, Platform } from "react-native";
import { useRouter } from "expo-router";

const PT_PLANS = {
  turkey: {
    monthly: {
      name: "Aylık PT",
      price: "₺999",
      priceValue: 999,
      currency: "TRY",
      type: "monthly",
      provider: "iyzico",
    },
    quarterly: {
      name: "3 Aylık PT",
      price: "₺2,699",
      priceValue: 2699,
      currency: "TRY",
      type: "quarterly",
      provider: "iyzico",
    },
    yearly: {
      name: "Yıllık PT",
      price: "₺9,999",
      priceValue: 9999,
      currency: "TRY",
      type: "yearly",
      provider: "iyzico",
    },
  },
  global: {
    monthly: {
      name: "Monthly PT",
      price: "$49",
      priceValue: 49,
      currency: "USD",
      type: "monthly",
      provider: "paddle",
    },
    quarterly: {
      name: "3-Month PT",
      price: "$129",
      priceValue: 129,
      currency: "USD",
      type: "quarterly",
      provider: "paddle",
    },
    yearly: {
      name: "Yearly PT",
      price: "$499",
      priceValue: 499,
      currency: "USD",
      type: "yearly",
      provider: "paddle",
    },
  },
};

export function usePTPayment() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const detectCountry = useCallback((userCountryCode) => {
    // Use user's country code from profile if available
    if (userCountryCode === "TR") {
      return "TR";
    }
    return "GLOBAL";
  }, []);

  const getAvailablePlans = useCallback(
    (countryCode) => {
      const country = detectCountry(countryCode);
      return country === "TR" ? PT_PLANS.turkey : PT_PLANS.global;
    },
    [detectCountry],
  );

  const initiatePTCheckout = useCallback(
    async (planId, userId, coachId, countryCode = "TR") => {
      setLoading(true);

      try {
        const country = detectCountry(countryCode);
        const plans = getAvailablePlans(countryCode);
        const plan = plans[planId];

        if (!plan) {
          throw new Error("Invalid plan selected");
        }

        // Call backend to create checkout session
        const response = await fetch("/api/pt/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            coachId,
            planId,
            country,
            provider: plan.provider,
            amount: plan.priceValue,
            currency: plan.currency,
            type: plan.type,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create checkout session");
        }

        const { checkoutUrl } = await response.json();

        // Open checkout in browser
        const canOpen = await Linking.canOpenURL(checkoutUrl);
        if (canOpen) {
          await Linking.openURL(checkoutUrl);
        } else {
          throw new Error("Cannot open payment URL");
        }

        setLoading(false);
        return { success: true };
      } catch (error) {
        console.error("PT checkout error:", error);
        setLoading(false);
        return { success: false, error: error.message };
      }
    },
    [detectCountry, getAvailablePlans],
  );

  const checkPTStatus = useCallback(async (userId) => {
    try {
      const response = await fetch(`/api/pt/check-status?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to check PT status");
      }

      const data = await response.json();
      return {
        active: data.active || false,
        plan: data.plan || null,
        expiresAt: data.expiresAt || null,
        coachId: data.coachId || null,
      };
    } catch (error) {
      console.error("PT status check error:", error);
      return { active: false, plan: null, expiresAt: null, coachId: null };
    }
  }, []);

  return {
    loading,
    getAvailablePlans,
    initiatePTCheckout,
    checkPTStatus,
  };
}

export default usePTPayment;
