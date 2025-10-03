import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { api } from '../api/client';
import UIInput from '@/components/UIInput';
import UIButton from '@/components/UIButton';

type ReadingCreateProps = {
  navigation: any;
  route: { params: { crackId: string; project: any } };
};

export default function ReadingCreate({ navigation, route }: ReadingCreateProps) {
  const { crackId } = route.params;
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [nombre_inspector, setNombreInspector] = useState('');
  const [lecturaX, setLecturaX] = useState('');
  const [lecturaY, setLecturaY] = useState('');

  const saveReading = async () => {
    if (!fecha || !hora || !nombre_inspector) return Alert.alert('Validación', 'Completa los campos obligatorios');
    try {
      await api.post('/readings', {
        crack_id: crackId,
        fecha,
        hora,
        nombre_inspector,
        lectura_x: parseFloat(lecturaX),
        lectura_y: parseFloat(lecturaY),
      });
      Alert.alert('Éxito', 'Lectura guardada');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la lectura');
    }
  };

  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <UIInput label="Fecha" value={fecha} onChangeText={setFecha} placeholder="YYYY-MM-DD" />
      <UIInput label="Hora" value={hora} onChangeText={setHora} placeholder="HH:MM" />
      <UIInput label="Nombre Inspector" value={nombre_inspector} onChangeText={setNombreInspector} placeholder="Nombre inspector" />
      <UIInput label="Lectura X" value={lecturaX} onChangeText={setLecturaX} placeholder="X" keyboardType="numeric" />
      <UIInput label="Lectura Y" value={lecturaY} onChangeText={setLecturaY} placeholder="Y" keyboardType="numeric" />
      <UIButton title="Guardar lectura" onPress={saveReading} />
    </ScrollView>
  );
}
