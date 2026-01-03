import { Stack, Tabs,  } from "expo-router";
import {View, Text, StyleSheet} from "react-native"

import {ChartPieSlice, UserCircle, BookOpenText} from "phosphor-react-native";
import { Cores } from "@/constants/Cores";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Cores.secundaria,
          height: 80,
          paddingTop: 15,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: Cores.primariaEscura,
        tabBarInactiveTintColor: "#f4f4f4",
      }} 
    >
      <Tabs.Screen name="Principal" options={{
        tabBarIcon: ({color}) => (
        <View>
          <ChartPieSlice size={32} color={color} weight="fill"/>
          <Text style={{color: color, fontSize: 9}}>Grafico</Text>
        </View>
        ),
        
      }}
      />
      
      <Tabs.Screen name="Perfil" options={{
        tabBarIcon: ({color}) => (
        <View>
          <UserCircle size={32} color={color} weight="fill"/>
          <Text style={{color: color, fontSize: 11}}>Perfil</Text>
        </View>
        ),
        
      }}
      />
    </Tabs>
  );
}

export const styles = StyleSheet.create({
  textoBotao:{
    fontSize: 11,
  },
});