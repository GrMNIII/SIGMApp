import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Camera } from "expo-camera";
import UIButton from "@/components/UIButton";
import { projectService } from "@/src/database/projectService";
import { crackService } from "@/src/database/crackService";

type Project = {
  id: number;
  name: string;
  description?: string;
};

type Crack = {
  id: string;
  project_id: number;
  name: string;
  // ... otros campos
};

export default function ProjectMain() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const projectId = params.projectId as string;
  const preloadedProject = params.project
    ? JSON.parse(params.project as string)
    : null;

  const [project, setProject] = useState<Project | null>(preloadedProject);
  const [cracks, setCracks] = useState<Crack[]>([]);
  const [loading, setLoading] = useState(!preloadedProject);
  const [cracksLoading, setCracksLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Solicitar permisos de cámara
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Cargar datos del proyecto
  const fetchProject = () => {
    if (preloadedProject) {
      setProject(preloadedProject);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = projectService.getById(parseInt(projectId));
      if (data) {
        setProject(data as Project);
      } else {
        Alert.alert("Error", "Proyecto no encontrado", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("Error al cargar proyecto:", error);
      Alert.alert("Error", "No se pudo cargar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  // Cargar grietas del proyecto
  const fetchCracks = () => {
    setCracksLoading(true);
    try {
      const data = crackService.getByProject(parseInt(projectId));
      setCracks(data as Crack[]);
      console.log(`✅ ${data.length} grietas cargadas para proyecto ${projectId}`);
    } catch (error) {
      console.error("Error al cargar grietas:", error);
      Alert.alert("Error", "No se pudieron cargar las grietas");
    } finally {
      setCracksLoading(false);
    }
  };

  // Cargar datos al montar y cuando la pantalla recibe foco
  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      fetchCracks();
    }, [projectId])
  );

  // Abrir escáner QR para registrar nueva grieta
  const handleScanQR = () => {
    if (hasPermission === null) {
      Alert.alert("Esperando", "Verificando permisos de cámara...");
      return;
    }

    if (hasPermission === false) {
      Alert.alert(
        "Permiso Denegado",
        "La aplicación necesita acceso a la cámara para escanear códigos QR. Por favor, habilita los permisos en la configuración de tu dispositivo.",
        [{ text: "OK" }]
      );
      return;
    }

    // Navegar al escáner QR
    router.push({
      pathname: "/qr-scanner" as any,
      params: { projectId: projectId },
    });
  };

  // Navegar a la lista de grietas
  const handleViewCracks = () => {
    router.push({
      pathname: "/crack-list" as any,
      params: { projectId: projectId },
    });
  };

  // Ver detalles de una grieta específica
  const handleCrackPress = (crack: Crack) => {
    router.push({
      pathname: "/crack-details" as any,
      params: {
        projectId: projectId,
        crackId: crack.id,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Cargando proyecto...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Proyecto no encontrado</Text>
        <UIButton title="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Información del Proyecto */}
        <View style={styles.projectCard}>
          <Text style={styles.projectTitle}>{project.name}</Text>

          {project.description && (
            <Text style={styles.projectDescription}>{project.description}</Text>
          )}

          <View style={styles.projectMeta}>
            <Text style={styles.metaLabel}>ID del Proyecto:</Text>
            <Text style={styles.metaValue}>{projectId}</Text>
          </View>
        </View>

        {/* Resumen de Grietas */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          {cracksLoading ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{cracks.length}</Text>
                <Text style={styles.summaryLabel}>
                  {cracks.length === 1 ? "Grieta" : "Grietas"} Registradas
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Grietas Recientes */}
        {cracks.length > 0 && (
          <View style={styles.recentCracksCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Grietas Recientes</Text>
              <TouchableOpacity onPress={handleViewCracks}>
                <Text style={styles.viewAllLink}>Ver todas →</Text>
              </TouchableOpacity>
            </View>

            {cracks.slice(0, 5).map((crack) => (
              <TouchableOpacity
                key={crack.id}
                style={styles.crackItem}
                onPress={() => handleCrackPress(crack)}
              >
                <View style={styles.crackInfo}>
                  <Text style={styles.crackName}>{crack.name}</Text>
                  <Text style={styles.crackId}>ID: {crack.id}</Text>
                </View>
                <Text style={styles.crackArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mensaje si no hay grietas */}
        {cracks.length === 0 && !cracksLoading && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No hay grietas registradas</Text>
            <Text style={styles.emptyText}>
              Escanea un código QR para registrar tu primera grieta
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botones de Acción */}
      <View style={styles.buttonContainer}>
        <UIButton
          title="Escanear QR para Nueva Grieta"
          onPress={handleScanQR}
          style={{ backgroundColor: "#007bff", marginBottom: 10 }}
        />

        <UIButton
          title="Ver Todas las Grietas"
          onPress={handleViewCracks}
          style={{ backgroundColor: "#28a745", marginBottom: 10 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#dc3545",
    marginBottom: 20,
    textAlign: "center",
  },
  projectCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  projectDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },
  projectMeta: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  metaLabel: {
    fontSize: 14,
    color: "#999",
    marginRight: 8,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#007bff",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  recentCracksCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllLink: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
  },
  crackItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  crackInfo: {
    flex: 1,
  },
  crackName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  crackId: {
    fontSize: 12,
    color: "#999",
  },
  crackArrow: {
    fontSize: 24,
    color: "#ccc",
  },
  emptyCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
});