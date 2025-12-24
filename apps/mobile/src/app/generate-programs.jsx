import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Sparkles, Dumbbell, UtensilsCrossed, Pill } from "lucide-react-native";

// BodyForge Color Palette
const COLORS = {
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
};

export default function GenerateProgramsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  const [generating, setGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("workout");
  const [error, setError] = useState(null);

  useEffect(() => {
    generateAllPrograms();
  }, []);

  const generateAllPrograms = async () => {
    try {
      // Generate workout program
      setCurrentStep("workout");
      setProgress(33);

      const workoutRes = await fetch("/api/programs/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!workoutRes.ok) throw new Error("Failed to generate workout");

      // Generate meal plan
      setCurrentStep("meal");
      setProgress(66);

      const mealRes = await fetch("/api/programs/generate-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!mealRes.ok) throw new Error("Failed to generate meal plan");

      // Generate supplement plan
      setCurrentStep("supplement");
      setProgress(100);

      const suppRes = await fetch("/api/programs/generate-supplement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!suppRes.ok) throw new Error("Failed to generate supplement plan");

      // All done!
      setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 1000);
    } catch (err) {
      console.error("Error generating programs:", err);
      setError(err.message);
      setGenerating(false);
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case "workout":
        return (
          <Dumbbell color={COLORS.forgeOrange} size={48} strokeWidth={2.5} />
        );
      case "meal":
        return (
          <UtensilsCrossed
            color={COLORS.forgeOrange}
            size={48}
            strokeWidth={2.5}
          />
        );
      case "supplement":
        return <Pill color={COLORS.forgeOrange} size={48} strokeWidth={2.5} />;
      default:
        return (
          <Sparkles color={COLORS.forgeOrange} size={48} strokeWidth={2.5} />
        );
    }
  };

  const getStepText = () => {
    switch (currentStep) {
      case "workout":
        return "Creating your workout program...";
      case "meal":
        return "Designing your meal plan...";
      case "supplement":
        return "Building your supplement stack...";
      default:
        return "Preparing...";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 40,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {error ? (
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: COLORS.moltenEmber,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Generation Failed
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: COLORS.steelSilver,
                textAlign: "center",
                marginBottom: 24,
                fontWeight: "600",
              }}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/home")}
              style={{
                backgroundColor: COLORS.moltenEmber,
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: COLORS.forgeOrange,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "900",
                  color: "#fff",
                  letterSpacing: 1,
                }}
              >
                GO HOME
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: "center", width: "100%" }}>
            {/* Icon */}
            <View
              style={{
                backgroundColor: COLORS.forgedSteel,
                borderRadius: 30,
                padding: 32,
                marginBottom: 40,
                borderWidth: 2,
                borderColor: COLORS.ironGrey,
                shadowColor: COLORS.forgeOrange,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
              }}
            >
              {getStepIcon()}
            </View>

            {/* Text */}
            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: "#fff",
                marginBottom: 12,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              FORGING YOUR PLAN
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: COLORS.steelSilver,
                marginBottom: 48,
                textAlign: "center",
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              {getStepText()}
            </Text>

            {/* Progress bar */}
            <View style={{ width: "100%", maxWidth: 320 }}>
              <View
                style={{
                  height: 10,
                  backgroundColor: COLORS.ironGrey,
                  borderRadius: 5,
                  overflow: "hidden",
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: COLORS.carbonBlack,
                }}
              >
                <View
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    backgroundColor: COLORS.forgeOrange,
                    shadowColor: COLORS.moltenEmber,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 6,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.orangeRimLight,
                  textAlign: "center",
                  fontWeight: "800",
                }}
              >
                {progress}% COMPLETE
              </Text>
            </View>

            {/* Spinner */}
            <ActivityIndicator
              size="large"
              color={COLORS.forgeOrange}
              style={{ marginTop: 48 }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
