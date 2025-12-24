import { View, Text, TouchableOpacity } from "react-native";
import { Crown, Zap } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export function PremiumStatusCard({ isPremium, t, onUpgrade }) {
  return (
    <View
      style={{
        backgroundColor: COLORS.forgedSteel,
        borderRadius: 18,
        padding: 20,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: isPremium ? COLORS.gold : COLORS.ironGrey,
        borderTopWidth: 4,
        borderTopColor: isPremium ? COLORS.gold : COLORS.forgeOrange,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {isPremium ? (
          <Crown
            color={COLORS.gold}
            size={24}
            fill={COLORS.gold}
            strokeWidth={2.5}
          />
        ) : (
          <Zap color={COLORS.forgeOrange} size={24} strokeWidth={2.5} />
        )}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: isPremium ? COLORS.gold : COLORS.steelSilver,
            marginLeft: 10,
            letterSpacing: 0.5,
          }}
        >
          {isPremium ? t("premiumMember") : t("freeMember")}
        </Text>
      </View>
      {!isPremium && (
        <TouchableOpacity
          onPress={onUpgrade}
          style={{
            backgroundColor: COLORS.moltenEmber,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: COLORS.forgeOrange,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "800",
              color: "#fff",
              letterSpacing: 0.5,
            }}
          >
            {t("upgradeToPremium")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
