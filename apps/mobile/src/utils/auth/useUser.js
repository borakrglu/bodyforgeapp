import { useCallback, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useUser = () => {
	const { auth, isReady } = useAuth();
	const [isGuest, setIsGuest] = useState(false);
	const user = auth?.user || null;

	useEffect(() => {
		checkGuest();
	}, [auth]);

	const checkGuest = async () => {
		if (!auth?.user) {
			const guest = await AsyncStorage.getItem("isGuest");
			setIsGuest(guest === "true");
		} else {
			setIsGuest(false);
		}
	};

	const fetchUser = useCallback(async () => {
		checkGuest();
		return user;
	}, [user]);

	return { user, data: user, loading: !isReady, refetch: fetchUser, isGuest };
};
export default useUser;
