import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { crackService } from "@/src/database/crackService";

// Interfaz mínima para mostrar en la lista
interface CrackListItem {
  id: string; // TEXT PRIMARY KEY (El identificador único de la grieta)
  name: string; // Nombre para mostrar
  edificio_area: string; // Campo adicional para contexto
}

// Interfaz para definir la estructura de los parámetros que esperamos de la URL
interface CrackListParams {
  projectId: string; // ID del proyecto (viene como string)
}

export default function CrackList() {
  const router = useRouter();

  // Leemos y tipamos el parámetro de consulta (projectId)
  const params = useLocalSearchParams() as unknown as CrackListParams;
  const projectId = params.projectId; // String del router
  const [cracks, setCracks] = useState<CrackListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Función para obtener la lista de grietas del proyecto de forma síncrona
  const fetchCracks = useCallback((pId: string) => {
    setLoading(true);
    setError("");

    const pIdNumber = parseInt(pId, 10);

    if (isNaN(pIdNumber)) {
      setError("ID de proyecto inválido. Debe ser un número.");
      setLoading(false);
      return;
    }
    try {
      // Llama al servicio local síncrono.
      // IMPORTANTE: Esta llamada es bloqueante debido al uso de *Sync
      const results = crackService.getByProject(pIdNumber);

      // El servicio devuelve directamente el array de resultados
      setCracks(results as CrackListItem[]);
    } catch (err) {
      console.error("Error al cargar lista de grietas localmente:", err);
      // Si falla, puede ser porque la DB no fue inicializada en otro lugar.
      setError(
        "No se pudieron cargar las grietas. ¿La base de datos está inicializada?"
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!projectId) {
      setError("Falta el ID del proyecto.");
      Alert.alert(
        "Error",
        "Falta el ID del proyecto para listar las grietas.",
        [{ text: "Volver", onPress: () => router.back() }]
      );
      return;
    }
    // Dispara la carga síncrona
    fetchCracks(projectId);
  }, [projectId, fetchCracks, router]);
  // Función que maneja la selección de una grieta
  const handleCrackPress = (crackId: string) => {
    // Navega a la pantalla de detalles, pasando ambos IDs
    router.push({
      pathname: "/crack-details" as any,
      params: {
        projectId: projectId,
        crackId: crackId,
      },
    });
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.header}>Cargando lista de grietas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Grietas en Proyecto: {projectId}</Text>

      <ScrollView style={styles.listContainer}>
        {cracks.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay grietas registradas en este proyecto.
          </Text>
        ) : (
          cracks.map((crack) => (
            <TouchableOpacity
              key={crack.id}
              style={styles.crackItem}
              onPress={() => handleCrackPress(crack.id)}
            >
              <Text style={styles.crackTitle}>
                {crack.name} ({crack.id})
              </Text>
              <Text style={styles.crackSubtitle}>
                Área: {crack.edificio_area || "N/A"}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#007bff",
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
  },
  crackItem: {
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  crackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  crackSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
  errorText: {
    fontSize: 18,
    color: "#dc3545",
    textAlign: "center",
  },
});
