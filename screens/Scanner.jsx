import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../config/firebase";

const db = getFirestore(app);

const Scanner = () => {
  const navigation = useNavigation();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [seatInfo, setSeatInfo] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }

    navigation.setOptions({
      title: "Skaner",
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 20,
      },
    });
  }, [permission, navigation]);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (!scanned) {
      setScanned(true);
      setScannedData(data);
      setLoading(true);
      setErrorMessage("");
      setSeatInfo(null);

      console.log(`🔍 Zeskanowano kod QR: ${data}`);

      const qrRef = doc(db, "qrcodes", data);
      const qrSnap = await getDoc(qrRef);

      if (qrSnap.exists()) {
        console.log("✅ Kod QR znajduje się w bazie!");

        const seatData = qrSnap.data();
        setSeatInfo(seatData);

        Alert.alert("Kod QR poprawny!", `Rezerwujesz: ${seatData.seatId}`);
        navigation.navigate("Form", { qrData: data });
      } else {
        console.log("❌ Kod QR nie znajduje się w bazie!");
        setErrorMessage(
          "❌ Kod QR nie jest przypisany do żadnego miejsca. Spróbuj zeskanować ponownie."
        );
        setScanned(false);
        setScannedData(null);
      }
      setLoading(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScannedData(null);
    setErrorMessage("");
    setSeatInfo(null);
  };

  if (!permission) {
    return <Text>Proszę poczekać, sprawdzamy uprawnienia...</Text>;
  }

  if (!permission.granted) {
    return <Text>Brak dostępu do kamery. Proszę włączyć uprawnienia.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Zeskanuj kod QR</Text>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Sprawdzanie kodu QR...</Text>
        </View>
      )}

      {errorMessage ? (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={[styles.button, styles.scanAgain]}
            onPress={handleScanAgain}
          >
            <Text style={styles.buttonText}>Skanuj ponownie</Text>
          </TouchableOpacity>
        </View>
      ) : (
        scanned &&
        seatInfo && (
          <View style={styles.overlay}>
            <Text style={styles.scannedText}>
              ✅ Kod QR poprawny! Rezerwujesz: {seatInfo.seatId}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("Form", { qrData: scannedData })
              }
            >
              <Text style={styles.buttonText}>Zarezerwuj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.scanAgain]}
              onPress={handleScanAgain}
            >
              <Text style={styles.buttonText}>Skanuj ponownie</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    top: 50,
    color: "#333",
  },
  camera: {
    width: "90%",
    height: "75%",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 80,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 30,
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  scannedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 15,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc3545",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginVertical: 5,
  },
  scanAgain: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Scanner;
