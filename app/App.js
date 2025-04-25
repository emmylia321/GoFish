import { useState, useEffect } from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import * as SecureStore from 'expo-secure-store'
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"

import CameraScreen from "./screens/CameraScreen"
import MapScreen from "./screens/MapScreen"
import GalleryScreen from "./screens/GalleryScreen"

const Tab = createBottomTabNavigator()

export default function App() {
  const [catches, setCatches] = useState([])

  useEffect(() => {
    // Load saved catches when app starts
    loadCatches()
  }, [])

  const loadCatches = async () => {
    try {
      const savedCatches = await SecureStore.getItemAsync("fishCatches")
      if (savedCatches) {
        setCatches(JSON.parse(savedCatches))
      }
    } catch (error) {
      console.error("Failed to load catches:", error)
    }
  }

  const saveCatch = async (newCatch) => {
    try {
      const updatedCatches = [...catches, newCatch]
      await SecureStore.setItemAsync("fishCatches", JSON.stringify(updatedCatches))
      setCatches(updatedCatches)
    } catch (error) {
      console.error("Failed to save catch:", error)
    }
  }

  const deleteCatch = async (catchId) => {
    try {
      const updatedCatches = catches.filter(fishCatch => fishCatch.id !== catchId)
      await SecureStore.setItemAsync("fishCatches", JSON.stringify(updatedCatches))
      setCatches(updatedCatches)
    } catch (error) {
      console.error("Failed to delete catch:", error)
    }
  }

  return (
    <SafeAreaProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName

            if (route.name === "Camera") {
              iconName = focused ? "camera" : "camera-outline"
            } else if (route.name === "Map") {
              iconName = focused ? "map" : "map-outline"
            } else if (route.name === "My Catches") {
              iconName = focused ? "fish" : "fish-outline"
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: "#81D4FA",
          tabBarInactiveTintColor: "#BDBDBD",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#1E1E1E",
          },
          headerTintColor: "#E0E0E0",
          tabBarStyle: {
            backgroundColor: "#121212",
            borderTopColor: "#2C2C2C",
          },
        })}
      >
        <Tab.Screen name="Camera">{(props) => <CameraScreen {...props} saveCatch={saveCatch} />}</Tab.Screen>
        <Tab.Screen name="Map">{(props) => <MapScreen {...props} catches={catches} />}</Tab.Screen>
        <Tab.Screen name="My Catches">{(props) => <GalleryScreen {...props} catches={catches} onDelete={deleteCatch} />}</Tab.Screen>
      </Tab.Navigator>
      <StatusBar style="light" />
    </SafeAreaProvider>
  )
}
