import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Proyectos" }} />
      <Stack.Screen name="project-create" options={{ title: "Nuevo Proyecto" }} />
      <Stack.Screen name="project-main" options={{ title: "Detalle Proyecto" }} />
      <Stack.Screen name="crack-create" options={{ title: "Nueva Grieta" }} />
      <Stack.Screen name="crack-details" options={{ title: "Detalle Grieta" }} />
      <Stack.Screen name="reading-create" options={{ title: "Nueva Lectura" }} />
    </Stack>
  );
}
