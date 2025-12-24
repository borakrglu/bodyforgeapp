import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
} from "lucide-react-native";
import { useUser } from "../../utils/auth/useUser";
import { useLanguage } from "../../utils/i18n";

const COLORS = {
  forgeOrange: "#FF6A1A",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
};

export default function QuestionnairePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Goals
    primary_goal: "",
    target_weight: "",
    timeline_weeks: "",

    // Step 2: Body
    gender: "",
    age: "",
    height_cm: "",
    weight_kg: "",
    body_fat_percentage: "",

    // Step 3: Measurements
    measurement_arms_cm: "",
    measurement_chest_cm: "",
    measurement_waist_cm: "",
    measurement_legs_cm: "",

    // Step 4: Training
    experience_level: "",
    training_frequency: "",
    training_location: "",
    preferred_training_style: "",

    // Step 5: Health & Diet
    injuries_limitations: [],
    diet_restrictions: [],
    supplement_history: "",
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMultiSelect = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert(t("signInToForge"));
      router.push("/auth");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: user.email,
          id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create profile");
      }

      // Redirect to program generation instead of home
      router.replace(`/generate-programs?userId=${user.id}`);
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (field, value, label, isMulti = false) => {
    const isSelected = isMulti
      ? formData[field].includes(value)
      : formData[field] === value;

    return (
      <TouchableOpacity
        key={value}
        onPress={() =>
          isMulti ? toggleMultiSelect(field, value) : updateField(field, value)
        }
        style={{
          backgroundColor: isSelected ? COLORS.forgeOrange : COLORS.forgedSteel,
          borderWidth: 1,
          borderColor: isSelected ? COLORS.forgeOrange : COLORS.ironGrey,
          borderRadius: 12,
          padding: 16,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            color: isSelected ? "#fff" : COLORS.steelSilver,
            fontSize: 15,
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
        {isSelected && <Check color="#fff" size={18} />}
      </TouchableOpacity>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>{t("goal")}</Text>
            <Text style={styles.stepSubtitle}>{t("letsStart")}</Text>

            {[
              { id: "muscleGain", label: t("muscleGain") },
              { id: "fatLoss", label: t("fatLoss") },
              { id: "strength", label: t("strength") },
              { id: "recomp", label: t("recomp") },
            ].map((g) => renderOption("primary_goal", g.id, g.label))}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>{t("targetWeight")}</Text>
                <TextInput
                  value={formData.target_weight}
                  onChangeText={(val) => updateField("target_weight", val)}
                  placeholder="70"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>{t("timeline")}</Text>
                <TextInput
                  value={formData.timeline_weeks}
                  onChangeText={(val) => updateField("timeline_weeks", val)}
                  placeholder="12"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>{t("yourStats")}</Text>
            <Text style={styles.stepSubtitle}>{t("details")}</Text>

            <Text style={styles.inputLabel}>{t("gender")}</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
              {["male", "female"].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => updateField("gender", g)}
                  style={[
                    styles.chip,
                    formData.gender === g && styles.activeChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.gender === g && styles.activeChipText,
                    ]}
                  >
                    {t(g)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>{t("age")}</Text>
                <TextInput
                  value={formData.age}
                  onChangeText={(val) => updateField("age", val)}
                  placeholder="25"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>{t("height")}</Text>
                <TextInput
                  value={formData.height_cm}
                  onChangeText={(val) => updateField("height_cm", val)}
                  placeholder="175"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>{t("weight")}</Text>
                <TextInput
                  value={formData.weight_kg}
                  onChangeText={(val) => updateField("weight_kg", val)}
                  placeholder="75"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>{t("bodyFat")}</Text>
                <TextInput
                  value={formData.body_fat_percentage}
                  onChangeText={(val) =>
                    updateField("body_fat_percentage", val)
                  }
                  placeholder="15%"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>{t("measurements")}</Text>
            <Text style={styles.stepSubtitle}>{t("details")}</Text>

            <View style={{ gap: 12 }}>
              <View>
                <Text style={styles.inputLabel}>{t("arms")}</Text>
                <TextInput
                  value={formData.measurement_arms_cm}
                  onChangeText={(val) =>
                    updateField("measurement_arms_cm", val)
                  }
                  placeholder="35"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View>
                <Text style={styles.inputLabel}>{t("chest")}</Text>
                <TextInput
                  value={formData.measurement_chest_cm}
                  onChangeText={(val) =>
                    updateField("measurement_chest_cm", val)
                  }
                  placeholder="100"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View>
                <Text style={styles.inputLabel}>{t("waist")}</Text>
                <TextInput
                  value={formData.measurement_waist_cm}
                  onChangeText={(val) =>
                    updateField("measurement_waist_cm", val)
                  }
                  placeholder="85"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View>
                <Text style={styles.inputLabel}>{t("legs")}</Text>
                <TextInput
                  value={formData.measurement_legs_cm}
                  onChangeText={(val) =>
                    updateField("measurement_legs_cm", val)
                  }
                  placeholder="60"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>{t("training")}</Text>
            <Text style={styles.stepSubtitle}>{t("trainingExperience")}</Text>

            {[
              { id: "beginner", label: t("beginner") },
              { id: "intermediate", label: t("intermediate") },
              { id: "advanced", label: t("advanced") },
            ].map((e) => renderOption("experience_level", e.id, e.label))}

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>
              {t("trainingFrequency")}
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {[2, 3, 4, 5, 6, 7].map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() =>
                    updateField("training_frequency", d.toString())
                  }
                  style={[
                    styles.circleOption,
                    formData.training_frequency === d.toString() &&
                      styles.activeCircleOption,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleOptionText,
                      formData.training_frequency === d.toString() &&
                        styles.activeCircleOptionText,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>
              {t("trainingLocation")}
            </Text>
            {["gym", "home", "both"].map((l) =>
              renderOption("training_location", l, t(l)),
            )}
          </View>
        );
      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>{t("health")}</Text>
            <Text style={styles.stepSubtitle}>{t("dietRestrictions")}</Text>

            <Text style={styles.inputLabel}>{t("injuries")}</Text>
            {["Back", "Shoulder", "Knee", "None"].map((i) =>
              renderOption("injuries_limitations", i, i, true),
            )}

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>
              {t("supplementLevel")}
            </Text>
            {["none", "basic", "advanced_supp"].map((s) =>
              renderOption("supplement_history", s, t(s)),
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.ironGrey,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {step > 1 && (
            <TouchableOpacity
              onPress={() => setStep(step - 1)}
              style={{ marginRight: 12 }}
            >
              <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
          )}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "900",
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            {t("step")} {step} {t("of")} 5
          </Text>
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 4,
            backgroundColor: COLORS.ironGrey,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${(step / 5) * 100}%`,
              height: "100%",
              backgroundColor: COLORS.forgeOrange,
            }}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Bottom buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: COLORS.carbonBlack,
          borderTopWidth: 1,
          borderTopColor: COLORS.ironGrey,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        {step < 5 ? (
          <TouchableOpacity
            onPress={() => setStep(step + 1)}
            style={{
              backgroundColor: COLORS.forgeOrange,
              borderRadius: 16,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                color: "#fff",
                marginRight: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {t("continue")}
            </Text>
            <ChevronRight color="#fff" size={20} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: COLORS.forgeOrange,
              borderRadius: 16,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Sparkles color="#fff" size={20} style={{ marginRight: 8 }} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "900",
                    color: "#fff",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {t("forgeMyPlan")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = {
  stepTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  stepSubtitle: {
    fontSize: 15,
    color: COLORS.steelSilver,
    marginBottom: 24,
    fontWeight: "500",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.steelSilver,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.forgedSteel,
    borderWidth: 1,
    borderColor: COLORS.ironGrey,
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.forgedSteel,
    borderWidth: 1,
    borderColor: COLORS.ironGrey,
  },
  activeChip: {
    backgroundColor: COLORS.forgeOrange,
    borderColor: COLORS.forgeOrange,
  },
  chipText: {
    color: COLORS.steelSilver,
    fontWeight: "700",
    fontSize: 14,
  },
  activeChipText: {
    color: "#fff",
  },
  circleOption: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.forgedSteel,
    borderWidth: 1,
    borderColor: COLORS.ironGrey,
    justifyContent: "center",
    alignItems: "center",
  },
  activeCircleOption: {
    backgroundColor: COLORS.forgeOrange,
    borderColor: COLORS.forgeOrange,
  },
  circleOptionText: {
    color: COLORS.steelSilver,
    fontWeight: "700",
    fontSize: 14,
  },
  activeCircleOptionText: {
    color: "#fff",
  },
};
