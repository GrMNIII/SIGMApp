import { Tabs } from "expo-router";
// Asumiendo que tienes un archivo 'app/(tabs)/explore.tsx'

export default function TabLayout() {
  return (
    <Tabs>
      {/* 1. Pantalla principal del tab (proyectos) */}
      <Tabs.Screen 
        name="index" // Corresponde a app/(tabs)/index.tsx
        options={{ 
            title: "Proyectos", 
            // Aquí puedes añadir icono para la pestaña
        }} 
      />
      
      
      {/* ¡NO incluyas aquí project-create, project-main, etc. ! */}
    </Tabs>
  );
}
