"use client"

import { useState } from "react"
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, Modal, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

export default function GalleryScreen({ catches, onDelete }) {
  const [selectedCatch, setSelectedCatch] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const openCatchDetails = (fishCatch) => {
    setSelectedCatch(fishCatch)
    setModalVisible(true)
  }

  const handleDelete = (catchToDelete) => {
    Alert.alert(
      "Delete Catch",
      "Are you sure you want to delete this catch? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => onDelete(catchToDelete.id),
          style: "destructive"
        }
      ]
    )
  }

  const renderCatchItem = ({ item }) => (
    <TouchableOpacity style={styles.catchCard} onPress={() => openCatchDetails(item)}>
      <View style={styles.cardHeader}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(item);
          }}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Image source={{ uri: item.image }} style={styles.catchImage} />
      <View style={styles.catchInfo}>
        <Text style={styles.catchSpecies}>{item.species}</Text>
        <Text style={styles.catchDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {catches.length > 0 ? (
        <FlatList
          data={catches}
          renderItem={renderCatchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyCatchesContainer}>
          <Ionicons name="fish-outline" size={80} color="#ccc" />
          <Text style={styles.emptyCatchesText}>No catches yet. Head to the Camera tab to start catching fish!</Text>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedCatch && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>

              <ScrollView>
                <Image source={{ uri: selectedCatch.image }} style={styles.modalImage} />

                <View style={styles.modalInfo}>
                  <Text style={styles.modalSpecies}>{selectedCatch.species}</Text>

                  <View style={styles.modalDetail}>
                    <Ionicons name="calendar-outline" size={20} color="#0891b2" />
                    <Text style={styles.modalDetailText}>{new Date(selectedCatch.timestamp).toLocaleString()}</Text>
                  </View>

                  <View style={styles.modalDetail}>
                    <Ionicons name="location-outline" size={20} color="#0891b2" />
                    <Text style={styles.modalDetailText}>
                      {`${selectedCatch.location.latitude.toFixed(4)}, ${selectedCatch.location.longitude.toFixed(4)}`}
                    </Text>
                  </View>

                  <View style={styles.factsContainer}>
                    <Text style={styles.factsTitle}>Facts:</Text>
                    {selectedCatch.facts.map((fact, index) => (
                      <View key={index} style={styles.factItem}>
                        <Ionicons name="information-circle" size={18} color="#0891b2" />
                        <Text style={styles.factText}>{fact}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  listContainer: {
    padding: 10,
  },
  catchCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  catchImage: {
    width: "100%",
    height: 200,
  },
  catchInfo: {
    padding: 15,
  },
  catchSpecies: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#81D4FA",
    marginBottom: 5,
  },
  catchDate: {
    fontSize: 14,
    color: "#BDBDBD",
  },
  emptyCatchesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCatchesText: {
    marginTop: 20,
    fontSize: 16,
    color: "#BDBDBD",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 5,
  },
  modalImage: {
    width: "100%",
    height: 250,
  },
  modalInfo: {
    padding: 20,
  },
  modalSpecies: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#81D4FA",
    marginBottom: 15,
  },
  modalDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalDetailText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#E0E0E0",
  },
  factsContainer: {
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
  },
  factsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#E0E0E0",
  },
  factItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  factText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    color: "#BDBDBD",
  },
  cardHeader: {
    position: 'absolute',
    bottom: 15,
    right: 10,
    zIndex: 1,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})
