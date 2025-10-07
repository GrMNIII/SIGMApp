import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* 1. Ruta de Tabs */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      /> 

      {/* 2. Pantalla de Lista */}
      <Stack.Screen 
        name="project-list" 
        options={{ title: "Lista de Proyectos" }} 
      />
      
      {/* 3. Pantalla de Creación */}
      <Stack.Screen 
        name="project-create" 
        options={{ title: "Nuevo Proyecto" }} 
      />
      
      {/* 4. PANTALLA PRINCIPAL: Usamos el nombre de archivo real 'project-main' */}
      <Stack.Screen 
        name="project-main"
        options={{ title: "Detalle Proyecto" }} 
      /> 

      {/* 5. Rutas Anidadas */}
      <Stack.Screen 
        name="crack-create"
        options={{ title: "Nueva Grieta" }} 
      />

      <Stack.Screen 
        name="crack-list"
        options={{ title: "Grietas" }} 
      />
      
      <Stack.Screen 
        name="crack-details"
        options={{ title: "Detalle Grieta" }} 
      />

      <Stack.Screen
        name="reading-create"
        options={{ title: "Nueva Lectura" }} 
      />

    </Stack>
  );
}
