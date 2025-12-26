import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../utils/auth/useAuth";
import { Mail, Lock, UserCircle, Eye, EyeOff, User } from "lucide-react-native";
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

// Mock credentials for Expo Go testing
const MOCK_EMAIL = "test@test.com";
const MOCK_PASSWORD = "password123";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [mode, setMode] = useState("signin"); // signin or signup
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleContinueAsGuest = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem("isGuest", "true");
      setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 100);
    } catch (error) {
      console.error("Guest error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (mode === "signup" && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      // Mock authentication for Expo Go testing
      // In production, replace this with actual API calls

      if (mode === "signup") {
        // Mock signup - always succeeds
        const mockUser = {
          id: `user-${Date.now()}`,
          email: email.toLowerCase(),
          name: name,
          createdAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem("mockUser", JSON.stringify(mockUser));
        setAuth({ jwt: "mock-jwt-token", user: mockUser });
        router.replace("/(tabs)/home");
      } else {
        // Mock signin - check credentials
        if (email.toLowerCase() === MOCK_EMAIL && password === MOCK_PASSWORD) {
          const mockUser = {
            id: "mock-user-1",
            email: MOCK_EMAIL,
            name: "Test User",
            createdAt: new Date().toISOString(),
          };

          await AsyncStorage.setItem("mockUser", JSON.stringify(mockUser));
          setAuth({ jwt: "mock-jwt-token", user: mockUser });
          router.replace("/(tabs)/home");
        } else {
          // Check if user signed up before
          const storedUser = await AsyncStorage.getItem("mockUser");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.email === email.toLowerCase()) {
              // For mock purposes, accept any password for registered users
              setAuth({ jwt: "mock-jwt-token", user: userData });
              router.replace("/(tabs)/home");
              return;
            }
          }
          Alert.alert("Error", "Invalid credentials. Use test@test.com / password123");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 30 }}>
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Text style={{ fontSize: 48, fontWeight: "900", color: "#fff", letterSpacing: -2 }}>
              BODY<Text style={{ color: COLORS.forgeOrange }}>FORGE</Text>
            </Text>
            <View style={{ width: 60, height: 4, backgroundColor: COLORS.forgeOrange, marginTop: 4 }} />
            <Text style={{ color: COLORS.steelSilver, marginTop: 12, fontWeight: "600", letterSpacing: 1 }}>
              {t("brandStatement")}
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 16 }}>
            {mode === "signup" && (
              <View style={styles.inputContainer}>
                <User color={COLORS.steelSilver} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor={COLORS.ironGrey}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Mail color={COLORS.steelSilver} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.ironGrey}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color={COLORS.steelSilver} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.ironGrey}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color={COLORS.steelSilver} size={20} />
                ) : (
                  <Eye color={COLORS.steelSilver} size={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleEmailAuth}
              style={[styles.authButton, { backgroundColor: COLORS.forgeOrange, borderColor: COLORS.forgeOrange }]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.authButtonText}>
                  {mode === "signup" ? t("signUp") : t("signIn")}
                </Text>
              )}
            </TouchableOpacity>

            {/* Guest Button */}
            <TouchableOpacity
              onPress={handleContinueAsGuest}
              style={[styles.authButton, { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.ironGrey }]}
              disabled={loading}
            >
              <UserCircle color={COLORS.steelSilver} size={24} />
              <Text style={[styles.authButtonText, { color: COLORS.steelSilver }]}>
                {t("continueWithFree")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Mode */}
          <View style={{ marginTop: 30, alignItems: "center" }}>
            <TouchableOpacity onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
              <Text style={{ color: COLORS.steelSilver, fontSize: 14 }}>
                {mode === "signin" ? t("dontHaveAccount") : "Already have an account? "}
                <Text style={{ color: COLORS.forgeOrange, fontWeight: "700" }}>
                  {mode === "signin" ? t("signUp") : t("signIn")}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingBottom: insets.bottom + 20, alignItems: "center" }}>
          <Text style={{ color: COLORS.ironGrey, fontSize: 12, textAlign: "center", paddingHorizontal: 20 }}>
            {t("termsPrivacy")}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.forgedSteel,
    borderWidth: 1,
    borderColor: COLORS.ironGrey,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
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
