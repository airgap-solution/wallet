import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
import { URDecoder } from "@ngraveio/bc-ur";
import { decode as cborDecode } from "cbor-x";
import { inflate } from "pako";
import { useAccounts, Account } from "@/contexts/AccountsContext";
import { Buffer } from "buffer";
import { useRouter } from "expo-router";

global.Buffer = Buffer;

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const isFocused = useIsFocused();
  const router = useRouter();
  const { addOrUpdateAccount } = useAccounts();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  // Reset scan state when screen is focused
  useEffect(() => {
    if (isFocused) setScanned(false);
  }, [isFocused]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const decoder = new URDecoder();
      decoder.receivePart(data);

      if (!decoder.isComplete()) {
        Alert.alert("Info", "Incomplete UR fragment, scan more");
        setScanned(false);
        return;
      }

      const urResult = decoder.resultUR();
      let outer: Uint8Array = cborDecode(urResult.cbor);
      let inner: any;

      try {
        inner = cborDecode(inflate(outer));
      } catch {
        inner = outer;
      }

      if (urResult.type === "bytes" && Array.isArray(inner[1])) {
        const accountsArray = inner[1];
        const promises: Promise<void>[] = [];

        for (const acc of accountsArray) {
          if (!Array.isArray(acc) || acc.length < 5) continue;
          const [id, type, block, walletArray] = acc.slice(1); // skip unused first element
          if (
            typeof id !== "number" ||
            !Array.isArray(walletArray) ||
            walletArray.length < 7
          )
            continue;

          const account: Account = {
            ID: id,
            Index: id,
            Type: type,
            Block: block,
            Wallet: {
              DerivationPath: walletArray[0],
              ChainCode: walletArray[1],
              Name: walletArray[2],
              Internal1: walletArray[3],
              Internal2: walletArray[4],
              SomeBytes: walletArray[5],
              XPub: walletArray[6],
            },
          };

          promises.push(addOrUpdateAccount(account));
        }

        await Promise.all(promises);
        router.push("/"); // Navigate back
      } else {
        console.warn("Unsupported UR type:", urResult.type);
        setScanned(false);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message || "Failed to decode QR");
      setScanned(false);
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Requesting camera permission...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  camera: { flex: 1, alignSelf: "stretch" },
});
