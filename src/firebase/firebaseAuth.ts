import { app } from "./firebase";


import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    getReactNativePersistence,
    initializeAuth,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);