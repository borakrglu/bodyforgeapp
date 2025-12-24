import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Users,
  Star,
  Award,
  Crown,
  X,
  Check,
  ExternalLink,
} from "lucide-react-native";
import { useState, useEffect } from "react";
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
import { useUser } from "../../utils/auth/useUser";
import usePTPayment from "../../utils/use-pt-payment";
import useLanguage from "../../utils/i18n";

// BodyForge Color Palette
const COLORS = {
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
  gold: "#FFD700",
};

export default function CoachingPage() {
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const [coaches, setCoaches] = useState([]);
  const [selectedTier, setSelectedTier] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const { user } = useUser();
  const {
    loading: paymentLoading,
    getAvailablePlans,
    initiatePTCheckout,
  } = usePTPayment();

  const [loaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    loadCoaches();
  }, [selectedTier]);

  const loadCoaches = async () => {
    try {
      const url =
        selectedTier === "all"
          ? "/api/coaches"
          : `/api/coaches?tier=${selectedTier}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCoaches(data.coaches || []);
      }
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookCoach = async (coach) => {
    setSelectedCoach(coach);
    setShowBookModal(true);
  };

  const handlePTCheckout = async (planId) => {
    if (!user?.id) {
      alert(
        language === "tr"
          ? "Devam etmek için lütfen giriş yapın"
          : "Please sign in to continue",
      );
      return;
    }

    const result = await initiatePTCheckout(
      planId,
      user.id,
      selectedCoach.id,
      user.country_code || "TR",
    );

    if (result.success) {
      setShowBookModal(false);
      // User will complete payment in browser
    } else {
      alert(
        language === "tr"
          ? "Ödeme başlatılamadı. Lütfen tekrar deneyin."
          : "Failed to initiate checkout. Please try again.",
      );
    }
  };

  if (!loaded) {
    return null;
  }

  const getTierColor = (tier) => {
    if (tier === "Elite") return COLORS.gold;
    if (tier === "Pro") return COLORS.forgeOrange;
    return COLORS.steelSilver;
  };

  const getTierIcon = (tier) => {
    if (tier === "premium") return Crown;
    if (tier === "elite") return Award;
    return Star;
  };

  const tiers = [
    { id: "all", label: t("allCoaches") },
    { id: "basic", label: "Basic" },
    { id: "premium", label: "Premium" },
    { id: "elite", label: "Elite" },
  ];

  // Get PT plans based on user's country
  const ptPlans = getAvailablePlans(user?.country_code || "TR");
  const isTurkey = (user?.country_code || "TR") === "TR";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      {/* Header - Forge Style */}
      <View
        style={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: COLORS.carbonBlack,
          borderBottomWidth: 2,
          borderBottomColor: COLORS.ironGrey,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.moltenEmber,
              borderRadius: 12,
              padding: 10,
              marginRight: 14,
              borderWidth: 1,
              borderColor: COLORS.forgeOrange,
            }}
          >
            <Users color="#fff" size={26} strokeWidth={2.5} />
          </View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "900",
              color: "#fff",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t("coaching")}
          </Text>
        </View>
        <View
          style={{
            width: 60,
            height: 3,
            backgroundColor: COLORS.forgeOrange,
            marginLeft: 60,
            borderRadius: 2,
          }}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {loading ? (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <ActivityIndicator size="large" color="#FF6B00" />
            </View>
          ) : coaches.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Users color="#FF6B00" size={48} />
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Poppins_600SemiBold",
                  color: "#F5F5F5",
                  marginTop: 16,
                }}
              >
                {t("noCoachesAvailable")}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#9BA4B5",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {t("checkBackSoon")}
              </Text>
            </View>
          ) : (
            coaches.map((coach) => {
              const TierIcon = getTierIcon(coach.tier);
              return (
                <View
                  key={coach.id}
                  style={{
                    backgroundColor: "#10131A",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: getTierColor(coach.tier),
                        borderRadius: 30,
                        width: 60,
                        height: 60,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      <Users color="#F5F5F5" size={30} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: "Poppins_700Bold",
                          color: "#F5F5F5",
                          marginBottom: 4,
                        }}
                      >
                        {coach.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <TierIcon color={getTierColor(coach.tier)} size={14} />
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "Inter_600SemiBold",
                            color: getTierColor(coach.tier),
                            marginLeft: 4,
                            textTransform: "capitalize",
                          }}
                        >
                          {coach.tier} {t("tier")}
                        </Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Star color="#FF6B00" size={14} fill="#FF6B00" />
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "Inter_500Medium",
                            color: "#9BA4B5",
                            marginLeft: 4,
                          }}
                        >
                          {coach.rating} / 5.0
                        </Text>
                      </View>
                    </View>
                  </View>

                  {coach.bio && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: "#9BA4B5",
                        lineHeight: 20,
                        marginBottom: 12,
                      }}
                    >
                      {coach.bio}
                    </Text>
                  )}

                  {coach.specialization && coach.specialization.length > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      {coach.specialization.map((spec, index) => (
                        <View
                          key={index}
                          style={{
                            backgroundColor: "rgba(255, 107, 0, 0.1)",
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "rgba(255, 107, 0, 0.2)",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontFamily: "Inter_500Medium",
                              color: "#FF6B00",
                            }}
                          >
                            {spec}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => handleBookCoach(coach)}
                    style={{
                      backgroundColor: getTierColor(coach.tier),
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Poppins_700Bold",
                        color: "#F5F5F5",
                      }}
                    >
                      {t("bookNow")}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* PT Payment Modal */}
      <Modal
        visible={showBookModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(5, 6, 8, 0.95)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#10131A",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 24,
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 20,
              borderTopWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: "Poppins_700Bold",
                  color: "#F5F5F5",
                }}
              >
                {t("confirmBooking")}
              </Text>
              <TouchableOpacity onPress={() => setShowBookModal(false)}>
                <X color="#9BA4B5" size={24} />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#9BA4B5",
                marginBottom: 20,
              }}
            >
              {language === "tr" ? "Koç:" : "Coach:"} {selectedCoach?.name}
            </Text>

            <ScrollView
              style={{ maxHeight: 400 }}
              showsVerticalScrollIndicator={false}
            >
              {Object.entries(ptPlans).map(([planId, plan]) => (
                <TouchableOpacity
                  key={planId}
                  onPress={() => handlePTCheckout(planId)}
                  disabled={paymentLoading}
                  style={{
                    backgroundColor: "#050608",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    opacity: paymentLoading ? 0.6 : 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Poppins_700Bold",
                        color: "#F5F5F5",
                      }}
                    >
                      {plan.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: "Poppins_700Bold",
                        color: "#FF6B00",
                      }}
                    >
                      {plan.price}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Inter_400Regular",
                        color: "#9BA4B5",
                        textTransform: "capitalize",
                      }}
                    >
                      {plan.type}
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_500Medium",
                          color: "#6B7280",
                          marginRight: 4,
                        }}
                      >
                        {isTurkey ? "iyzico" : "Paddle"}
                      </Text>
                      <ExternalLink color="#6B7280" size={12} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
                textAlign: "center",
                marginTop: 16,
                lineHeight: 18,
              }}
            >
              {language === "tr"
                ? "Ödeme güvenli şekilde alınacaktır.\nAbonelik iptalini istediğiniz zaman yapabilirsiniz."
                : "Payment will be processed securely.\nYou can cancel your subscription at any time."}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
