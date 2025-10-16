import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from 'xlsx';
import UIButton from "@/components/UIButton";
import { projectService } from "@/src/database/projectService";
import { crackService } from "@/src/database/crackService";
import { readingService } from "@/src/database/readingService";

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
  const [isExporting, setIsExporting] = useState(false);

  // Función de carga de proyectos desde SQLite
  const fetchProjects = () => {
    setLoading(true);
    try {
      const data = projectService.getAll();
      setProjects(data as Project[]);
      console.log(`${data.length} proyectos cargados desde SQLite`);
    } catch (error: any) {
      console.error("Error al cargar proyectos:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar los proyectos desde la base de datos local."
      );
    } finally {
      setLoading(false);
    }
  };

  // Recargar proyectos cuando la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [])
  );

  // --- LÓGICA DE EXPORTACIÓN A EXCEL LOCAL ---
  const handleExportPress = async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      console.log('Iniciando exportación local...');

      // Obtener todos los datos de SQLite
      const projectsData = projectService.getAll();
      const cracksData = crackService.getAll();
      const readingsData = readingService.getAll();

      console.log(`Proyectos: ${projectsData.length}, Grietas: ${cracksData.length}, Lecturas: ${readingsData.length}`);

      // Crear workbook
      const wb = XLSX.utils.book_new();

      // Hoja 1: Proyectos
      if (projectsData.length > 0) {
        const wsProjects = XLSX.utils.json_to_sheet(projectsData);
        XLSX.utils.book_append_sheet(wb, wsProjects, "Proyectos");
      }

      // Hoja 2: Grietas
      if (cracksData.length > 0) {
        const wsCracks = XLSX.utils.json_to_sheet(cracksData);
        XLSX.utils.book_append_sheet(wb, wsCracks, "Grietas");
      }

      // Hoja 3: Registros
      if (readingsData.length > 0) {
        const wsReadings = XLSX.utils.json_to_sheet(readingsData);
        XLSX.utils.book_append_sheet(wb, wsReadings, "Registros");
      }

      // Generar archivo en base64
      const wbout = XLSX.write(wb, { type: 'base64', bookType: "xlsx" });
      
      const fileName = `datos_completos_${new Date().toISOString().split("T")[0]}.xlsx`;
      const fileUri = FileSystem.cacheDirectory + fileName;
      
      console.log(`Guardando archivo en: ${fileUri}`);
      
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      console.log('Archivo generado correctamente');

      // Verificar disponibilidad de compartir
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Error",
          "La función de compartir no está disponible en este dispositivo."
        );
        return;
      }

      // Compartir archivo
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Exportar Datos Completos a Excel",
      });

      console.log('Archivo compartido exitosamente');

    } catch (error: any) {
      console.error("Error completo en la exportación:", error);
      Alert.alert(
        "Exportación Fallida",
        `No se pudo generar el archivo Excel: ${error.message}`
      );
    } finally {
      setIsExporting(false);
    }
  };
  // -------------------------------------

  // Función para navegar a la pantalla principal de un proyecto
  const handleProjectPress = (p: Project) => {
    router.push({
      pathname: "/project-main" as any,
      params: {
        projectId: p.id.toString(),
        project: JSON.stringify(p),
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
        <Text style={{ marginTop: 10, color: "#666" }}>
          Cargando proyectos...
        </Text>
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
            No hay proyectos registrados. Crea uno para comenzar.
          </Text>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        {/* Botón para Exportar a Excel */}
        <UIButton
          title={isExporting ? "Exportando..." : "Exportar a Excel"}
          onPress={handleExportPress}
          disabled={isExporting}
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
    backgroundColor: "#f5f5f5",
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