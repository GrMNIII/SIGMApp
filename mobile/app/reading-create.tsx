import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import UIButton from "@/components/UIButton";
import { readingService } from "@/src/database/readingService";
import { crackService } from "@/src/database/crackService";

interface ReadingData {
  crack_id: string; // TEXT NOT NULL
  fecha: string | null;
  hora: string | null;
  nombre_inspector: string | null;
  lectura_x: number | null;
  lectura_y: number | null;
  medida_a: number | null;
  medida_b: number | null;
  ambiente_temperatura_C: number | null;
  ambiente_hr_percent: number | null;
  ambiente_clima: string | null;
  // Usamos number para INTEGER, típicamente 0 (No) o 1 (Sí)
  operacion_equipo_en_servicio: number | null;
  operacion_vibraciones: number | null;
  integridad: string | null;
  observaciones: string | null;
}

// Interfaz para definir la estructura de los parámetros esperados de la URL
interface ReadingCreateParams {
  crackId: string; // ID de la grieta a la que pertenece la lectura
  projectId: string; // ID del proyecto (para navegación)
}

// Interfaz para manejar la selección de fecha y hora
interface ReadingDateTimeSelectorProps {
  dateValue: string | null;
  timeValue: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  labelDate: string;
  labelTime: string;
}

const ReadingDateTimeSelector = ({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  labelDate,
  labelTime,
}: ReadingDateTimeSelectorProps) => {
  return (
    <View>
      {/* Fecha */}
      <View style={formStyles.inputGroup}>
        <Text style={formStyles.label}>{labelDate}</Text>
        <View style={dateTimeStyles.dateTimeContainer}>
          <TextInput
            style={[formStyles.input, dateTimeStyles.dateTimeInput]}
            value={dateValue || ""}
            onChangeText={onDateChange}
            placeholder="AAAA-MM-DD (Ej: 2025-10-16)"
            keyboardType="default"
          />
          <TouchableOpacity
            style={dateTimeStyles.dateTimeButton}
            onPress={() => onDateChange(new Date().toISOString().split("T")[0])}
          >
            <Text style={dateTimeStyles.buttonText}>Hoy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hora */}
      <View style={formStyles.inputGroup}>
        <Text style={formStyles.label}>{labelTime}</Text>
        <View style={dateTimeStyles.dateTimeContainer}>
          <TextInput
            style={[formStyles.input, dateTimeStyles.dateTimeInput]}
            value={timeValue || ""}
            onChangeText={onTimeChange}
            placeholder="HH:MM (Ej: 14:30)"
            keyboardType="default"
          />
          <TouchableOpacity
            style={dateTimeStyles.dateTimeButton}
            onPress={() =>
              onTimeChange(
                new Date().toTimeString().split(" ")[0].substring(0, 5)
              )
            }
          >
            <Text style={dateTimeStyles.buttonText}>Ahora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Estado inicial del formulario (todos los campos nulos)
const initialReadingState: Omit<ReadingData, "crack_id"> = {
  fecha: "",
  hora: "",
  nombre_inspector: "",
  lectura_x: null,
  lectura_y: null,
  medida_a: null,
  medida_b: null,
  ambiente_temperatura_C: null,
  ambiente_hr_percent: null,
  ambiente_clima: null,
  operacion_equipo_en_servicio: 0, // Por defecto en 0
  operacion_vibraciones: 0, // Por defecto en 0
  integridad: null,
  observaciones: null,
};

// Componente auxiliar para manejar la entrada de texto/número
interface FormInputProps {
  label: string;
  value: string | number | null;
  onChange: (text: string) => void;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  required?: boolean;
  placeholder?: string;
}

const FormInput = ({
  label,
  value,
  onChange,
  keyboardType = "default",
  required = false,
  placeholder,
}: FormInputProps) => (
  <View style={formStyles.inputGroup}>
    <Text style={formStyles.label}>
      {label}
      {required && <Text style={{ color: "red" }}>*</Text>}
    </Text>
    <TextInput
      style={formStyles.input}
      value={typeof value === "number" ? value.toString() : value || ""}
      onChangeText={onChange}
      keyboardType={keyboardType === "numeric" ? "decimal-pad" : keyboardType}
      // FIX: Se usa el placeholder provisto o se genera uno por defecto
      placeholder={placeholder || `Ingresar ${label.toLowerCase()}`}
    />
  </View>
);

export default function ReadingCreate() {
  const router = useRouter();

  // 1. Migración a Expo Router y obtención de parámetros
  const params = useLocalSearchParams() as unknown as ReadingCreateParams;
  const crackId = params.crackId;
  const projectId = params.projectId;

  const [loading, setLoading] = useState(true);
  const [crackExists, setCrackExists] = useState(false); // Bandera para controlar si se muestra el formulario
  const [readingData, setReadingData] = useState<Omit<ReadingData, "crack_id">>(
    { ...initialReadingState }
  );
  const [error, setError] = useState("");

  // Función genérica para manejar cambios en el formulario
  const handleInputChange = (
    key: keyof typeof initialReadingState,
    text: string
  ) => {
    setReadingData((prev) => {
      const isNumeric = [
        "lectura_x",
        "lectura_y",
        "medida_a",
        "medida_b",
        "ambiente_temperatura_C",
        "ambiente_hr_percent",
        "operacion_equipo_en_servicio",
        "operacion_vibraciones",
      ].includes(key as string);

      let newValue: string | number | null = text.trim() === "" ? null : text;

      if (isNumeric && newValue !== null) {
        // Si es un campo entero (como los flags de operación), usa parseInt
        if (
          key === "operacion_equipo_en_servicio" ||
          key === "operacion_vibraciones"
        ) {
          newValue = parseInt(newValue.toString());
          if (isNaN(newValue)) newValue = 0; // Fallback seguro
        } else {
          // Reemplazar coma por punto para el parseo
          const normalizedText =
            typeof newValue === "string"
              ? newValue.replace(",", ".")
              : newValue;
          const num = parseFloat(normalizedText);
          // Si el texto termina en punto o coma, mantener el string para permitir continuar escribiendo
          const endsWithDecimalSeparator =
            typeof text === "string" &&
            (text.endsWith(".") || text.endsWith(","));
          newValue = isNaN(num) || endsWithDecimalSeparator ? text : num;
        }
      }

      return { ...prev, [key]: newValue };
    });
  };

  // Función para verificar la existencia del crack
  const checkCrackExistence = useCallback(
    (cId: string) => {
      setLoading(true);
      setError("");

      try {
        const exists = crackService.exists(cId);
        if (exists) {
          setCrackExists(true);
        } else {
          setError(
            `Error: No se encontró la grieta con ID "${cId}". No se puede registrar la lectura.`
          );
          Alert.alert(
            "Error de Integridad",
            `La grieta con ID "${cId}" no existe. No se puede crear una lectura.`,
            [{ text: "Volver", onPress: () => router.back() }]
          );
        }
      } catch (err) {
        console.error("Error al verificar existencia de crack:", err);
        setError("Error al verificar la grieta localmente.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!projectId || !crackId) {
      Alert.alert(
        "Error de Navegación",
        "Faltan los IDs de proyecto o grieta.",
        [{ text: "Volver", onPress: () => router.replace("/project-list") }]
      );
      return;
    }
    checkCrackExistence(crackId);
  }, [projectId, crackId, checkCrackExistence, router]);

  // Función principal para guardar la nueva lectura
  const handleSaveReading = async () => {
    if (
      !readingData.fecha ||
      !readingData.hora ||
      !readingData.nombre_inspector ||
      readingData.lectura_x === null ||
      readingData.lectura_y === null ||
      readingData.medida_a === null ||
      readingData.medida_b === null
    ) {
      Alert.alert(
        "Validación",
        "Debes completar la Fecha, Hora, Inspector, las Lecturas X/Y y las Medidas A/B."
      );
      return;
    }

    setLoading(true);

    const readingPayload = {
      crack_id: crackId,
      ...readingData,
    };

    try {
      // Importante: readingService.create DEBE ser asíncrono si usa SQLite, aunque aquí no está declarado como await
      readingService.create(readingPayload);

      Alert.alert("Éxito", `Lectura registrada para la grieta ${crackId}.`);
      // Volvemos a la pantalla de detalles
      router.replace({
        pathname: "/crack-details",
        params: { projectId, crackId },
      });
    } catch (err) {
      // *** DIAGNÓSTICO EN ESTA FUNCIÓN ***
      const errorDetail = err instanceof Error ? err.message : String(err);

      console.error("Error al crear lectura:", err);

      Alert.alert(
        "¡ERROR DE PERSISTENCIA!",
        `La base de datos local falló al guardar. Por favor, reportar este error:\n\nDETALLE: ${errorDetail}`
      );
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADO DE ESTADOS ---

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.header}>
          Verificando grieta y cargando formulario...
        </Text>
      </View>
    );
  }

  if (error && !crackExists) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <UIButton
          title="Regresar"
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  if (!crackExists) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          No se pudo confirmar la existencia de la grieta.
        </Text>
      </View>
    );
  }

  // --- RENDERIZADO PRINCIPAL (Formulario) ---

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Nueva Lectura para Grieta</Text>

        {/* IDs Clave */}
        <View style={formStyles.keyInfoCard}>
          <Text style={formStyles.label}>Grieta ID:</Text>
          <Text style={formStyles.value}>{crackId}</Text>
          <Text style={formStyles.label}>Proyecto ID:</Text>
          <Text style={formStyles.value}>{projectId}</Text>
        </View>

        {/* SECCIÓN 1: IDENTIFICACIÓN (OBLIGATORIO) */}
        <View style={formStyles.sectionHeaderContainer}>
          <Text style={formStyles.sectionHeader}>
            1. Identificación y Tiempo
          </Text>
        </View>
        <ReadingDateTimeSelector
          labelDate="Fecha"
          labelTime="Hora"
          dateValue={readingData.fecha}
          timeValue={readingData.hora}
          onDateChange={(text) => handleInputChange("fecha", text)}
          onTimeChange={(text) => handleInputChange("hora", text)}
        />

        <FormInput
          label="Nombre Inspector"
          value={readingData.nombre_inspector}
          onChange={(text) => handleInputChange("nombre_inspector", text)}
          required
        />

        {/* SECCIÓN 2: LECTURAS (OBLIGATORIO) */}
        <View style={formStyles.sectionHeaderContainer}>
          <Text style={formStyles.sectionHeader}>2. Mediciones (mm)</Text>
        </View>
        <FormInput
          label="Lectura Eje X"
          value={readingData.lectura_x}
          onChange={(text) => handleInputChange("lectura_x", text)}
          keyboardType="numeric"
          required
        />
        <FormInput
          label="Lectura Eje Y"
          value={readingData.lectura_y}
          onChange={(text) => handleInputChange("lectura_y", text)}
          keyboardType="numeric"
          required
        />
        <FormInput
          label = "medida A"
          value={readingData.medida_a}
          onChange={(text) => handleInputChange("medida_a", text)}
          keyboardType="numeric"
          required
        />
        <FormInput
          label = "medida B"
          value={readingData.medida_b}
          onChange={(text) => handleInputChange("medida_b", text)}
          keyboardType="numeric"
          required
        />

        {/* SECCIÓN 3: AMBIENTE */}
        <View style={formStyles.sectionHeaderContainer}>
          <Text style={formStyles.sectionHeader}>
            3. Condiciones Ambientales
          </Text>
        </View>
        <FormInput
          label="Temperatura (°C)"
          value={readingData.ambiente_temperatura_C}
          onChange={(text) => handleInputChange("ambiente_temperatura_C", text)}
          keyboardType="numeric"
        />
        <FormInput
          label="Humedad Relativa (%)"
          value={readingData.ambiente_hr_percent}
          onChange={(text) => handleInputChange("ambiente_hr_percent", text)}
          keyboardType="numeric"
        />
        <FormInput
          label="Clima"
          value={readingData.ambiente_clima}
          onChange={(text) => handleInputChange("ambiente_clima", text)}
          placeholder="Soleado, Lluvioso, etc."
        />

        {/* SECCIÓN 4: OPERACIÓN E INTEGRIDAD */}
        <View style={formStyles.sectionHeaderContainer}>
          <Text style={formStyles.sectionHeader}>4. Entorno y Estado</Text>
        </View>

        {/* Campos de tipo INTEGER/Flag (Sugerencia: cambiar a Switch/Checkbox en producción) */}
        <FormInput
          label="Equipo en Servicio (1=Sí / 0=No)"
          value={readingData.operacion_equipo_en_servicio}
          onChange={(text) =>
            handleInputChange("operacion_equipo_en_servicio", text)
          }
          keyboardType="numeric"
        />
        <FormInput
          label="Vibraciones Presentes (1=Sí / 0=No)"
          value={readingData.operacion_vibraciones}
          onChange={(text) => handleInputChange("operacion_vibraciones", text)}
          keyboardType="numeric"
        />
        <FormInput
          label="Integridad del Sensor"
          value={readingData.integridad}
          onChange={(text) => handleInputChange("integridad", text)}
          placeholder="OK, Dañado, Obstruido"
        />
        <FormInput
          label="Observaciones"
          value={readingData.observaciones}
          onChange={(text) => handleInputChange("observaciones", text)}
          placeholder="Notas adicionales..."
        />

        <View style={{ marginTop: 30, marginBottom: 50 }}>
          <UIButton
            title={loading ? "Guardando..." : "Guardar Lectura"}
            onPress={handleSaveReading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#007bff",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
});

const dateTimeStyles = StyleSheet.create({
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeInput: {
    flex: 1,
  },
  dateTimeButton: {
    marginLeft: 10,
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

// Estilos específicos del formulario (copiados de crack-create.tsx para consistencia)
const formStyles = StyleSheet.create({
  keyInfoCard: {
    backgroundColor: "#e6f0ff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
  },
  sectionHeaderContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#ced4da",
    paddingBottom: 5,
    marginBottom: 15,
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 10,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
