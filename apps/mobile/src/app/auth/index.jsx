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
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formWrapper}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              BODY<Text style={styles.logoAccent}>FORGE</Text>
            </Text>
            <View style={styles.logoUnderline} />
            <Text style={styles.tagline}>
              {t("brandStatement") || "Forge Your Body. Transform Your Life."}
            </Text>
          </View>

          {/* Form */}
          <View>
            {mode === "signup" && (
              <View style={[styles.inputContainer, { marginBottom: 16 }]}>
                <User color="#C7C7C7" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#666666"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={[styles.inputContainer, { marginBottom: 16 }]}>
              <Mail color="#C7C7C7" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={[styles.inputContainer, { marginBottom: 16 }]}>
              <Lock color="#C7C7C7" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color="#C7C7C7" size={20} />
                ) : (
                  <Eye color="#C7C7C7" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleEmailAuth}
              style={[styles.authButton, styles.primaryButton, { marginBottom: 16 }]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.authButtonText}>
                  {mode === "signup" ? (t("signUp") || "Sign Up") : (t("signIn") || "Sign In")}
                </Text>
              )}
            </TouchableOpacity>

            {/* Guest Button */}
            <TouchableOpacity
              onPress={handleContinueAsGuest}
              style={[styles.authButton, styles.secondaryButton]}
              disabled={loading}
            >
              <UserCircle color="#C7C7C7" size={24} />
              <Text style={[styles.authButtonText, { color: "#C7C7C7", marginLeft: 12 }]}>
                {t("continueWithFree") || "Continue with Free Version"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Mode */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
              <Text style={styles.toggleText}>
                {mode === "signin" ? (t("dontHaveAccount") || "Don't have an account? ") : "Already have an account? "}
                <Text style={styles.toggleAccent}>
                  {mode === "signin" ? (t("signUp") || "Sign Up") : (t("signIn") || "Sign In")}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Test Credentials Hint */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              Test: test@test.com / password123
            </Text>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={styles.footerText}>
            {t("termsPrivacy") || "By continuing, you agree to our Terms & Privacy Policy"}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -2,
  },
  logoAccent: {
    color: "#FF6A1A",
  },
  logoUnderline: {
    width: 60,
    height: 4,
    backgroundColor: "#FF6A1A",
    marginTop: 4,
  },
  tagline: {
    color: "#C7C7C7",
    marginTop: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2E2E2E",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 18,
  },
  primaryButton: {
    backgroundColor: "#FF6A1A",
    borderWidth: 1,
    borderColor: "#FF6A1A",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2E2E2E",
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  toggleContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  toggleText: {
    color: "#C7C7C7",
    fontSize: 14,
  },
  toggleAccent: {
    color: "#FF6A1A",
    fontWeight: "700",
  },
  hintContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  hintText: {
    color: "#666666",
    fontSize: 12,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "#2E2E2E",
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
