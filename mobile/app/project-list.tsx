import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../src/api/client";
import UIButton from "@/components/UIButton";

// Tipado para el Project con ID como number
type Project = {
  id: number;
  name: string;
  description?: string;
};

export default function ProjectList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true); // Funcion para obtener los proyectos

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (error: any) {
      console.log("Error al cargar proyectos:", error);
    } finally {
      setLoading(false);
    }
  }; // Cargamos los proyectos al montar el componente

  useEffect(() => {
    fetchProjects();
  }, []); // Función para navegar a la pantalla principal de un proyecto

  const handleProjectPress = (p: Project) => {
    // CORRECCIÓN CLAVE: Usamos la ruta estática /project-main y pasamos el ID como parámetro
    router.push({
      pathname: "/project-main" as any, // Ruta estática
      params: {
        projectId: p.id.toString(), // ID del proyecto (se lee en project-main.tsx)
        project: JSON.stringify(p), // Objeto pre-cargado (optimización)
      },
    });
  }; // Función para navegar a la pantalla de creación

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
        
        <UIButton title="Registrar proyecto" onPress={handleCreatePress} />
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
