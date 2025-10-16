import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import UIButton from "@/components/UIButton";
import { projectService } from "@/src/database/projectService";

export default function ProjectCreate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    // Validación básica
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del proyecto es obligatorio");
      return;
    }

    setLoading(true);

    try {
      // Crear proyecto en SQLite
      const projectId = projectService.create(
        name.trim(),
        description.trim() || undefined
      );

      console.log(`✅ Proyecto creado con ID: ${projectId}`);

      Alert.alert(
        "Éxito",
        "Proyecto creado correctamente",
        [
          {
            text: "OK",
            onPress: () => {
              // Navegar de vuelta a la lista de proyectos
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error al crear proyecto:", error);
      Alert.alert(
        "Error",
        `No se pudo crear el proyecto: ${error.message || "Error desconocido"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (name.trim() || description.trim()) {
      Alert.alert(
        "Cancelar",
        "¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.",
        [
          { text: "No", style: "cancel" },
          {
            text: "Sí, cancelar",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.header}>Nuevo Proyecto</Text>
          <Text style={styles.subtitle}>
            Completa la información para crear un nuevo proyecto
          </Text>

          {/* Campo de Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nombre del Proyecto <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Edificio Central - Monitoreo 2024"
              placeholderTextColor="#999"
              maxLength={255}
              editable={!loading}
            />
            <Text style={styles.helperText}>
              {name.length}/255 caracteres
            </Text>
          </View>

          {/* Campo de Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Ej: Monitoreo de grietas estructurales en edificio principal después del sismo de marzo 2024"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
              editable={!loading}
            />
            <Text style={styles.helperText}>
              {description.length}/1000 caracteres
            </Text>
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonContainer}>
            <UIButton
              title={loading ? "Creando..." : "Crear Proyecto"}
              onPress={handleSubmit}
              disabled={loading || !name.trim()}
              style={{
                backgroundColor:
                  loading || !name.trim() ? "#ccc" : "#007bff",
                marginBottom: 10,
              }}
            />

            <UIButton
              title="Cancelar"
              onPress={handleCancel}
              disabled={loading}
              style={{
                backgroundColor: "#6c757d",
              }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  formContainer: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "red",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "right",
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#e7f3ff",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
    marginTop: 20,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#004085",
    lineHeight: 20,
  },
});