import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useRootNavigationState } from 'expo-router';
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import UIButton from '@/components/UIButton';
import { api } from '@/src/api/client';

// Componente utilitario para manejar la CameraView y los permisos.
const CameraViewComponent = ({ onBarcodeScanned, isNative }: { onBarcodeScanned: (event: BarcodeScanningResult) => void, isNative: boolean }) => {
    const [permission, requestPermission] = useCameraPermissions();
    
    // ... Lógica de comprobación de permisos y fallback ...
    
    if (!isNative) { 
        return (
            <View style={styles.scannerFallback}>
                <Text style={styles.scannerText}>
                    La funcionalidad de escaneo solo está disponible en dispositivos móviles.
                </Text>
            </View>
        );
    }

    if (!permission) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#007bff" /></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.scannerFallback}>
                <Text style={styles.scannerText}>
                    Se requieren permisos de cámara para escanear QR.
                </Text>
                <UIButton 
                    title="Solicitar Permiso" 
                    onPress={async () => { await requestPermission(); }} 
                />
            </View>
        );
    }

    return (
        <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={onBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }} 
        />
    );
};

// Interfaz para la estructura del proyecto.
type Project = {
    id: number;
    name: string;
    description: string;
};

// Interfaz para los parámetros esperados de la URL (query parameters)
interface ProjectMainParams {
    projectId: string; // Se lee del parámetro de consulta
    project?: string; 
}

export default function ProjectMain() {
    const router = useRouter();
    const navigationState = useRootNavigationState();
    
    // Leemos los parámetros de consulta (query parameters)
    const params = useLocalSearchParams() as unknown as ProjectMainParams;
    const projectId = params.projectId;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [scanned, setScanned] = useState(false);
    const [isNative, setIsNative] = useState(false);
    
    const fetchProjectDetails = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/projects/${id}`);
            setProject(response.data); 
        } catch (error) {
            console.error("Error al cargar detalles del proyecto:", error);
            Alert.alert("Error de Carga", "No se pudo obtener el proyecto. Verifique el servidor o el ID.");
            router.replace('/project-list' as any); 
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            setIsNative(true);
        }
        
        if (projectId) {
            // Si el objeto project viene serializado, lo usamos 
            if (params.project) {
                setProject(JSON.parse(params.project));
                setLoading(false);
            } else {
                // Si solo tenemos el ID (ej: recarga), cargamos de la API
                fetchProjectDetails(projectId);
            }
        } else {
            // Error si no se proporcionó el ID
            Alert.alert("Error de Proyecto", "Falta el ID del proyecto.");
            router.replace('/project-list' as any); 
        }
    }, [projectId, params.project, router, fetchProjectDetails]);

    /**
     * Función que se dispara al escanear un código de barras.
     * 1. Verifica si la grieta ya existe.
     * 2. Redirige a 'reading-create' (si existe) o a 'crack-create' (si no existe).
     */
    const handleBarCodeScanned = useCallback(async ({ data }: BarcodeScanningResult) => {
        if (!scanned && project) {
            setScanned(true); 
            
            const crackId = data.trim();
            if (!crackId) {
                Alert.alert("Error QR", "El código QR escaneado no contenía datos válidos.");
                setScanned(false);
                return;
            }

            if (!navigationState?.key) {
                console.warn("Router no está listo para navegar después del escaneo. Reintentando...");
                setScanned(false);
                return;
            }

            const navParams = { 
                projectId: project.id.toString(), 
                crackId: crackId
            };

            let destinationPath = '/crack-create' as any; // Destino por defecto: crear grieta
            
            try {
                // 1. Intentar obtener la grieta
                await api.get(`/cracks/${crackId}`);
                
                // 2. Si tiene éxito (código 200), la grieta existe: redirigir a crear LECTURA
                Alert.alert("Grieta Encontrada", `La grieta ${crackId} ya existe. Registrando nueva lectura.`);
                destinationPath = '/reading-create' as any; 
                
            } catch (error: any) {
                // Si el error es 404 (Not Found), la grieta NO existe: mantener destino a crear GRIETA
                if (error.response && error.response.status === 404) {
                    Alert.alert("Nueva Grieta", `El ID ${crackId} no existe. Creando nueva grieta.`);
                    // destinationPath ya es '/crack-create', no se necesita cambiar
                } else {
                    // Manejar otros errores de red o servidor
                    console.error("Error al verificar la grieta:", error);
                    Alert.alert("Error de Verificación", "Hubo un problema de conexión al verificar la grieta. Intente de nuevo.");
                    setScanned(false); // Permitir reintento de escaneo
                    return;
                }
            }

            // Redirigir al destino final
            router.push({
                pathname: destinationPath, 
                params: navParams,
            });
        }
    }, [scanned, router, project, navigationState]);

    if (loading || !project) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#191970" /></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.projectHeader}>Proyecto: {project.name}</Text>
            <Text style={styles.projectSubHeader}>{project.description}</Text>
            
            <View style={styles.scannerContainer}>
                <CameraViewComponent 
                    onBarcodeScanned={handleBarCodeScanned}
                    isNative={isNative}
                />
            </View>
            
            <View style={styles.buttonContainer}>
                <UIButton 
                    title="Ver Grietas Existentes" 
                    onPress={() => router.push({
                        pathname: '/crack-list' as any, 
                        params: { projectId: project.id.toString() }
                    })} 
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    projectHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    projectSubHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    scannerContainer: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },
    camera: {
        flex: 1,
    },
    scannerFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
        padding: 20,
        borderRadius: 10,
    },
    scannerText: {
        textAlign: 'center',
        marginBottom: 15,
        color: '#555',
    },
    buttonContainer: {
        paddingVertical: 10,
    }
});
