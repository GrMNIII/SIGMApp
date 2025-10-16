import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import UIButton from "@/components/UIButton";
import { readingService } from "@/src/database/readingService";

// --- TIPOS DE DATOS ---

// Interfaz para la estructura de una lectura (basado en la respuesta de la API y el esquema SQL)
interface Reading {
  id: number;
  crack_id: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  nombre_inspector: string;
  lectura_x: number;
  lectura_y: number;
  ambiente_temperatura_C: number | null;
  ambiente_hr_percent: number | null;
  // Nuevos campos basados en el esquema SQL
  ambiente_clima: string | null; // TEXT
  operacion_equipo_en_servicio: number | null; // INTEGER (0 o 1)
  operacion_vibraciones: number | null; // INTEGER (0 o 1)
  // Campos existentes
  integridad: string | null;
  observaciones: string | null;
}

// Interfaz para definir la estructura de los parámetros esperados de la URL
interface ReadingRecordParams {
  crackId: string; // ID de la grieta
  projectId: string; // ID del proyecto (para navegación)
}

// --- COMPONENTES AUXILIARES ---

// Componente para mostrar una lectura individual
const ReadingCard = ({
  reading,
  index,
}: {
  reading: Reading;
  index: number;
}) => {
  // Función para formatear la fecha y hora en un solo objeto Date para ordenar
  const dateTime = `${reading.fecha}T${reading.hora}:00`;

  // Ayudantes para mostrar Sí/No
  const getServiceStatus = (val: number | null) =>
    val === 1 ? "Sí" : val === 0 ? "No" : "N/A";
  const getVibrationStatus = (val: number | null) =>
    val === 1 ? "Presentes" : val === 0 ? "Ausentes" : "N/A";

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <Text style={cardStyles.headerTitle}>Lectura #{index + 1}</Text>
        <Text style={cardStyles.headerDate}>
          {new Date(dateTime).toLocaleString()}
        </Text>
      </View>

      <View style={cardStyles.dataRow}>
        <View style={cardStyles.dataItem}>
          <Text style={cardStyles.label}>Eje X:</Text>
          <Text style={cardStyles.valueX}>
            {reading.lectura_x !== null
              ? `${reading.lectura_x.toFixed(2)} mm`
              : "N/A"}
          </Text>
        </View>
        <View style={cardStyles.dataItem}>
          <Text style={cardStyles.label}>Eje Y:</Text>
          <Text style={cardStyles.valueY}>
            {reading.lectura_y !== null
              ? `${reading.lectura_y.toFixed(2)} mm`
              : "N/A"}
          </Text>
        </View>
      </View>

      {/* Bloque de Condiciones Ambientales */}
      <View style={cardStyles.detailsBlock}>
        <Text style={cardStyles.blockTitle}>Condiciones Ambientales</Text>
        <Text style={cardStyles.detailText}>
          <Text style={cardStyles.detailLabel}>Temperatura:</Text>
          {reading.ambiente_temperatura_C !== null
            ? `${reading.ambiente_temperatura_C}°C`
            : "N/A"}
        </Text>
        <Text style={cardStyles.detailText}>
          <Text style={cardStyles.detailLabel}>Humedad Relativa:</Text>
          {reading.ambiente_hr_percent !== null
            ? `${reading.ambiente_hr_percent}%`
            : "N/A"}
        </Text>
        <Text style={cardStyles.detailText}>
          <Text style={cardStyles.detailLabel}>Clima:</Text>
          {reading.ambiente_clima || "No reportado"}
        </Text>
      </View>

      {/* Bloque de Operación y Sensor */}
      <View style={cardStyles.detailsBlock}>
        <Text style={cardStyles.blockTitle}>Condiciones Operacionales</Text>
        <Text style={cardStyles.detailText}>
          <Text style={cardStyles.detailLabel}>Equipo en Servicio:</Text>
          {getServiceStatus(reading.operacion_equipo_en_servicio)}
        </Text>
        <Text style={cardStyles.detailText}>
          <Text style={cardStyles.detailLabel}>Vibraciones:</Text>
          {getVibrationStatus(reading.operacion_vibraciones)}
        </Text>
        <Text style={cardStyles.detailText}>
          <Text style={cardStyles.detailLabel}>Integridad Sensor:</Text>{" "}
          {reading.integridad || "No reportada"}
        </Text>
      </View>

      <View style={cardStyles.detailsContainer}>
        <Text style={cardStyles.detailText}>
          <Text style={cardStyles.detailLabel}>Inspector:</Text>{" "}
          {reading.nombre_inspector || "Desconocido"}
        </Text>
      </View>

      {reading.observaciones && (
        <View style={cardStyles.notesContainer}>
          <Text style={cardStyles.notesTitle}>Observaciones:</Text>
          <Text style={cardStyles.notesText}>{reading.observaciones}</Text>
        </View>
      )}
    </View>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function ReadingRecord() {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as ReadingRecordParams;
  const crackId = params.crackId;
  const projectId = params.projectId;

  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Lógica para obtener el historial de lecturas
  const fetchReadings = useCallback(() => {
    if (!crackId) return;
    setLoading(true);
    setError(null);

    try {
      // readingService devuelve unknown[], así que lo casteamos a Reading[]
      const localReadings = readingService.getByCrack(crackId) as Reading[];
      setReadings(localReadings);
    } catch (err: any) {
      console.error("Error fetching readings:", err);
      setError(
        "No se pudo cargar el historial de lecturas desde la base de datos local."
      );
      Alert.alert(
        "Error",
        "No se pudo obtener el historial de lecturas para esta grieta."
      );
    } finally {
      setLoading(false);
    }
  }, [crackId]);

  useEffect(() => {
    if (!projectId || !crackId) {
      Alert.alert("Error", "Faltan los IDs para ver los detalles.");
      router.replace("/project-list" as any);
      return;
    }
    fetchReadings();
  }, [projectId, crackId, fetchReadings, router]);

  // 2. Lógica para ordenar las lecturas (más reciente primero)
  const sortedReadings = useMemo(() => {
    return [...readings].sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora || "00:00"}`);
      const dateB = new Date(`${b.fecha}T${b.hora || "00:00"}`);
      // Orden descendente (más nuevo primero)
      return dateB.getTime() - dateA.getTime();
    });
  }, [readings]);

  // 3. Manejo de estados de carga y error
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.statusText}>
          Cargando historial de registros...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <UIButton
          title="Reintentar"
          onPress={fetchReadings}
          style={{ marginTop: 20 }}
        />
        <UIButton
          title="Volver a Detalles"
          onPress={() => router.back()}
          style={{ marginTop: 10, backgroundColor: "#6c757d" }}
        />
      </View>
    );
  }

  // 4. Renderizado de la lista
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial de Registros</Text>
      <Text style={styles.subHeader}>
        Grieta ID: <Text style={styles.crackIdText}>{crackId}</Text>
      </Text>

      <View style={styles.buttonSection}>
        <UIButton
          title="Registrar Nueva Lectura"
          onPress={() =>
            router.push({
              pathname: "/reading-create" as any,
              params: { projectId: projectId, crackId: crackId },
            })
          }
        />
      </View>

      {sortedReadings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aún no hay lecturas registradas para esta grieta.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedReadings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }: { item: Reading; index: number }) => (
            <ReadingCard reading={item} index={index} />
          )}
        />
      )}
    </View>
  );
}

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007bff",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#191970", // Azul marino
    marginBottom: 5,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 15,
    textAlign: "center",
  },
  crackIdText: {
    fontWeight: "bold",
    color: "#343a40",
  },
  buttonSection: {
    marginBottom: 20,
  },
  emptyContainer: {
    marginTop: 50,
    padding: 20,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffeeba",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#856404",
    textAlign: "center",
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#28a745", // Verde para lecturas exitosas
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
  },
  headerDate: {
    fontSize: 14,
    color: "#6c757d",
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dataItem: {
    width: "48%",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  label: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 3,
  },
  valueX: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc3545", // Rojo para X
  },
  valueY: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff", // Azul para Y
  },
  detailsContainer: {
    marginBottom: 10,
  },
  detailsBlock: {
    // Nuevo estilo para bloques de detalles
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#ffc107",
  },
  blockTitle: {
    // Nuevo estilo para títulos de bloque
    fontSize: 15,
    fontWeight: "bold",
    color: "#6c757d",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 22,
  },
  detailLabel: {
    fontWeight: "600",
    color: "#343a40",
  },
  notesContainer: {
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#495057",
  },
  notesText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6c757d",
  },
});
