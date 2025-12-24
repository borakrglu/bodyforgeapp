import { View, Text } from "react-native";
import { COLORS } from "@/constants/colors";

export function UserDetailsCard({ profileData, t }) {
  if (!profileData) return null;

  const measurements = [
    { label: t("arms"), value: profileData.measurement_arms_cm },
    { label: t("chest"), value: profileData.measurement_chest_cm },
    { label: t("waist"), value: profileData.measurement_waist_cm },
    { label: t("legs"), value: profileData.measurement_legs_cm },
  ];

  return (
    <View
      style={{
        backgroundColor: COLORS.forgedSteel,
        borderRadius: 18,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.ironGrey,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: "#fff",
          marginBottom: 16,
          letterSpacing: 0.5,
        }}
      >
        {t("details")}
      </Text>

      <View style={{ gap: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: COLORS.steelSilver,
              fontWeight: "600",
            }}
          >
            {t("age")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#fff",
              fontWeight: "700",
            }}
          >
            {profileData.age || "-"}
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: COLORS.ironGrey }} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: COLORS.steelSilver,
              fontWeight: "600",
            }}
          >
            {t("height")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#fff",
              fontWeight: "700",
            }}
          >
            {profileData.height_cm || "-"} cm
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: COLORS.ironGrey }} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: COLORS.steelSilver,
              fontWeight: "600",
            }}
          >
            {t("experience")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#fff",
              fontWeight: "700",
              textTransform: "capitalize",
            }}
          >
            {profileData.experience_level || "-"}
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: COLORS.ironGrey }} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: COLORS.steelSilver,
              fontWeight: "600",
            }}
          >
            {t("trainingFreq")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#fff",
              fontWeight: "700",
            }}
          >
            {profileData.training_frequency || "-"} {t("days")}/
            {t("week") || "week"}
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: COLORS.ironGrey }} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: COLORS.steelSilver,
              fontWeight: "600",
            }}
          >
            {t("goal")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#fff",
              fontWeight: "700",
              textTransform: "capitalize",
            }}
          >
            {profileData.primary_goal || "-"}
          </Text>
        </View>

        {/* Measurements Section */}
        <View style={{ marginTop: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: COLORS.forgeOrange,
              marginBottom: 8,
            }}
          >
            {t("measurements")}
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {measurements.map(
              (m, idx) =>
                m.value && (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: COLORS.ironGrey,
                      padding: 8,
                      borderRadius: 8,
                      minWidth: "45%",
                    }}
                  >
                    <Text style={{ color: COLORS.steelSilver, fontSize: 12 }}>
                      {m.label}
                    </Text>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      {m.value} cm
                    </Text>
                  </View>
                ),
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
