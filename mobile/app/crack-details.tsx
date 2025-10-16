import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import UIButton from '@/components/UIButton';
import { crackService } from '@/src/database/crackService';

// --- TIPOS DE DATOS COMPLETOS (Actualizado con todos los campos del esquema SQL) ---

interface CrackData {
    // Campos Obligatorios (NOT NULL)
    id: string; // TEXT PRIMARY KEY
    project_id: number; // INTEGER NOT NULL
    name: string; // TEXT NOT NULL

    // Localización y Elemento (TEXT/REAL que pueden ser NULL)
    edificio_area: string | null; 
    nivel_cota: string | null;
    muro: string | null;
    cara: string | null;
    gps_lat: number | null;
    gps_lon: number | null;
    elemento_tipo: string | null;
    elemento_material: string | null;
    elemento_espesor_cm: number | null;

    // Características de la Grieta (TEXT/REAL que pueden ser NULL)
    grieta_orientacion: string | null;
    grieta_longitud_visible_m: number | null;
    grieta_ancho_inicial_mm: number | null;
    grieta_clasificacion_preliminar: string | null;

    // Instrumentación (TEXT/REAL que pueden ser NULL)
    instrumentacion_modelo: string | null;
    instrumentacion_n_serie: string | null;
    instrumentacion_resolucion_mm: number | null;
    instrumentacion_eje_x: number | null;
    instrumentacion_eje_y: number | null;
    instrumentacion_lectura_cero: number | null;
    instrumentacion_adhesivo: string | null;

    // Instalación (TEXT que pueden ser NULL)
    instalacion_fecha: string | null;
    instalacion_hora: string | null;
    instalacion_instalador: string | null;
    instalacion_foto: string | null;
    instalacion_observaciones: string | null;

    // Umbrales (REAL que pueden ser NULL)
    umbral_verde_mm_sem: number | null;
    umbral_amarillo_mm_scm: number | null;
    umbral_rojo_mm_scm: number | null;
}

// Interfaz para definir la estructura de los parámetros que esperamos de la URL
interface CrackDetailsParams {
    projectId: string; // ID del proyecto (parámetro de consulta)
    crackId: string;   // ID de la grieta (parámetro de consulta)
}

// Componente auxiliar para mostrar una fila de detalle
const DetailRow = ({ label, value }: { label: string, value: string | number | null | undefined }) => (
    <View style={styles.card}>
        <Text style={styles.label}>{label}:</Text>
        {/* Muestra "N/A" si el valor es null, undefined o una cadena vacía */}
        <Text style={styles.value}>{value === null || value === undefined || value === '' ? 'N/A' : value}</Text>
    </View>
);

