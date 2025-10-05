import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* 1. Incluye el grupo de pestañas.
         * headerShown: false oculta el header en las pantallas de tabs, 
         * y permite que el stack raíz maneje la navegación completa.
      */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 

      {/* 2. Pantallas de navegación "Stack" (pantalla completa)
         * El resto de rutas se declaran fuera del grupo (tabs) para que el router
         * las encuentre sin advertencias.
      */}
      
      <Stack.Screen name="project-create" options={{ title: "Nuevo Proyecto" }} />
      <Stack.Screen name="project-main" options={{ title: "Detalle Proyecto" }} />
      <Stack.Screen name="crack-create" options={{ title: "Nueva Grieta" }} />
      <Stack.Screen name="crack-details" options={{ title: "Detalle Grieta" }} />
      <Stack.Screen name="reading-create" options={{ title: "Nueva Lectura" }} />
    </Stack>
  );
}
