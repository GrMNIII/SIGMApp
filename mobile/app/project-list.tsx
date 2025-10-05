import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // <-- Usamos useRouter de expo-router
import { api } from '../src/api/client';
// Ya no necesitamos las importaciones de React Navigation
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../App'; 
import UIButton from '@/components/UIButton';

// Tipado para el Project
type Project = {
    id: number;
    name: string;
    description?: string;
};

// Ya no necesitamos las props de navegación
// type ProjectListProps = {
//     navigation: NativeStackNavigationProp<RootStackParamList, 'ProjectList'>;
// };

export default function ProjectList() {
    const router = useRouter(); // <-- Inicializamos el hook useRouter aquí
    const [projects, setProjects] = useState<Project[]>([]); 

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (error: any) {
            // Un error de red aquí podría ser la IP incorrecta.
            console.log("Error al cargar proyectos:", error); 
        }
    };

    useEffect(() => { 
        fetchProjects(); 
    }, []);

    const handleProjectPress = (p: Project) => {
        // Usamos router.push y pasamos el objeto Project como parámetro stringificado
        router.push({ 
            pathname: '/project-main', 
            params: { project: JSON.stringify(p) } 
        });
    };

    const handleCreatePress = () => {
        // Navegamos a la ruta de creación
        router.push('/project-create');
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.listContainer}>
                {projects.map((p) => (
                    <TouchableOpacity
                        key={p.id}
                        style={styles.projectItem}
                        onPress={() => handleProjectPress(p)} // <-- Usamos la función de router
                    >
                        <Text style={styles.projectTitle}>{p.name}</Text>
                        {p.description && <Text style={styles.projectDescription}>{p.description}</Text>}
                    </TouchableOpacity>
                ))}
                {projects.length === 0 && (
                    <Text style={styles.emptyText}>No hay proyectos registrados. Crea uno.</Text>
                )}
            </ScrollView>
            
            <View style={styles.buttonContainer}>
                <UIButton title="Registrar proyecto" onPress={handleCreatePress} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        flex: 1,
    },
    projectItem: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderLeftWidth: 5,
        borderLeftColor: '#007bff',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    projectDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    buttonContainer: {
        paddingVertical: 10,
        backgroundColor: '#f5f5f5',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#888',
    }
});