export default function CrackDetails() {
    const router = useRouter();
    
    // Leemos y tipamos los parámetros de consulta
    const params = useLocalSearchParams() as unknown as CrackDetailsParams;
    const projectId = params.projectId;
    const crackId = params.crackId;

    const [crackData, setCrackData] = useState<CrackData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCrackDetails = useCallback(async (pId: string, cId: string) => {
        setLoading(true);
        setError('');

        try {
            const crack = await crackService.getById(cId);
            if (!crack) {
                setError(`No se encontró ninguna grieta con ID "${cId}" en la base de datos local.`);
                Alert.alert("Grieta no encontrada", "No existe una grieta con ese ID en la base de datos local.", [
                    { text: "Volver", onPress: () => router.back() }
                ]);
            } else {
                // Actualiza el estado con los detalles de la grieta
                setCrackData(crack);
            }
        } catch (err) {
            console.error("Error al obtener detalles locales:", err);
            setError('Error al obtener los detalles de la grieta desde la base de datos local.');
            Alert.alert("Error de Base de Datos", "Ocurrió un error al consultar los datos locales.", [
                { text: "Volver", onPress: () => router.back() }
            ]);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (!projectId || !crackId) {
            if (!error) {
                setError("Faltan los IDs del proyecto o de la grieta.");
                Alert.alert(
                    "Error", 
                    "Faltan los IDs del proyecto o de la grieta para mostrar detalles.",
                    [{ text: "Volver", onPress: () => router.back() }]
                );
            }
            return;
        }

        fetchCrackDetails(projectId, crackId);

    }, [projectId, crackId, fetchCrackDetails, error, router]);

    // --- RENDERIZADO DE ESTADOS ---

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.header}>Cargando detalles de la grieta...</Text>
            </View>
        );
    }
    
    if (error && !loading) {
         return (
             <View style={styles.loadingContainer}>
                 <Text style={styles.errorText}>{error}</Text>
                 <UIButton title="Regresar" onPress={() => router.back()} style={{ marginTop: 20 }} />
             </View>
         );
    }

    if (!crackData) {
         return <View style={styles.loadingContainer}><Text style={styles.errorText}>No se encontraron datos para la grieta.</Text></View>;
    }
    
    // Función de navegación para crear una nueva lectura
    const handleCreateReading = () => {
        router.push({ 
            pathname: '/reading-create', 
            params: { 
                crackId: crackData.id, 
                projectId: crackData.project_id.toString() 
            } 
        });
    }

    // Función de navegación para crear una nueva lectura
    const handleReaginRecord = () => {
        router.push({ 
            pathname: '/reading-record', 
            params: { 
                crackId: crackData.id, 
                projectId: crackData.project_id.toString() 
            } 
        });
    }

    // --- RENDERIZADO PRINCIPAL (DATOS CARGADOS) ---
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Detalles de la Grieta: {crackData.name}</Text>
            <Text style={styles.subHeader}>ID: {crackData.id}</Text>
            
            {/* SECCIÓN 1: LOCALIZACIÓN */}
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>Ubicación y Elemento</Text>
            </View>
            <DetailRow label="Área / Edificio" value={crackData.edificio_area} />
            <DetailRow label="Muro / Cara" value={`${crackData.muro || 'N/A'} - ${crackData.cara || 'N/A'}`} />
            <DetailRow label="Nivel / Cota" value={crackData.nivel_cota} />
            <DetailRow label="Tipo de Elemento" value={crackData.elemento_tipo} />
            <DetailRow label="Material / Espesor" value={`${crackData.elemento_material || 'N/A'} / ${crackData.elemento_espesor_cm ? `${crackData.elemento_espesor_cm} cm` : 'N/A'}`} />
            <DetailRow label="Coordenadas GPS" value={crackData.gps_lat && crackData.gps_lon ? `${crackData.gps_lat}, ${crackData.gps_lon}` : 'N/A'} />

            {/* SECCIÓN 2: CARACTERÍSTICAS DE LA GRIETA */}
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>Características de la Grieta</Text>
            </View>
            <DetailRow label="Orientación" value={crackData.grieta_orientacion} />
            <DetailRow label="Clasificación Preliminar" value={crackData.grieta_clasificacion_preliminar} />
            <DetailRow label="Longitud Visible" value={crackData.grieta_longitud_visible_m ? `${crackData.grieta_longitud_visible_m} m` : 'N/A'} />
            <DetailRow label="Ancho Inicial" value={crackData.grieta_ancho_inicial_mm ? `${crackData.grieta_ancho_inicial_mm} mm` : 'N/A'} />
            
            {/* SECCIÓN 3: INSTRUMENTACIÓN */}
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>Instrumentación</Text>
            </View>
            <DetailRow label="Modelo / N. Serie" value={`${crackData.instrumentacion_modelo || 'N/A'} / ${crackData.instrumentacion_n_serie || 'N/A'}`} />
            <DetailRow label="Lectura Cero" value={crackData.instrumentacion_lectura_cero} />
            <DetailRow label="Fecha de Instalación" value={crackData.instalacion_fecha} />
            <DetailRow label="Umbrales (Verde/Amarillo/Rojo)" 
                value={`${crackData.umbral_verde_mm_sem || '0'} / ${crackData.umbral_amarillo_mm_scm || '0'} / ${crackData.umbral_rojo_mm_scm || '0'} mm`} 
            />

            <View style={{ marginTop: 20, marginBottom: 40 }}>
                <UIButton 
                    title="Ver historial de registros"
                    onPress={handleReaginRecord}
                />
            </View>
                        
            <View style={{ marginTop: 20, marginBottom: 40 }}>
                <UIButton 
                    title="Registrar Nueva Lectura"
                    onPress={handleCreateReading}
                />
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
        marginBottom: 5,
        color: '#007bff',
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionHeaderContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ced4da',
        paddingBottom: 5,
        marginBottom: 10,
        marginTop: 15,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#495057',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 18,
        borderRadius: 12,
        marginBottom: 10,
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
    readingsPlaceholder: {
        height: 150,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
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
        color: '#dc3545',
        textAlign: 'center',
    }
});
