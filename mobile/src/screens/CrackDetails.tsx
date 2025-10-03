import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { api } from '../api/client';
import UIInput from '@/components/UIInput';
import UIButton from '@/components/UIButton';

type CrackDetailsProps = {
  navigation: any;
  route: { params: { crackId: string; project: any } };
};

export default function CrackDetails({ navigation, route }: CrackDetailsProps) {
  const { crackId, project } = route.params;
  const [crack, setCrack] = useState<any>({});

  const fetchCrack = async () => {
    try {
      const res = await api.get(`/cracks/${crackId}`);
      setCrack(res.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar la grieta');
    }
  };

  const updateCrack = async () => {
    try {
      await api.put(`/cracks/${crackId}`, crack);
      Alert.alert('Éxito', 'Grieta actualizada');
    } catch {
      Alert.alert('Error', 'No se pudo actualizar');
    }
  };

  useEffect(() => { fetchCrack(); }, []);

  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <UIInput label="Nombre" value={crack.name} onChangeText={(text) => setCrack({ ...crack, name: text })} />
      <UIInput label="Edificio / Área" value={crack.edificio_area} onChangeText={(text) => setCrack({ ...crack, edificio_area: text })} />
      <UIInput label="Nivel / Cota" value={crack.nivel_cota} onChangeText={(text) => setCrack({ ...crack, nivel_cota: text })} />
      <UIButton title="Actualizar Grieta" onPress={updateCrack} />
      <UIButton title="Agregar lectura semanal" onPress={() => navigation.navigate('ReadingCreate', { crackId, project })} />
    </ScrollView>
  );
}
