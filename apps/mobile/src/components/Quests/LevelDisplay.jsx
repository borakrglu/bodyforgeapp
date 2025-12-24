import { View, Text } from "react-native";
import { Award, Zap } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export function LevelDisplay({
  levelProgress,
  levelColor,
  levelTitle,
  language,
}) {
  return (
    <View
      style={{
        backgroundColor: COLORS.forgedSteel,
        borderRadius: 18,
        padding: 20,
        marginBottom: 28,
        borderWidth: 2,
        borderColor: levelColor,
        borderTopWidth: 4,
      }}
    >
      {/* Level & Title */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: levelColor + "33",
              borderRadius: 12,
              padding: 10,
              borderWidth: 2,
              borderColor: levelColor,
            }}
          >
            <Award color={levelColor} size={24} strokeWidth={2.5} />
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              LEVEL {levelProgress.currentLevel}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: levelColor,
                marginTop: 2,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {levelTitle}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.gold + "22",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: COLORS.gold,
            }}
          >
            <Zap color={COLORS.gold} size={16} strokeWidth={2.5} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                color: COLORS.gold,
                marginLeft: 6,
              }}
            >
              {levelProgress.totalXP.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: COLORS.steelSilver,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {language === "tr" ? "Seviye İlerlemesi" : "Level Progress"}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#fff",
            }}
          >
            {levelProgress.progressXP.toLocaleString()} /{" "}
            {levelProgress.requiredXP.toLocaleString()} XP
          </Text>
        </View>
        <View
          style={{
            backgroundColor: COLORS.ironGrey,
            borderRadius: 8,
            height: 12,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: COLORS.steelSilver + "33",
          }}
        >
          <View
            style={{
              backgroundColor: levelColor,
              height: "100%",
              width: `${levelProgress.progressPercent}%`,
              borderRadius: 8,
            }}
          />
        </View>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: COLORS.steelSilver,
            marginTop: 6,
            textAlign: "center",
          }}
        >
          {Math.round(levelProgress.progressPercent)}% to Level{" "}
          {levelProgress.currentLevel + 1}
        </Text>
      </View>
    </View>
  );
}
