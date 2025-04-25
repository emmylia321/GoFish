"use client"

import { useState, useRef, useEffect } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native"
import { Camera, CameraView } from "expo-camera"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { analyzeImage } from "../services/OpenAIService";
import { SafeAreaView } from "react-native-safe-area-context"

export default function CameraScreen({ saveCatch }) {
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraType, setCameraType] = useState("back")
  const [flash, setFlash] = useState("off")
  const [capturedImage, setCapturedImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [fishData, setFishData] = useState(null)
  const [location, setLocation] = useState(null)
  const cameraRef = useRef(null)


  
  useEffect(() => {
    ;(async () => {
      // Request camera permission
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync()
      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync()

      setHasPermission(cameraStatus === "granted" && locationStatus === "granted")
    })()
  }, [])

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        })

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({})
        setLocation(currentLocation.coords)

        setCapturedImage(photo)
      } catch (error) {
        console.error("Error taking picture:", error)
      }
    }
  }

  const analyzeFish = async () => {
    if (!capturedImage?.base64) return

    setAnalyzing(true)
    try {
      // Use the provided function to analyze the image
      const result = await analyzeImage(capturedImage.base64)
      setFishData(result)

      // Save the catch with all relevant data
      const timestamp = new Date().toISOString()
      saveCatch({
        id: timestamp,
        image: capturedImage.uri,
        species: result.species,
        facts: result.facts,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        timestamp,
      })
    } catch (error) {
      console.error("Error analyzing fish:", error)
      alert("Failed to analyze the fish. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const resetCamera = () => {
    setCapturedImage(null)
    setFishData(null)
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting permissions...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera or location. Please enable permissions.</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {!capturedImage ? (
        <>
          {/* Camera view */}
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} type={cameraType} flashMode={flash} />
          </View>
          
          {/* Camera controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() =>
                  setFlash(prev => (prev === "off" ? "torch" : "off"))
              }
            >
              <Ionicons
                  name={flash === "off" ? "flash-off" : "flash"}
                  size={24}
                  color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() =>
                  setCameraType(prev => (prev === "back" ? "front" : "back"))
              }
            >
              <Ionicons name="camera-reverse-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // Image preview and analysis view
        <>
          <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
            <ScrollView style={styles.scrollContent}>
              {!fishData ? (
                <View style={styles.analysisContainer}>
                  {analyzing ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#0891b2" />
                      <Text style={styles.loadingText}>Analyzing fish...</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.analyzeButton} onPress={analyzeFish}>
                      <Text style={styles.analyzeButtonText}>Identify Fish</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={styles.resetButton} onPress={resetCamera}>
                    <Text style={styles.resetButtonText}>Take Another Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.resultsContainer}>
                  <Text style={styles.speciesName}>{fishData.species}</Text>

                  <View style={styles.factsContainer}>
                    <Text style={styles.factsTitle}>Facts:</Text>
                    {fishData.facts.map((fact, index) => (
                      <View key={index} style={styles.factItem}>
                        <Ionicons name="information-circle" size={18} color="#0891b2" />
                        <Text style={styles.factText}>{fact}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.resetButton} onPress={resetCamera}>
                    <Text style={styles.resetButtonText}>Catch Another Fish</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    // borderColor: "red",
    borderWidth: 2,
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 550,
    // borderColor: 'blue',
    borderWidth: 2,
    zIndex: 1,
  },
  camera: {
    flex: 1,
    // borderColor: 'green',
    borderWidth: 2,
  },
  cameraControls: {
    position: 'absolute',
    top: 550,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    // borderColor: 'purple',
    borderWidth: 2,
  },
  cameraButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 50,
    padding: 15,
    marginBottom: 15,
    // borderColor: 'yellow',
    borderWidth: 2,
  },
  captureButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 50,
    height: 80,
    width: 80,
    marginBottom: 20,
    // borderColor: 'orange',
    borderWidth: 2,
  },
  captureButtonInner: {
    backgroundColor: "#E0E0E0",
    borderRadius: 50,
    height: 70,
    width: 70,
    // borderColor: 'pink',
    borderWidth: 2,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    // borderColor: "cyan",
    borderWidth: 2,
    heigh: 600,
    marginTop: 390,
  },
  previewImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 450,
    resizeMode: "cover",
    // borderColor: 'magenta',
    borderWidth: 2,
    zIndex: 1,
  },
  scrollContent: {
    flex: 1,
    // borderColor: 'purple',
    marginTop: 390,
    borderWidth: 2,
  },
  analysisContainer: {
    paddingHorizontal: 10,
    alignItems: "center",
    // borderColor: 'brown',
    borderWidth: 2,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
    // borderColor: 'lime',
    borderWidth: 2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#81D4FA",
    // borderColor: 'teal',
    borderWidth: 1,
  },
  analyzeButton: {
    backgroundColor: "#0288D1",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 20,
    width: "100%",
    alignItems: "center",
    // borderColor: 'gold',
    borderWidth: 2,
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
    // borderColor: 'violet',
    borderWidth: 2,
  },
  resetButtonText: {
    color: "#E0E0E0",
    fontSize: 16,
  },
  resultsContainer: {
    padding: 20,
    // borderColor: 'indigo',
    borderWidth: 2,
  },
  speciesName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#81D4FA",
    marginBottom: 15,
    textAlign: "center",
    // borderColor: 'coral',
    borderWidth: 1,
  },
  factsContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    // borderColor: 'darkgreen',
    borderWidth: 2,
  },
  factsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
    marginBottom: 10,
    // borderColor: 'maroon',
    borderWidth: 1,
  },
  factItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    // borderColor: 'navy',
    borderWidth: 2,
  },
  factText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    color: "#BDBDBD",
    // borderColor: 'olive',
    borderWidth: 1,
  },
})
