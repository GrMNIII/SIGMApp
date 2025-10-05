import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native'; // <-- Importamos Platform
import { useLocalSearchParams, useRouter, useRootNavigationState } from 'expo-router'; // <-- Importado useRootNavigationState
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
// import { api } from '../src/api/client'; // <-- Importación 'api' eliminada
import UIButton from '@/components/UIButton';

// Componente utilitario para manejar la CameraView y los permisos.
const CameraViewComponent = ({ onBarcodeScanned, isNative }: { onBarcodeScanned: (event: BarcodeScanningResult) => void, isNative: boolean }) => {
    const [permission, requestPermission] = useCameraPermissions();
    
    // Si no es nativo (sólo Web), devolvemos un mensaje seguro
    // NOTA: Para pruebas en Expo Go en iOS/Android físico, isNative se fuerza a TRUE en ProjectMain.
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
        // La cámara aún no ha cargado los permisos
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#007bff" /></View>;
    }

    if (!permission.granted) {
        // Permisos denegados
        return (
            <View style={styles.scannerFallback}>
                <Text style={styles.scannerText}>
                    Se requieren permisos de cámara para escanear QR.
                </Text>
                <UIButton title="Solicitar Permiso" onPress={requestPermission} />
            </View>
        );
    }

    // CameraView requiere los tipos de código de barras para el escaneo
    return (
        <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={onBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }} // Corregido a string literal 'qr'
        />
    );
};

type Project = {
    id: number;
    name: string;
    description: string;
};

export default function ProjectMain() {
    const router = useRouter();
    const navigationState = useRootNavigationState(); // <-- Hook para obtener el estado de navegación
    const params = useLocalSearchParams();
    
    // Obtenemos el objeto project de los parámetros
    const project: Project | null = params.project ? JSON.parse(params.project as string) : null;
    
    // Estado para controlar que solo escaneemos un código por vista
    const [scanned, setScanned] = useState(false);
    
    // Detectar si estamos en un entorno nativo (no web)
    const [isNative, setIsNative] = useState(false);
    
    useEffect(() => {
        // SOLUCIÓN TEMPORAL PARA PROBAR EN EXPO GO:
        // Si estamos en un entorno móvil (iOS o Android), forzamos isNative a true.
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            setIsNative(true);
        }
        
        // Si el proyecto es nulo (navegación incorrecta), volver
        if (!project) {
            Alert.alert("Error de Proyecto", "No se encontró la información del proyecto.");
            router.replace('/'); 
        }
    }, [project, router]);

    // Función que se dispara al escanear un código de barras
    const handleBarCodeScanned = useCallback(async ({ data }: BarcodeScanningResult) => {
        if (!scanned) {
            setScanned(true); // Bloquear futuros escaneos inmediatamente
            
            // 1. Validar datos del QR. Asumimos que 'data' es el ID del crack.
            const crackId = data.trim();
            if (!crackId) {
                Alert.alert("Error QR", "El código QR escaneado no contenía datos válidos.");
                setScanned(false); // Reabrir el escáner
                return;
            }

            // 2. Navegación Segura: Usamos navigationState?.key para garantizar que el stack esté montado.
            // Si el navigationState tiene una key, el router está listo.
            if (navigationState?.key) {
                router.push({
                    pathname: '/crack-create',
                    params: { 
                        // Corregido: Pasar el ID del proyecto y el ID del crack
                        projectId: project?.id.toString() || '', 
                        crackId: crackId
                    },
                });
            } else {
                // Si el router no está listo, emitimos una advertencia y reestablecemos el escáner.
                console.warn("Router no está listo para navegar después del escaneo. Reintentando...");
                setScanned(false);
            }
        }
    }, [scanned, router, project, navigationState]); // <-- Agregada dependencia navigationState

    if (!project) {
        return <View style={styles.loadingContainer}><Text>Cargando...</Text></View>;
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
                    title="Ver Cracks Existentes" 
                    onPress={() => router.push({ pathname: '/crack-details', params: { projectId: project.id.toString() }})} 
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
