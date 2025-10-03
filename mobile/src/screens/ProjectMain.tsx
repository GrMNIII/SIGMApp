import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { api } from '../api/client';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import UIButton from '@/components/UIButton';

type Crack = {
  id: string;
  name: string;
  project_id: number;
  edificio_area?: string;
  nivel_cota?: string;
};

type ProjectMainProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProjectMain'>;
  route: RouteProp<RootStackParamList, 'ProjectMain'>;
};

export default function ProjectMain({ navigation, route }: ProjectMainProps) {
  const { project } = route.params;
  const [cracks, setCracks] = useState<Crack[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);

  const fetchCracks = async () => {
    try {
      const res = await api.get(`/cracks?projectId=${project.id}`);
      setCracks(res.data);
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar las grietas');
    }
  };

  useEffect(() => {
    fetchCracks();
  }, []);

  const askPermission = async (): Promise<void> => {
    try {
      const { status }: { status: string } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara');
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', 'No se pudo solicitar permiso a la cámara');
    }
  };

  const onScanPress = async () => {
    if (hasPermission === null) await askPermission();
    setScanning(true);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanning(false);
    const id = data.trim();
    try {
      await api.get(`/cracks/${id}`);
      navigation.navigate('CrackDetails', { crackId: id, project });
    } catch {
      navigation.navigate('CrackCreate', { crackId: id, project });
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>{project.name}</Text>
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <UIButton title="Escanear QR" onPress={onScanPress} />
      </View>
      {scanning ? (
        <View style={{ flex: 1 }}>
          <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={{ flex: 1 }} />
          <UIButton title="Cancelar" onPress={() => setScanning(false)} style={{ margin: 12 }} />
        </View>
      ) : (
        <ScrollView style={{ marginTop: 12 }}>
          {cracks.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => navigation.navigate('CrackDetails', { crackId: c.id, project })}
              style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}
            >
              <Text style={{ fontWeight: '600' }}>{c.name}</Text>
              <Text>ID: {c.id}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
