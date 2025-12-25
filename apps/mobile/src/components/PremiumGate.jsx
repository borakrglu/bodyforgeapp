import { View, Text, TouchableOpacity } from "react-native";
import { Lock, Crown, Zap } from "lucide-react-native";
import { useRouter } from "expo-router";
import usePremium from "../utils/use-premium";
import useLanguage from "../utils/i18n";

const COLORS = {
  forgeOrange: "#FF6A1A",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
};

/**
 * PremiumGate - Wraps content that requires premium subscription
 * 
 * Usage:
 * <PremiumGate feature="ai_workout_generation">
 *   <YourPremiumContent />
 * </PremiumGate>
 * 
 * Or with limit check:
 * <PremiumGate limitType="workoutGenerations">
 *   <YourLimitedContent />
 * </PremiumGate>
 */
export function PremiumGate({ 
  children, 
  feature, 
  limitType,
  title,
  description,
  showUpgradeButton = true,
  compact = false,
  style,
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const { isPremium, hasFeature, hasReachedLimit, getRemainingUses, loading } = usePremium();

  // Check if content should be shown
  const shouldShowContent = () => {
    if (loading) return false;
    if (isPremium) return true;
    if (feature && !hasFeature(feature)) return false;
    if (limitType && hasReachedLimit(limitType)) return false;
    return true;
  };

  if (shouldShowContent()) {
    return children;
  }

  // Show locked state
  const remaining = limitType ? getRemainingUses(limitType) : 0;
  const isLimitReached = limitType && remaining === 0;

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => router.push("/premium")}
        style={[{
          backgroundColor: COLORS.forgedSteel,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: COLORS.forgeOrange,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }, style]}
      >
        <View style={{
          backgroundColor: `${COLORS.forgeOrange}20`,
          borderRadius: 8,
          padding: 8,
        }}>
          <Lock color={COLORS.forgeOrange} size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
            {title || t("premiumFeature")}
          </Text>
          <Text style={{ color: COLORS.steelSilver, fontSize: 12, marginTop: 2 }}>
            {t("upgradeToUnlock")}
          </Text>
        </View>
        <Crown color={COLORS.forgeOrange} size={20} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[{
      backgroundColor: COLORS.forgedSteel,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORS.ironGrey,
    }, style]}>
      <View style={{
        backgroundColor: `${COLORS.forgeOrange}20`,
        borderRadius: 50,
        padding: 16,
        marginBottom: 16,
      }}>
        <Lock color={COLORS.forgeOrange} size={32} />
      </View>

      <Text style={{
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
      }}>
        {title || (isLimitReached ? t("limitReached") : t("premiumFeature"))}
      </Text>

      <Text style={{
        color: COLORS.steelSilver,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
        paddingHorizontal: 10,
      }}>
        {description || (isLimitReached 
          ? t("upgradeLimitMessage") 
          : t("upgradeFeatureMessage"))}
      </Text>

      {showUpgradeButton && (
        <TouchableOpacity
          onPress={() => router.push("/premium")}
          style={{
            backgroundColor: COLORS.forgeOrange,
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Zap color="#fff" size={18} />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            {t("upgradeToPremium")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * PremiumBadge - Shows premium status indicator
 */
export function PremiumBadge({ size = "medium" }) {
  const { isPremium } = usePremium();
  
  if (!isPremium) return null;

  const sizes = {
    small: { padding: 4, iconSize: 12, fontSize: 10 },
    medium: { padding: 6, iconSize: 14, fontSize: 12 },
    large: { padding: 8, iconSize: 18, fontSize: 14 },
  };

  const s = sizes[size];

  return (
    <View style={{
      backgroundColor: COLORS.forgeOrange,
      borderRadius: 20,
      paddingVertical: s.padding,
      paddingHorizontal: s.padding * 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    }}>
      <Crown color="#fff" size={s.iconSize} />
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: s.fontSize }}>
        PRO
      </Text>
    </View>
  );
}

/**
 * UsageIndicator - Shows remaining uses for a limited feature
 */
export function UsageIndicator({ limitType, showWhenUnlimited = false }) {
  const { t } = useLanguage();
  const { isPremium, getRemainingUses } = usePremium();
  const remaining = getRemainingUses(limitType);

  if (isPremium && !showWhenUnlimited) return null;
  if (remaining === -1 && !showWhenUnlimited) return null;

  return (
    <View style={{
      backgroundColor: remaining === 0 ? "#ef444420" : `${COLORS.forgeOrange}20`,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    }}>
      {remaining === -1 ? (
        <>
          <Zap color={COLORS.forgeOrange} size={14} />
          <Text style={{ color: COLORS.forgeOrange, fontSize: 12, fontWeight: "600" }}>
            {t("unlimited")}
          </Text>
        </>
      ) : (
        <Text style={{ 
          color: remaining === 0 ? "#ef4444" : COLORS.forgeOrange, 
          fontSize: 12, 
          fontWeight: "600" 
        }}>
          {remaining} {t("remaining")}
        </Text>
      )}
    </View>
  );
}

export default PremiumGate;
