import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function TermsScreen() {
    const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
               <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.title}>
          Terms & Conditions
        </Text>

        <Text style={styles.date}>
          Last Updated: June 2026
        </Text>

        <Text style={styles.heading}>
          1. Acceptance
        </Text>

        <Text style={styles.text}>
          By using RewardTube, you agree to these Terms &
          Conditions. If you do not agree, please discontinue
          using the application.
        </Text>

        <Text style={styles.heading}>
          2. Entertainment Purpose
        </Text>

        <Text style={styles.text}>
          RewardTube is designed solely for entertainment.
          All games are intended for fun and do not involve
          gambling or real-money betting.
        </Text>

        <Text style={styles.heading}>
          3. Virtual Coins
        </Text>

        <Text style={styles.text}>
          Coins earned within the app are virtual rewards.
          They have no monetary value, cannot be exchanged
          for cash, and cannot be transferred between users.
        </Text>

        <Text style={styles.heading}>
          4. User Accounts
        </Text>

        <Text style={styles.text}>
          Users are responsible for maintaining the security
          of their account credentials. Sharing accounts is
          discouraged.
        </Text>

        <Text style={styles.heading}>
          5. Fair Play
        </Text>

        <Text style={styles.text}>
          Users must not use bots, scripts, hacks, cheats,
          or any unfair methods to gain advantages within
          the application.
        </Text>

        <Text style={styles.heading}>
          6. Account Suspension
        </Text>

        <Text style={styles.text}>
          We reserve the right to suspend or terminate any
          account involved in fraudulent activity or misuse
          of the application.
        </Text>

        <Text style={styles.heading}>
          7. Changes
        </Text>

        <Text style={styles.text}>
          These Terms may be updated from time to time.
          Continued use of the application indicates
          acceptance of any changes.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#0F172A"
  },

  content:{
    padding:20,
    paddingBottom:40
  },

  title:{
    color:"#fff",
    fontSize:28,
    fontWeight:"700",
    marginBottom:10
  },

  date:{
    color:"#94A3B8",
    marginBottom:25
  },

  heading:{
    color:"#fff",
    fontSize:18,
    fontWeight:"700",
    marginBottom:8,
    marginTop:18
  },

  text:{
    color:"#CBD5E1",
    fontSize:15,
    lineHeight:24
  },
    backButton: {
  alignSelf: "flex-start",
  marginBottom: 20,
},

backText: {
  color: "#3B82F6", // or COLORS.primary
  fontSize: 16,
  fontWeight: "600",
  paddingHorizontal: 20,
  paddingTop:10
},
});