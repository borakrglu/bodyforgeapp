import { View, Text, TouchableOpacity } from "react-native";
import { CheckCircle2, Zap } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export function QuestItem({ quest, questType, onComplete, t, language }) {
  const isDaily = questType === "daily";
  const primaryColor = isDaily ? "#3b82f6" : "#f59e0b";
  const completedColor = isDaily ? "#10b981" : COLORS.forgeOrange;

  return (
    <View
      style={{
        backgroundColor: quest.is_completed
          ? COLORS.forgedSteel
          : COLORS.carbonBlack,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: quest.is_completed ? completedColor : COLORS.ironGrey,
        borderLeftWidth: quest.is_completed ? 4 : 1,
        borderLeftColor: quest.is_completed ? completedColor : COLORS.ironGrey,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {quest.is_completed ? (
          <CheckCircle2 color={completedColor} size={24} strokeWidth={2.5} />
        ) : (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: primaryColor,
            }}
          />
        )}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#fff",
            marginLeft: 12,
            flex: 1,
            textDecorationLine: quest.is_completed ? "line-through" : "none",
            opacity: quest.is_completed ? 0.7 : 1,
          }}
        >
          {quest.quest_description}
        </Text>
      </View>

      {/* Progress bar for weekly quests */}
      {!isDaily && quest.target_value && (
        <View style={{ marginVertical: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: COLORS.steelSilver,
                textTransform: "uppercase",
              }}
            >
              {language === "tr" ? "İlerleme" : "Progress"}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#fff",
              }}
            >
              {quest.current_value}/{quest.target_value}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: COLORS.ironGrey,
              borderRadius: 6,
              height: 8,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: COLORS.steelSilver + "33",
            }}
          >
            <View
              style={{
                backgroundColor: quest.is_completed
                  ? COLORS.forgeOrange
                  : COLORS.forgeOrange,
                height: "100%",
                width: `${Math.min((quest.current_value / quest.target_value) * 100, 100)}%`,
              }}
            />
          </View>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: !isDaily && quest.target_value ? 0 : 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Zap color="#fbbf24" size={16} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#fbbf24",
              marginLeft: 6,
            }}
          >
            +{quest.xp_reward} XP
          </Text>
        </View>
        {!quest.is_completed &&
          (isDaily || quest.current_value >= quest.target_value) && (
            <TouchableOpacity
              onPress={() => onComplete(quest.id, questType)}
              style={{
                backgroundColor: isDaily ? "#3b82f6" : COLORS.forgeOrange,
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: isDaily ? "#60a5fa" : COLORS.orangeRimLight,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                {t("completeQuest")}
              </Text>
            </TouchableOpacity>
          )}
      </View>
    </View>
  );
}
