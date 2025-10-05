import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { api } from '../src/api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import UIInput from '@/components/UIInput';
import UIButton from '@/components/UIButton';
import { RootStackParamList } from '@/App';

type ProjectCreateProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProjectCreate'>;
};

export default function ProjectCreate({ navigation }: ProjectCreateProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const create = async () => {
    if (!name.trim()) return Alert.alert('Validación', 'El nombre es obligatorio');
    try {
      const res = await api.post('/projects', { name, description });
      navigation.navigate('ProjectMain', { project: res.data });
    } catch {
      Alert.alert('Error', 'No se pudo crear el proyecto');
    }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <UIInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre del proyecto" />
      <UIInput label="Descripción" value={description} onChangeText={setDescription} placeholder="Descripción (opcional)" multiline />
      <UIButton title="Crear" onPress={create} />
    </View>
  );
}
