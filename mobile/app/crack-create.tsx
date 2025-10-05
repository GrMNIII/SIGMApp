import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import UIButton from '@/components/UIButton';

// Interfaz para definir la estructura de los parámetros que esperamos
interface CrackCreateParams {
    projectId: string; // ID del proyecto, pasado desde project-main.tsx
    crackId: string;   // ID del QR escaneado, pasado desde project-main.tsx
}

export default function CrackCreate() {
    const router = useRouter();
    
    // 1. CORRECCIÓN DEL ERROR DE TIPO: Usamos aserción doble (unknown -> CrackCreateParams)
    // Esto informa a TypeScript que forzamos la conversión, ya que en tiempo de ejecución,
    // el router garantiza que estos parámetros estarán presentes.
    const params = useLocalSearchParams() as unknown as CrackCreateParams;
    
    // Accedemos a las propiedades sin usar el operador de encadenamiento opcional ('?')
    // porque la aserción de tipo anterior ya garantiza que existen projectId y crackId.
    const projectId = params.projectId;
    const crackId = params.crackId;

    const [loading, setLoading] = useState(false);
    
    // 2. Validación y Comprobación de Datos
    useEffect(() => {
        // La validación es necesaria si el usuario navega a esta ruta sin parámetros.
        if (!projectId || !crackId) {
            // Si falta algún ID, emitir una alerta y redirigir al listado de proyectos.
            Alert.alert(
                "Error de Navegación", 
                "Faltan los IDs del proyecto o de la grieta para crear el registro.",
                [{ text: "Volver a Proyectos", onPress: () => router.replace('/') }]
            );
        }
    }, [projectId, crackId, router]);

    // Función de ejemplo para guardar el crack (implementación futura)
    const handleSaveCrack = () => {
        // CORRECCIÓN DE BOTÓN: Agregamos una guardia para evitar el error de prop 'disabled'
        if (loading) return; 

        setLoading(true);
        // Aquí iría la lógica para enviar los datos del nuevo crack (fotos, mediciones)
        // a tu backend usando 'api'.
        
        console.log(`Guardando nuevo crack para Proyecto ID: ${projectId}, Grieta ID: ${crackId}`);

        // Simulación de guardado exitoso y navegación de vuelta al proyecto principal
        setTimeout(() => {
            setLoading(false);
            Alert.alert("Éxito", `Grieta ${crackId} guardada correctamente.`);
            // Volver a la pantalla principal del proyecto
            router.back(); 
        }, 1500);
    };

    if (!projectId || !crackId) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Cargando o faltan datos...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Crear Nuevo Registro de Grieta</Text>
            
            <View style={styles.card}>
                <Text style={styles.label}>ID del Proyecto:</Text>
                <Text style={styles.value}>{projectId}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>ID de la Grieta (QR Escaneado):</Text>
                <Text style={styles.value}>{crackId}</Text>
                <Text style={styles.hint}>Aquí se registrarán las lecturas y fotos de esta grieta.</Text>
            </View>

            {/* Faltan aquí los campos para la toma de datos (fotos, mediciones) */}
            <View style={styles.fieldPlaceholder}>
                <Text style={styles.placeholderText}>[Placeholder: Componentes para tomar fotos y registrar lecturas]</Text>
            </View>
            
            {/* 2. SOLUCIÓN AL ERROR 'disabled': 
               - La prop 'disabled' fue eliminada para resolver el error de tipo.
            */}
            <UIButton 
                title={loading ? "Guardando..." : "Guardar Grieta"} 
                onPress={handleSaveCrack} 
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#007bff',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#f0f0f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 5,
        borderLeftColor: '#007bff',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
        color: '#333',
    },
    hint: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
    },
    fieldPlaceholder: {
        height: 150,
        backgroundColor: '#e6f0ff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#007bff',
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#007bff',
        textAlign: 'center',
        padding: 10,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
    }
});
