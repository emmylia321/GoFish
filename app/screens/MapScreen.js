"use client"

import { useState, useEffect, useRef } from "react"
import { StyleSheet, View, Text, Dimensions, TouchableOpacity } from "react-native"
import MapView from "react-native-maps"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#283d6a" }]
  }
];

export default function MapScreen({ catches }) {
  const [region, setRegion] = useState(null)
  const [selectedCatch, setSelectedCatch] = useState(null)
  const [markerPositions, setMarkerPositions] = useState([])
  const mapRef = useRef(null)

  // Convert lat/lng to screen coordinates
  const calculateMarkerPositions = () => {
    if (!mapRef.current || !catches) return;
    
    const positions = catches.map(fishCatch => {
      const point = mapRef.current.coordinateForPoint({
        latitude: fishCatch.location.latitude,
        longitude: fishCatch.location.longitude
      });
      return {
        ...fishCatch,
        screenX: point.x,
        screenY: point.y
      };
    });
    
    setMarkerPositions(positions);
  };

  useEffect(() => {
    // Set initial region to user's current location or first catch location
    ;(async () => {
      if (catches?.length > 0) {
        // If there are catches, center on the most recent one
        const mostRecent = catches[catches.length - 1]
        setRegion({
          latitude: mostRecent.location.latitude,
          longitude: mostRecent.location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        })
      } else {
        // Otherwise, try to get the user's current location
        try {
          const { status } = await Location.requestForegroundPermissionsAsync()
          if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({})
            setRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            })
          }
        } catch (error) {
          console.error("Error getting location:", error)
          // Default to a generic location if all else fails
          setRegion({
            latitude: 37.7749,
            longitude: -122.4194,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          })
        }
      }
    })()
  }, [catches])

  const goToUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({})
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }

        mapRef.current?.animateToRegion(newRegion, 1000)
      }
    } catch (error) {
      console.error("Error getting location:", error)
      alert("Unable to get your current location.")
    }
  }

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading map...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef} 
        style={styles.map} 
        initialRegion={region} 
        showsUserLocation={true}
        customMapStyle={darkMapStyle}
        onRegionChangeComplete={calculateMarkerPositions}
      />

      {/* Custom Markers */}
      {markerPositions.map((fishCatch) => (
        <TouchableOpacity
          key={fishCatch.id}
          style={[
            styles.markerContainer,
            {
              left: fishCatch.screenX - 15,
              top: fishCatch.screenY - 15,
            }
          ]}
          onPress={() => setSelectedCatch(fishCatch)}
        >
          <Ionicons name="fish" size={24} color="#0891b2" />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.locationButton} onPress={goToUserLocation}>
        <Ionicons name="locate" size={24} color="#0891b2" />
      </TouchableOpacity>

      {catches?.length === 0 && (
        <View style={styles.noCatchesContainer}>
          <Text style={styles.noCatchesText}>No catches yet. Take some fish photos to see them on the map!</Text>
        </View>
      )}

      {selectedCatch && (
        <View style={styles.selectedCatchContainer}>
          <Text style={styles.selectedCatchTitle}>{selectedCatch.species}</Text>
          <Text style={styles.selectedCatchDate}>
            {new Date(selectedCatch.timestamp).toLocaleDateString()}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  markerContainer: {
    position: 'absolute',
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: "#81D4FA",
    zIndex: 1000,
  },
  locationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1E1E1E",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noCatchesContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  noCatchesText: {
    textAlign: "center",
    color: "#BDBDBD",
  },
  selectedCatchContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  selectedCatchTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#81D4FA",
    marginBottom: 5,
  },
  selectedCatchDate: {
    fontSize: 12,
    color: "#BDBDBD",
  }
})
