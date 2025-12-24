import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Check, X, Zap, Crown } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  useFonts,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import useRevenueCat from "../utils/use-revenuecat";
import useLanguage from "../utils/i18n";
import { useUser } from "../utils/auth/useUser";

export default function PremiumPaywall() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [purchasing, setPurchasing] = useState(false);
  const { t } = useLanguage();
  const { user } = useUser();

  const { isPremium, loading, offerings, purchase, restore, getOfferings } =
    useRevenueCat(user?.id);

  const [loaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (user?.id) {
      getOfferings();
    }
  }, [user?.id]);

  const handleUpgrade = async () => {
    setPurchasing(true);

    try {
      // Use RevenueCat package identifiers
      const packageId =
        selectedPlan === "monthly" ? "premium_monthly" : "premium_yearly";
      const result = await purchase(packageId);

      if (result.success && result.isPremium) {
        // Success! User is now premium
        router.back();
      } else if (result.cancelled) {
        // User cancelled
        setPurchasing(false);
      } else {
        // Error occurred
        setPurchasing(false);
        alert(t("errorGenerating"));
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    await restore();
  };

  if (!loaded || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#050608",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  // If already premium, go back
  if (isPremium) {
    router.back();
    return null;
  }

  const features = [
    t("personalizedWorkoutPlan"),
    t("customMealPlan"),
    t("supplementBlueprint"),
    t("weeklyAIAdjustments"),
    t("unlimitedRegeneration"),
    t("exerciseVideoLibrary"),
    t("detailedAnalytics"),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#050608" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: insets.top + 20,
            right: 20,
            backgroundColor: "#10131A",
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <X color="#9BA4B5" size={24} />
        </TouchableOpacity>

        <View
          style={{
            backgroundColor: "#FF6B00",
            borderRadius: 50,
            width: 100,
            height: 100,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Crown color="#F5F5F5" size={50} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20 }}>
          {/* Title */}
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Poppins_700Bold",
              color: "#F5F5F5",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {t("unlockYourJourney")}
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Inter_400Regular",
              color: "#9BA4B5",
              textAlign: "center",
              marginBottom: 32,
              lineHeight: 22,
            }}
          >
            {t("premiumSubtitle")}
          </Text>

          {/* Features List */}
          <View
            style={{
              backgroundColor: "#10131A",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            {features.map((feature, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: index < features.length - 1 ? 1 : 0,
                  borderBottomColor: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(255, 107, 0, 0.15)",
                    borderRadius: 10,
                    width: 32,
                    height: 32,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Check color="#FF6B00" size={18} strokeWidth={3} />
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_500Medium",
                    color: "#F5F5F5",
                    flex: 1,
                  }}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Pricing Plans */}
          <View style={{ marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => setSelectedPlan("monthly")}
              style={{
                backgroundColor:
                  selectedPlan === "monthly" ? "#10131A" : "transparent",
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderWidth: 2,
                borderColor:
                  selectedPlan === "monthly"
                    ? "#FF6B00"
                    : "rgba(255, 255, 255, 0.08)",
                position: "relative",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: -10,
                  right: 20,
                  backgroundColor: "#38C793",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_700Bold",
                    color: "#F5F5F5",
                  }}
                >
                  7 {t("dayFreeTrial")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Poppins_700Bold",
                      color: "#F5F5F5",
                      marginBottom: 4,
                    }}
                  >
                    {t("monthly")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#9BA4B5",
                    }}
                  >
                    ₺89 / {t("month")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#6B7280",
                      marginTop: 4,
                    }}
                  >
                    7 gün ücretsiz, sonra ₺89/ay
                  </Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      selectedPlan === "monthly" ? "#FF6B00" : "#9BA4B5",
                    backgroundColor:
                      selectedPlan === "monthly" ? "#FF6B00" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedPlan === "monthly" && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#F5F5F5",
                      }}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedPlan("yearly")}
              style={{
                backgroundColor:
                  selectedPlan === "yearly" ? "#10131A" : "transparent",
                borderRadius: 16,
                padding: 20,
                borderWidth: 2,
                borderColor:
                  selectedPlan === "yearly"
                    ? "#FF6B00"
                    : "rgba(255, 255, 255, 0.08)",
                position: "relative",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: -10,
                  right: 20,
                  backgroundColor: "#38C793",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_700Bold",
                    color: "#F5F5F5",
                  }}
                >
                  26% {t("save")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Poppins_700Bold",
                      color: "#F5F5F5",
                      marginBottom: 4,
                    }}
                  >
                    {t("yearly")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#9BA4B5",
                    }}
                  >
                    ₺790 / {t("year")}
                  </Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      selectedPlan === "yearly" ? "#FF6B00" : "#9BA4B5",
                    backgroundColor:
                      selectedPlan === "yearly" ? "#FF6B00" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedPlan === "yearly" && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#F5F5F5",
                      }}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Small Print */}
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#6B7280",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            PT Coaching paketleri ayrı satın alınır.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          backgroundColor: "#050608",
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <TouchableOpacity
          onPress={handleUpgrade}
          disabled={purchasing}
          style={{
            backgroundColor: "#FF6B00",
            borderRadius: 16,
            padding: 18,
            alignItems: "center",
            marginBottom: 12,
            opacity: purchasing ? 0.6 : 1,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {purchasing ? (
              <ActivityIndicator color="#F5F5F5" />
            ) : (
              <>
                <Zap color="#F5F5F5" size={20} />
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: "Poppins_700Bold",
                    color: "#F5F5F5",
                    marginLeft: 8,
                  }}
                >
                  {selectedPlan === "monthly"
                    ? t("startFreeTrial")
                    : t("startPremium")}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRestore}
          style={{
            padding: 12,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#FF6B00",
            }}
          >
            {t("restorePurchases")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: "#9BA4B5",
            }}
          >
            {t("continueWithFree")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
