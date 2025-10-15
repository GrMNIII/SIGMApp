import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
// import * as FileSystem from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import UIButton from "@/components/UIButton";
import { api, BASE_URL } from "@/src/api/client";

// Tipado para el Project con ID como number
type Project = {
  id: number;
  name: string;
  description?: string;
};

export default function ProjectList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false); // Estado para la exportación

  // Función de carga de proyectos
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (error: any) {
      console.error("Error al cargar proyectos:", error);
      // Mostrar un mensaje de error más claro al usuario
      Alert.alert(
        "Error de Conexión",
        "No se pudieron cargar los proyectos. Revisa tu conexión de red o la URL del backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE EXPORTACIÓN A CSV ---
  const handleExportPress = async () => {
    if (isExporting) return;

    setIsExporting(true);

    const exportUrl = `${BASE_URL}/projects/export`;
    const fileName = `proyectos_${new Date().toISOString().split("T")[0]}.csv`;

    const fileUri = FileSystem.cacheDirectory + fileName;

    console.log(`Iniciando descarga de: ${exportUrl}`);

    try {
      const downloadResponse = await FileSystem.downloadAsync(
        exportUrl,
        fileUri
      );

      if (downloadResponse.status !== 200) {
        Alert.alert(
          "Error de Exportación",
          `El servidor devolvió un error: ${downloadResponse.status}`
        );
        return;
      }

      console.log(`Archivo descargado en: ${downloadResponse.uri}`);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Error",
          "La función de compartir no está disponible en este dispositivo."
        );
        return;
      }

      await Sharing.shareAsync(downloadResponse.uri, {
        mimeType: "text/csv",
        dialogTitle: "Exportar Proyectos CSV",
      });
    } catch (error: any) {
      console.error("Error completo en la exportación:", error);
      Alert.alert(
        "Exportación Fallida",
        "No se pudo generar ni descargar el archivo CSV."
      );
    } finally {
      setIsExporting(false);
    }
  };
  // -------------------------------------

  // Cargamos los proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Función para navegar a la pantalla principal de un proyecto
  const handleProjectPress = (p: Project) => {
    // CORRECCIÓN CLAVE: Usamos la ruta estática /project-main y pasamos el ID como parámetro
    router.push({
      pathname: "/project-main" as any, // Ruta estática
      params: {
        projectId: p.id.toString(), // ID del proyecto (se lee en project-main.tsx)
        project: JSON.stringify(p), // Objeto pre-cargado (optimización)
      },
    });
  };

  // Función para navegar a la pantalla de creación
  const handleCreatePress = () => {
    router.push("/project-create");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.listContainer}>
        {projects.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.projectItem}
            onPress={() => handleProjectPress(p)}
          >
            <Text style={styles.projectTitle}>{p.name}</Text>
            {p.description && (
              <Text style={styles.projectDescription}>{p.description}</Text>
            )}
          </TouchableOpacity>
        ))}
        {projects.length === 0 && (
          <Text style={styles.emptyText}>
            No hay proyectos registrados. Crea uno.
          </Text>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        {/* Botón para Exportar Proyectos */}
        <UIButton
          title={isExporting ? "Exportando..." : "Exportar Proyectos a CSV"}
          onPress={handleExportPress}
          disabled={isExporting} // Deshabilitar durante la exportación
          // Estilo secundario para diferenciar
          style={{
            backgroundColor: isExporting ? "#ffc107" : "#28a745",
            marginBottom: 10,
          }}
        />

        <UIButton
          title="Registrar nuevo proyecto"
          onPress={handleCreatePress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    flex: 1,
  },
  projectItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  projectDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  buttonContainer: {
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
});
