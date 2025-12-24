import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../utils/auth/useAuth";
import { Mail, Apple, Chrome, UserCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useLanguage from "../../utils/i18n";

const COLORS = {
  forgeOrange: "#FF6A1A",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
};

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp, isReady } = useAuth();
  const { t, language } = useLanguage(); // Destructure language here
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContinueAsGuest = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem("isGuest", "true");
      // Small delay to ensure storage is written
      setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 100);
    } catch (error) {
      console.error("Guest error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (mode) => {
    if (!isReady) return;
    if (mode === "signup") {
      signUp();
    } else {
      signIn();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      <View
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 30 }}
      >
        <View style={{ alignItems: "center", marginBottom: 60 }}>
          <Text
            style={{
              fontSize: 48,
              fontWeight: "900",
              color: "#fff",
              letterSpacing: -2,
            }}
          >
            BODY<Text style={{ color: COLORS.forgeOrange }}>FORGE</Text>
          </Text>
          <View
            style={{
              width: 60,
              height: 4,
              backgroundColor: COLORS.forgeOrange,
              marginTop: 4,
            }}
          />
          <Text
            style={{
              color: COLORS.steelSilver,
              marginTop: 12,
              fontWeight: "600",
              letterSpacing: 1,
            }}
          >
            {t("brandStatement")}
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          {/* Google Sign In */}
          <TouchableOpacity
            onPress={() => handleAuth("signin")}
            style={styles.authButton}
            disabled={!isReady}
          >
            <Chrome color="#fff" size={24} />
            <Text style={styles.authButtonText}>{t("continueWithGoogle")}</Text>
          </TouchableOpacity>

          {/* Apple Sign In */}
          <TouchableOpacity
            onPress={() => handleAuth("signin")}
            style={styles.authButton}
            disabled={!isReady}
          >
            <Apple color="#fff" size={24} />
            <Text style={styles.authButtonText}>{t("continueWithApple")}</Text>
          </TouchableOpacity>

          {/* Email Sign In */}
          <TouchableOpacity
            onPress={() => handleAuth("signin")}
            style={[
              styles.authButton,
              {
                backgroundColor: COLORS.forgeOrange,
                borderColor: COLORS.forgeOrange,
              },
            ]}
            disabled={!isReady}
          >
            <Mail color="#fff" size={24} />
            <Text style={styles.authButtonText}>{t("continueWithEmail")}</Text>
          </TouchableOpacity>

          {/* Continue as Guest */}
          <TouchableOpacity
            onPress={handleContinueAsGuest}
            style={[
              styles.authButton,
              {
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: COLORS.ironGrey,
              },
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.steelSilver} />
            ) : (
              <>
                <UserCircle color={COLORS.steelSilver} size={24} />
                <Text
                  style={[styles.authButtonText, { color: COLORS.steelSilver }]}
                >
                  {t("continueWithFree")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 40, alignItems: "center" }}>
          <TouchableOpacity onPress={() => handleAuth("signup")}>
            <Text style={{ color: COLORS.steelSilver, fontSize: 14 }}>
              {t("dontHaveAccount")}
              <Text style={{ color: COLORS.forgeOrange, fontWeight: "700" }}>
                {t("signUp")}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingBottom: insets.bottom + 20, alignItems: "center" }}>
        <Text
          style={{
            color: COLORS.ironGrey,
            fontSize: 12,
            textAlign: "center",
            paddingHorizontal: 20,
          }}
        >
          {t("termsPrivacy")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.forgedSteel,
    borderWidth: 1,
    borderColor: COLORS.ironGrey,
    borderRadius: 16,
    paddingVertical: 18,
    gap: 12,
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
