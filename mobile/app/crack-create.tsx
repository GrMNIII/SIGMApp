import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import UIButton from '@/components/UIButton';
import { api } from '@/src/api/client';

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

// Interfaz para definir la estructura de los parámetros que esperamos
interface CrackCreateParams {
    projectId: string; // ID del proyecto, pasado desde project-main.tsx
    crackId: string;   // ID del QR escaneado, pasado desde project-main.tsx
}

// Estado inicial para los campos de la nueva grieta (todo nulo excepto IDs)
const initialNewCrackState: Omit<CrackData, 'id' | 'project_id'> = {
    name: '',
    edificio_area: null, nivel_cota: null, muro: null, cara: null,
    gps_lat: null, gps_lon: null, elemento_tipo: null, elemento_material: null,
    elemento_espesor_cm: null, grieta_orientacion: null, grieta_longitud_visible_m: null,
    grieta_ancho_inicial_mm: null, grieta_clasificacion_preliminar: null,
    instrumentacion_modelo: null, instrumentacion_n_serie: null,
    instrumentacion_resolucion_mm: null, instrumentacion_eje_x: null,
    instrumentacion_eje_y: null, instrumentacion_lectura_cero: null,
    instrumentacion_adhesivo: null, instalacion_fecha: null, instalacion_hora: null,
    instalacion_instalador: null, instalacion_foto: null, instalacion_observaciones: null,
    umbral_verde_mm_sem: null, umbral_amarillo_mm_scm: null, umbral_rojo_mm_scm: null,
};


// Componente auxiliar para manejar la entrada de texto/número
interface FormInputProps {
    label: string;
    value: string | number | null;
    onChange: (text: string) => void;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    required?: boolean;
}

const FormInput = ({ label, value, onChange, keyboardType = 'default', required = false }: FormInputProps) => (
    <View style={formStyles.inputGroup}>
        <Text style={formStyles.label}>{label}{required && <Text style={{ color: 'red' }}>*</Text>}</Text>
        <TextInput
            style={formStyles.input}
            value={typeof value === 'number' ? value.toString() : (value || '')}
            onChangeText={onChange}
            keyboardType={keyboardType}
            placeholder={`Ingresar ${label.toLowerCase()}`}
        />
    </View>
);

