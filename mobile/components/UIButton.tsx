import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, ActivityIndicator } from 'react-native';

// Definición de las propiedades del componente, incluyendo 'disabled' y 'loading'
export type UIButtonProps = {
    title: string;
    // Permite que onPress devuelva void o una Promise<void> para llamadas asíncronas
    onPress: () => void | Promise<void>; 
    style?: StyleProp<ViewStyle>;
    disabled?: boolean; 
    loading?: boolean;  // <--- ¡Propiedad 'loading' agregada aquí!
};

export default function UIButton({ title, onPress, style, disabled = false, loading = false }: UIButtonProps) {
    const isInteracting = disabled || loading;

    return (
        <TouchableOpacity
            onPress={isInteracting ? () => {} : onPress} 
            disabled={isInteracting}
            style={{
                // Cambia el color para indicar que está deshabilitado o cargando
                backgroundColor: isInteracting ? '#a0a0c8' : '#191970', 
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 10,
                alignItems: 'center',
                marginVertical: 6,
                ...(style as object),
            }}
        >
            {loading ? (
                // Muestra el indicador de carga si loading es true
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={{ color: '#fff', fontWeight: '600' }}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}
