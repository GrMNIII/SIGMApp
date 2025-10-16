import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { crackService } from "@/src/database/crackService";

const { width } = Dimensions.get("window");
const qrSize = width * 0.7;

export default function QRScanner() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    console.log(`📷 QR escaneado: ${data}`);

    // Validar que el QR no esté vacío
    if (!data || data.trim() === "") {
      Alert.alert(
        "QR Inválido",
        "El código QR está vacío. Por favor, escanea un código válido.",
        [{ text: "Reintentar", onPress: () => setScanned(false) }]
      );
      return;
    }

    const crackId = data.trim();

    // Verificar si la grieta ya existe
    const exists = crackService.exists(crackId);

    if (exists) {
      // Si existe, navegar a los detalles
      Alert.alert(
        "Grieta Existente",
        `La grieta con ID "${crackId}" ya está registrada. ¿Quieres ver sus detalles?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setScanned(false),
          },
          {
            text: "Ver Detalles",
            onPress: () => {
              router.replace({
                pathname: "/crack-details" as any,
                params: {
                  projectId: projectId,
                  crackId: crackId,
                },
              });
            },
          },
        ]
      );
    } else {
      // Si no existe, navegar al formulario de creación
      router.replace({
        pathname: "/crack-create" as any,
        params: {
          projectId: projectId,
          crackId: crackId,
        },
      });
    }
  };

  const toggleTorch = () => {
    setTorchOn((prev) => !prev);
  };

  const handleCancel = () => {
    router.back();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Solicitando permiso de cámara...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          No se tiene acceso a la cámara
        </Text>
        <Text style={styles.permissionSubtext}>
          Por favor, habilita los permisos de cámara en la configuración de tu
          dispositivo para usar esta función.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        enableTorch={torchOn}
      >
        {/* Overlay con marco de escaneo */}
        <View style={styles.overlay}>
          {/* Top */}
          <View style={styles.overlayTop}>
            <Text style={styles.instructionText}>
              Coloca el código QR dentro del marco
            </Text>
          </View>

          {/* Middle (QR Frame) */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlayLeft} />
            <View style={styles.qrFrame}>
              {/* Corners */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Scanning line animation would go here */}
              {!scanned && <View style={styles.scanningLine} />}
            </View>
            <View style={styles.overlayRight} />
          </View>

          {/* Bottom */}
          <View style={styles.overlayBottom}>
            {scanned && (
              <View style={styles.scannedContainer}>
                <Text style={styles.scannedText}>✅ QR Escaneado</Text>
                <Text style={styles.scannedSubtext}>Procesando...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Controles */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleTorch}
          >
            <Text style={styles.controlButtonText}>
              {torchOn ? "🔦 Apagar Flash" : "🔦 Encender Flash"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.controlButtonText}>✕ Cancelar</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  permissionText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  permissionSubtext: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: "#007bff",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  overlayMiddle: {
    flexDirection: "row",
    height: qrSize,
  },
  overlayLeft: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  qrFrame: {
    width: qrSize,
    height: qrSize,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayRight: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 20,
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#00ff00",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanningLine: {
    width: "90%",
    height: 2,
    backgroundColor: "#00ff00",
    opacity: 0.8,
  },
  scannedContainer: {
    alignItems: "center",
  },
  scannedText: {
    color: "#00ff00",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  scannedSubtext: {
    color: "#fff",
    fontSize: 14,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  controlButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cancelButton: {
    backgroundColor: "rgba(220, 53, 69, 0.8)",
    borderColor: "#dc3545",
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});