import React, { useState } from 'react';
import { View, Alert, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router'; 
import { api } from '@/src/api/client';
import UIInput from '@/components/UIInput';
import UIButton from '@/components/UIButton'; 

// ID como number para coincidir con la respuesta real de la DB/API
interface CreatedProject {
    id: number; 
    name: string;
    description: string;
}

export default function ProjectCreate() {
    const router = useRouter(); 
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const create = async () => {
        if (loading) return;
        if (!name.trim()) return Alert.alert('Validación', 'El nombre es obligatorio');
        
        setLoading(true);
        try {
            const res = await api.post('/projects', { name, description });
            
            const newProject = res.data as CreatedProject; 
            
            // CORRECCIÓN CLAVE: Redirige a la ruta estática /project-main
            router.replace({ 
                pathname: '/project-main' as any,
                params: {
                    projectId: newProject.id.toString(), 
                    project: JSON.stringify(newProject), 
                }
            }); 

        } catch (error) {
            console.error("Error al crear proyecto:", error);
            Alert.alert('Error', 'No se pudo crear el proyecto. Revisa la consola y el estado de tu backend.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Registrar Nuevo Proyecto</Text>
            <UIInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre del proyecto" />
            <UIInput label="Descripción" value={description} onChangeText={setDescription} placeholder="Descripción (opcional)" multiline />
            
            <UIButton 
                title={loading ? "Creando..." : "Crear Proyecto"} 
                onPress={create} 
                loading={loading} 
                disabled={loading || !name.trim()} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#007bff',
        textAlign: 'center',
    },
});