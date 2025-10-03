import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { api } from '../api/client';
import UIInput from '@/components/UIInput';
import UIButton from '@/components/UIButton';

type CrackCreateProps = {
  navigation: any;
  route: { params: { crackId: string; project: any } };
};

export default function CrackCreate({ navigation, route }: CrackCreateProps) {
  const { crackId, project } = route.params;
  const [name, setName] = useState('');
  const [edificio_area, setEdificioArea] = useState('');
  const [nivel_cota, setNivelCota] = useState('');

  const createCrack = async () => {
    if (!name.trim()) return Alert.alert('Validación', 'El nombre es obligatorio');
    try {
      await api.post('/cracks', {
        id: crackId,
        project_id: project.id,
        name,
        edificio_area,
        nivel_cota,
      });
      Alert.alert('Éxito', 'Grieta creada');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo crear la grieta');
    }
  };

  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <UIInput label="Nombre de la grieta" value={name} onChangeText={setName} placeholder="Nombre" />
      <UIInput label="Edificio / Área" value={edificio_area} onChangeText={setEdificioArea} placeholder="Edificio / Área" />
      <UIInput label="Nivel / Cota" value={nivel_cota} onChangeText={setNivelCota} placeholder="Nivel / Cota" />
      <UIButton title="Registrar Grieta" onPress={createCrack} />
    </ScrollView>
  );
}
