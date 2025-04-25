"use client"

import { useState, useEffect, useRef } from "react"
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity } from "react-native"
import MapView, { Marker, Callout } from "react-native-maps"
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
  const mapRef = useRef(null)

  useEffect(() => {
    // Set initial region to user's current location or first catch location
    ;(async () => {
      if (catches.length > 0) {
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
      >
        {catches.map((fishCatch) => (
          <Marker
            key={fishCatch.id}
            coordinate={{
              latitude: fishCatch.location.latitude,
              longitude: fishCatch.location.longitude,
            }}
            onPress={() => setSelectedCatch(fishCatch)}
          >
            <View style={styles.markerContainer}>
              <Ionicons name="fish" size={24} color="#0891b2" />
            </View>
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Image source={{ uri: fishCatch.image }} style={styles.calloutImage} />
                <View style={styles.calloutTextContainer}>
                  <Text style={styles.calloutTitle}>{fishCatch.species}</Text>
                  <Text style={styles.calloutDate}>{new Date(fishCatch.timestamp).toLocaleDateString()}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.locationButton} onPress={goToUserLocation}>
        <Ionicons name="locate" size={24} color="#0891b2" />
      </TouchableOpacity>

      {catches.length === 0 && (
        <View style={styles.noCatchesContainer}>
          <Text style={styles.noCatchesText}>No catches yet. Take some fish photos to see them on the map!</Text>
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
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: "#81D4FA",
  },
  calloutContainer: {
    width: 200,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutImage: {
    width: "100%",
    height: 120,
    borderRadius: 5,
    marginBottom: 5,
  },
  calloutTextContainer: {
    alignItems: "center",
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#81D4FA",
  },
  calloutDate: {
    fontSize: 12,
    color: "#BDBDBD",
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
})
