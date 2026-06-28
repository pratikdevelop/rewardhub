import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyScreen() {
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
          Privacy Policy
        </Text>

        <Text style={styles.date}>
          Last Updated: June 2026
        </Text>

        <Text style={styles.heading}>
          Information We Collect
        </Text>

        <Text style={styles.text}>
          We collect your email address, display name,
          account information, and gameplay statistics to
          provide the services of RewardTube.
        </Text>

        <Text style={styles.heading}>
          How We Use Information
        </Text>

        <Text style={styles.text}>
          Your information is used to authenticate your
          account, save your progress, maintain virtual coin
          balances, and improve the gaming experience.
        </Text>

        <Text style={styles.heading}>
          Data Storage
        </Text>

        <Text style={styles.text}>
          User data is securely stored using Firebase
          Authentication and Cloud Firestore.
        </Text>

        <Text style={styles.heading}>
          Data Sharing
        </Text>

        <Text style={styles.text}>
          We do not sell or rent your personal information
          to third parties. Information is only shared when
          required by law or to provide core application
          services.
        </Text>

        <Text style={styles.heading}>
          Security
        </Text>

        <Text style={styles.text}>
          We use reasonable technical and organizational
          measures to help protect your personal information.
          However, no method of electronic storage is 100%
          secure.
        </Text>

        <Text style={styles.heading}>
          Children's Privacy
        </Text>

        <Text style={styles.text}>
          RewardTube is not intended for children under the
          age required by local laws without parental
          consent.
        </Text>

        <Text style={styles.heading}>
          Your Rights
        </Text>

        <Text style={styles.text}>
          You may request correction or deletion of your
          account information by contacting us.
        </Text>

        <Text style={styles.heading}>
          Contact
        </Text>

        <Text style={styles.text}>
          For questions regarding this Privacy Policy,
          contact us at:

          {"\n\n"}

          support@rewardtube.app
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