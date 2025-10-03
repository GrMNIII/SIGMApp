import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { api } from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import UIButton from '@/components/UIButton';

type Project = {
  id: number;
  name: string;
  description?: string;
};

type ProjectListProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProjectList'>;
};

export default function ProjectList({ navigation }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]); // Tipado

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar los proyectos');
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView>
        {projects.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}
            onPress={() => navigation.navigate('ProjectMain', { project: p })}
          >
            <Text style={{ fontWeight: '600' }}>{p.name}</Text>
            {p.description && <Text>{p.description}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <UIButton title="Registrar proyecto" onPress={() => navigation.navigate('ProjectCreate')} />
    </View>
  );
}
