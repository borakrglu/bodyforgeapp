import { Redirect } from "expo-router";
import { useAuth } from "../utils/auth/useAuth";
import { useUser } from "../utils/auth/useUser";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../utils/i18n";

export default function Index() {
  const { isAuthenticated, isReady, auth } = useAuth();
  const { setLanguage } = useLanguage();
  const [hasProfile, setHasProfile] = useState(null);
  const [hasPrograms, setHasPrograms] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const [guest, lang, savedLang] = await Promise.all([
          AsyncStorage.getItem("isGuest"),
          AsyncStorage.getItem("languageSelected"),
          AsyncStorage.getItem("language"),
        ]);

        // Force English if nothing is selected yet
        if (!savedLang) {
          await setLanguage("en");
        }

        setIsGuest(guest === "true");
        setLanguageSelected(lang === "true");
      } catch (error) {
        console.error("Error checking initial status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkInitialStatus();
  }, [isAuthenticated, isReady]); // Re-run when auth state changes

  useEffect(() => {
    const checkProfileAndPrograms = async () => {
      if (isAuthenticated && auth?.user?.id) {
        setCheckingProfile(true);
        try {
          // 1. Check Profile
          const userResponse = await fetch(`/api/users/${auth.user.id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const profileExists = !!userData.user;
            setHasProfile(profileExists);

            // 2. Check Programs if profile exists
            if (profileExists) {
              const programsResponse = await fetch(
                `/api/programs/user/${auth.user.id}`,
              );
              if (programsResponse.ok) {
                const programsData = await programsResponse.json();
                setHasPrograms(
                  programsData.programs && programsData.programs.length > 0,
                );
              } else {
                setHasPrograms(false);
              }
            } else {
              setHasPrograms(false);
            }
          } else {
            setHasProfile(false);
            setHasPrograms(false);
          }
        } catch (error) {
          console.error("Error checking profile/programs:", error);
          setHasProfile(false);
          setHasPrograms(false);
        } finally {
          setCheckingProfile(false);
        }
      }
    };
    checkProfileAndPrograms();
  }, [isAuthenticated, auth?.user?.id]); // Added auth.user.id to dependencies

  if (!isReady || checkingProfile || checkingStatus) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0D0D0D",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#FF6A1A" size="large" />
      </View>
    );
  }

  // 1. First check language
  if (languageSelected === false) {
    return <Redirect href="/language-selection" />;
  }

  // 2. Then check auth/guest
  if (isAuthenticated) {
    if (hasProfile === false) {
      return <Redirect href="/onboarding/questionnaire" />;
    }
    if (hasProfile === true && hasPrograms === false) {
      return <Redirect href={`/generate-programs?userId=${auth.user.id}`} />;
    }
    if (hasProfile === true && hasPrograms === true) {
      return <Redirect href="/(tabs)/home" />;
    }
  }

  // If not authenticated, check if guest
  if (!isAuthenticated) {
    if (isGuest) {
      return <Redirect href="/(tabs)/home" />;
    } else {
      return <Redirect href="/auth" />;
    }
  }

  // Fallback
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0D0D0D",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator color="#FF6A1A" size="large" />
    </View>
  );
}