export default function CrackCreate() {
    const router = useRouter();
    
    // Leemos y tipamos los parámetros de consulta
    const params = useLocalSearchParams() as unknown as CrackCreateParams;
    const projectId = params.projectId;
    const crackId = params.crackId;

    const [loading, setLoading] = useState(true); // Empezamos cargando para la verificación
    const [existsCheckDone, setExistsCheckDone] = useState(false);
    const [newCrackData, setNewCrackData] = useState<Omit<CrackData, 'id' | 'project_id'> | null>(null);
    const [error, setError] = useState('');


    // Función genérica para manejar cambios en el formulario
    const handleInputChange = (key: keyof typeof initialNewCrackState, text: string) => {
        setNewCrackData(prev => {
            if (!prev) return null;
            
            const isNumeric = [
                'gps_lat', 'gps_lon', 'elemento_espesor_cm', 'grieta_longitud_visible_m',
                'grieta_ancho_inicial_mm', 'instrumentacion_resolucion_mm', 'instrumentacion_eje_x',
                'instrumentacion_eje_y', 'instrumentacion_lectura_cero', 'umbral_verde_mm_sem',
                'umbral_amarillo_mm_scm', 'umbral_rojo_mm_scm'
            ].includes(key as string);
            
            let newValue: string | number | null = text.trim() === '' ? null : text;
            
            if (isNumeric && newValue !== null) {
                // Intenta parsear a número, si falla, mantén el string para que el usuario pueda corregir
                const num = parseFloat(newValue);
                newValue = isNaN(num) ? text : num;
            }
            
            return { ...prev, [key]: newValue };
        });
    };

    // Función para verificar si la grieta existe
    const checkCrackExistence = useCallback(async (cId: string) => {
        setLoading(true);
        try {
            // Intentamos obtener la grieta por su ID
            await api.get(`/cracks/${cId}`);
            
            // Si la llamada es exitosa (código 200), la grieta existe
            Alert.alert(
                "Grieta Existente",
                `La grieta con ID "${cId}" ya existe. Serás redirigido a sus detalles.`,
                [{ 
                    text: "Ver Detalles", 
                    onPress: () => router.replace({
                        pathname: '/crack-details',
                        params: { projectId: projectId, crackId: cId }
                    }) 
                }]
            );
            
        } catch (err: any) {
            // Si el error tiene una respuesta 404 (Not Found), procedemos con la creación
            if (err.response && err.response.status === 404) {
                setNewCrackData(initialNewCrackState); // Inicializa el estado para el formulario
                setExistsCheckDone(true);
            } else {
                // Otro error de API
                console.error("Error al verificar existencia:", err);
                setError('Error al verificar la existencia de la grieta. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    }, [projectId, router]);

    useEffect(() => {
        if (!projectId || !crackId) {
            Alert.alert(
                "Error de Navegación", 
                "Faltan los IDs del proyecto o de la grieta.",
                [{ text: "Volver a Proyectos", onPress: () => router.replace('/') }]
            );
            return;
        }
        checkCrackExistence(crackId);
    }, [projectId, crackId, checkCrackExistence, router]);

    // Función principal para guardar la nueva grieta
    const handleSaveCrack = async () => {
        if (!newCrackData || !newCrackData.name) {
            Alert.alert("Error de Formulario", "El campo 'Nombre de la Grieta' es obligatorio.");
            return;
        }

        setLoading(true);
        
        // Creamos el objeto final de datos, incluyendo los IDs
        const crackPayload: CrackData = {
            id: crackId,
            project_id: parseInt(projectId),
            ...newCrackData,
        } as CrackData; // Forzamos la aserción ya que hemos validado los campos obligatorios

        // Limpiamos los valores nulos para no enviar claves innecesarias
        const cleanedPayload: Record<string, any> = {};
        for (const key in crackPayload) {
            const value = crackPayload[key as keyof CrackData];
            if (value !== null && value !== undefined && value !== '') {
                cleanedPayload[key] = value;
            }
        }

        try {
            // Enviamos los datos al endpoint POST /cracks
            await api.post('/cracks', cleanedPayload);
            
            Alert.alert("Éxito", `Grieta "${newCrackData.name}" (${crackId}) registrada correctamente.`);
            
            // Navegamos al listado de cracks para ver el nuevo registro
            router.replace({
                pathname: '/crack-list' as any,
                params: { projectId: projectId }
            });

        } catch (err) {
            console.error("Error al crear grieta:", err);
            Alert.alert("Error de Creación", "Hubo un problema al guardar la nueva grieta en el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERIZADO DE ESTADOS ---

    if (loading || !existsCheckDone || !newCrackData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.header}>Verificando existencia de la grieta {crackId}...</Text>
                {error && <Text style={styles.errorText}>{error}</Text>}
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
    
    // --- RENDERIZADO PRINCIPAL (Formulario) ---

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView style={styles.container}>
                <Text style={styles.header}>Registrar Nueva Grieta</Text>
                
                {/* IDs Clave */}
                <View style={formStyles.keyInfoCard}>
                    <Text style={formStyles.label}>ID Proyecto:</Text>
                    <Text style={formStyles.value}>{projectId}</Text>
                    <Text style={formStyles.label}>ID Grieta (QR):</Text>
                    <Text style={formStyles.value}>{crackId}</Text>
                </View>

                {/* CAMPO OBLIGATORIO: NOMBRE */}
                <FormInput
                    label="Nombre de la Grieta"
                    value={newCrackData.name}
                    onChange={(text) => handleInputChange('name', text)}
                    required
                />
                
                {/* SECCIÓN 1: LOCALIZACIÓN */}
                <View style={formStyles.sectionHeaderContainer}>
                    <Text style={formStyles.sectionHeader}>1. Localización</Text>
                </View>
                <FormInput label="Edificio/Área" value={newCrackData.edificio_area} onChange={(text) => handleInputChange('edificio_area', text)} />
                <FormInput label="Nivel/Cota" value={newCrackData.nivel_cota} onChange={(text) => handleInputChange('nivel_cota', text)} />
                <FormInput label="Muro" value={newCrackData.muro} onChange={(text) => handleInputChange('muro', text)} />
                <FormInput label="Cara" value={newCrackData.cara} onChange={(text) => handleInputChange('cara', text)} />
                <FormInput label="GPS Latitud" value={newCrackData.gps_lat} onChange={(text) => handleInputChange('gps_lat', text)} keyboardType="numeric" />
                <FormInput label="GPS Longitud" value={newCrackData.gps_lon} onChange={(text) => handleInputChange('gps_lon', text)} keyboardType="numeric" />
                
                {/* SECCIÓN 2: ELEMENTO */}
                <View style={formStyles.sectionHeaderContainer}>
                    <Text style={formStyles.sectionHeader}>2. Elemento Estructural</Text>
                </View>
                <FormInput label="Tipo de Elemento" value={newCrackData.elemento_tipo} onChange={(text) => handleInputChange('elemento_tipo', text)} />
                <FormInput label="Material" value={newCrackData.elemento_material} onChange={(text) => handleInputChange('elemento_material', text)} />
                <FormInput label="Espesor (cm)" value={newCrackData.elemento_espesor_cm} onChange={(text) => handleInputChange('elemento_espesor_cm', text)} keyboardType="numeric" />

                {/* SECCIÓN 3: CARACTERÍSTICAS DE LA GRIETA */}
                <View style={formStyles.sectionHeaderContainer}>
                    <Text style={formStyles.sectionHeader}>3. Grieta</Text>
                </View>
                <FormInput label="Orientación" value={newCrackData.grieta_orientacion} onChange={(text) => handleInputChange('grieta_orientacion', text)} />
                <FormInput label="Clasificación Preliminar" value={newCrackData.grieta_clasificacion_preliminar} onChange={(text) => handleInputChange('grieta_clasificacion_preliminar', text)} />
                <FormInput label="Longitud Visible (m)" value={newCrackData.grieta_longitud_visible_m} onChange={(text) => handleInputChange('grieta_longitud_visible_m', text)} keyboardType="numeric" />
                <FormInput label="Ancho Inicial (mm)" value={newCrackData.grieta_ancho_inicial_mm} onChange={(text) => handleInputChange('grieta_ancho_inicial_mm', text)} keyboardType="numeric" />

                {/* SECCIÓN 4: INSTRUMENTACIÓN */}
                <View style={formStyles.sectionHeaderContainer}>
                    <Text style={formStyles.sectionHeader}>4. Instrumentación</Text>
                </View>
                <FormInput label="Modelo" value={newCrackData.instrumentacion_modelo} onChange={(text) => handleInputChange('instrumentacion_modelo', text)} />
                <FormInput label="N. Serie" value={newCrackData.instrumentacion_n_serie} onChange={(text) => handleInputChange('instrumentacion_n_serie', text)} />
                <FormInput label="Resolución (mm)" value={newCrackData.instrumentacion_resolucion_mm} onChange={(text) => handleInputChange('instrumentacion_resolucion_mm', text)} keyboardType="numeric" />
                <FormInput label="Eje X" value={newCrackData.instrumentacion_eje_x} onChange={(text) => handleInputChange('instrumentacion_eje_x', text)} keyboardType="numeric" />
                <FormInput label="Eje Y" value={newCrackData.instrumentacion_eje_y} onChange={(text) => handleInputChange('instrumentacion_eje_y', text)} keyboardType="numeric" />
                <FormInput label="Lectura Cero" value={newCrackData.instrumentacion_lectura_cero} onChange={(text) => handleInputChange('instrumentacion_lectura_cero', text)} keyboardType="numeric" />
                <FormInput label="Adhesivo" value={newCrackData.instrumentacion_adhesivo} onChange={(text) => handleInputChange('instrumentacion_adhesivo', text)} />

                {/* SECCIÓN 5: INSTALACIÓN */}
                <View style={formStyles.sectionHeaderContainer}>
                    <Text style={formStyles.sectionHeader}>5. Instalación</Text>
                </View>
                {/* Nota: Idealmente usar DatePicker/TimePicker */}
                <FormInput label="Fecha de Instalación" value={newCrackData.instalacion_fecha} onChange={(text) => handleInputChange('instalacion_fecha', text)} />
                <FormInput label="Hora de Instalación" value={newCrackData.instalacion_hora} onChange={(text) => handleInputChange('instalacion_hora', text)} />
                <FormInput label="Instalador" value={newCrackData.instalacion_instalador} onChange={(text) => handleInputChange('instalacion_instalador', text)} />
                {/* Nota: instalacion_foto requeriría un componente de cámara/galería */}
                <FormInput label="Observaciones" value={newCrackData.instalacion_observaciones} onChange={(text) => handleInputChange('instalacion_observaciones', text)} />

                {/* SECCIÓN 6: UMBRALES */}
                <View style={formStyles.sectionHeaderContainer}>
                    <Text style={formStyles.sectionHeader}>6. Umbrales de Alerta (mm)</Text>
                </View>
                <FormInput label="Umbral Verde" value={newCrackData.umbral_verde_mm_sem} onChange={(text) => handleInputChange('umbral_verde_mm_sem', text)} keyboardType="numeric" />
                <FormInput label="Umbral Amarillo" value={newCrackData.umbral_amarillo_mm_scm} onChange={(text) => handleInputChange('umbral_amarillo_mm_scm', text)} keyboardType="numeric" />
                <FormInput label="Umbral Rojo" value={newCrackData.umbral_rojo_mm_scm} onChange={(text) => handleInputChange('umbral_rojo_mm_scm', text)} keyboardType="numeric" />

                
                <View style={{ marginTop: 20, marginBottom: 50 }}>
                    <UIButton 
                        title={loading ? "Guardando..." : "Guardar Grieta"} 
                        onPress={handleSaveCrack} 
                    />
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
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
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#007bff',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
    }
});

// Estilos específicos del formulario
const formStyles = StyleSheet.create({
    keyInfoCard: {
        backgroundColor: '#e6f0ff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: '#007bff',
    },
    sectionHeaderContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ced4da',
        paddingBottom: 5,
        marginBottom: 15,
        marginTop: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#495057',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 0,
        marginBottom: 10,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
});
