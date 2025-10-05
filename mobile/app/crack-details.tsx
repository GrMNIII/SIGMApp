import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import UIButton from '@/components/UIButton';

// Interfaz para definir la estructura de los parámetros que esperamos
interface CrackDetailsParams {
    projectId: string; // ID del proyecto
    crackId: string;   // ID de la grieta cuyos detalles se van a ver
}

export default function CrackDetails() {
    const router = useRouter();
    
    // Usamos aserción doble (unknown -> CrackDetailsParams) para resolver el error de tipo
    // y garantizar que TypeScript nos permita acceder a las propiedades.
    const params = useLocalSearchParams() as unknown as CrackDetailsParams;
    
    // Accedemos a las propiedades que deben venir en la URL
    const projectId = params.projectId;
    const crackId = params.crackId;

    const [crackData, setCrackData] = useState<any>(null); // Datos del detalle de la grieta
    const [loading, setLoading] = useState(false);
    
    // Efecto para simular la carga de detalles de la grieta
    useEffect(() => {
        if (!projectId || !crackId) {
            // Guardia de seguridad si se navega directamente sin IDs
            Alert.alert(
                "Error", 
                "Faltan los IDs del proyecto o de la grieta para mostrar detalles.",
                [{ text: "Volver", onPress: () => router.back() }]
            );
            return;
        }

        setLoading(true);
        console.log(`Cargando detalles de Grieta ID: ${crackId} en Proyecto: ${projectId}`);
        
        // Aquí iría la llamada a tu API para obtener los datos de la grieta:
        // api.get(`/projects/${projectId}/cracks/${crackId}`).then(response => { ... })
        
        // Simulación de carga de datos
        setTimeout(() => {
            setCrackData({
                description: "Grieta detectada en la pared exterior del sector 3.",
                lastReading: "2024-05-15",
                status: "Activa",
                readingsCount: 5,
            });
            setLoading(false);
        }, 1000);
    }, [projectId, crackId]);


    if (!projectId || !crackId) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Error: Datos incompletos.</Text>
            </View>
        );
    }
    
    if (loading || !crackData) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.header}>Cargando detalles de la grieta...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Detalles de la Grieta #{crackId}</Text>
            
            <View style={styles.card}>
                <Text style={styles.label}>Proyecto:</Text>
                <Text style={styles.value}>{projectId}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Descripción:</Text>
                <Text style={styles.value}>{crackData.description}</Text>
            </View>
            
            <View style={styles.card}>
                <Text style={styles.label}>Estado:</Text>
                <Text style={[styles.value, { color: crackData.status === 'Activa' ? '#dc3545' : '#28a745' }]}>
                    {crackData.status}
                </Text>
            </View>
            
            <View style={styles.card}>
                <Text style={styles.label}>Última Lectura:</Text>
                <Text style={styles.value}>{crackData.lastReading}</Text>
                <Text style={styles.hint}>Total de Lecturas Registradas: {crackData.readingsCount}</Text>
            </View>
            
            {/* Botón para añadir una nueva lectura a esta grieta */}
            <UIButton 
                title="Registrar Nueva Lectura"
                onPress={() => router.push({ pathname: '/reading-create', params: { crackId, projectId } })}
            />
            
            {/* Espacio para la lista de lecturas históricas */}
            <View style={styles.readingsPlaceholder}>
                <Text style={styles.placeholderText}>[Placeholder: Lista de lecturas históricas y gráficos]</Text>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#007bff',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 18,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6c757d',
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
        color: '#333',
    },
    hint: {
        fontSize: 12,
        color: '#adb5bd',
        marginTop: 5,
    },
    readingsPlaceholder: {
        height: 200,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#ced4da',
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#6c757d',
        textAlign: 'center',
        padding: 10,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
    }
});
