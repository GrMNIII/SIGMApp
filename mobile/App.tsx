import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProjectList from './app/project-list';
import ProjectCreate from './app/project-create';
import ProjectMain from './app/project-main';
import CrackCreate from './app/crack-create';
import CrackDetails from './app/crack-details';
import ReadingCreate from './app/reading-create';

export type RootStackParamList = {
  ProjectList: undefined;
  ProjectCreate: undefined;
  ProjectMain: { project: any };
  CrackCreate: { crackId: string; project: any };
  CrackDetails: { crackId: string; project: any };
  ReadingCreate: { crackId: string; project: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ProjectList" screenOptions={{ headerShown: true }}>
        <Stack.Screen name="ProjectList" component={ProjectList} options={{ title: 'Proyectos' }} />
        <Stack.Screen name="ProjectCreate" component={ProjectCreate} options={{ title: 'Nuevo Proyecto' }} />
        <Stack.Screen name="ProjectMain" component={ProjectMain} options={{ title: 'Proyecto' }} />
        <Stack.Screen name="CrackCreate" component={CrackCreate} options={{ title: 'Registrar Grieta' }} />
        <Stack.Screen name="CrackDetails" component={CrackDetails} options={{ title: 'Detalles de Grieta' }} />
        <Stack.Screen name="ReadingCreate" component={ReadingCreate} options={{ title: 'Agregar Lectura' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
