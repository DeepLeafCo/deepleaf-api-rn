// example/src/App.tsx

/**
 * Main application component for the DeepLeaf API demo
 * This app allows users to select an image and analyze it for plant diseases
 * using the DeepLeaf API service.
 */

import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

// Import the DeepLeaf API client and types
import { DeepLeafAPI } from 'deepleaf-api-rn';
import type { Diagnosis } from 'deepleaf-api-rn';

// Import image picker for handling image selection, you can use any other library for image selection or camera capture like react-native-camera or expo-image-picker or react-native-vision-camera
import * as ImagePicker from 'react-native-image-picker';

// Your API key for DeepLeaf services
const API_KEY = 'feed_the_world_KvFJd02dWMtkfHk7F8ytuj7R1Sip9niPYIVkDWnfR-8';

export default function App() {
  // State management for the application
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Stores the selected image URI
  const [response, setResponse] = useState<any>(null); // Stores the API response
  const [loading, setLoading] = useState(false); // Tracks loading state during API calls

  // Initialize the DeepLeaf API client
  const api = new DeepLeafAPI({
    apiKey: API_KEY,
    language: 'en',
  });

  /**
   * Handles image selection using react-native-image-picker
   * Opens the device's image library and allows user to select a photo
   */
  const selectImage = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      (result: ImagePicker.ImagePickerResponse) => {
        if (
          !result.didCancel &&
          result.assets &&
          result.assets[0] &&
          result.assets[0].uri
        ) {
          setSelectedImage(result.assets[0].uri);
          setResponse(null); // Clear previous response when new image is selected
        }
      }
    );
  };

  /**
   * Analyzes the selected image using the DeepLeaf API
   * Uploads the image and processes the response
   */
  const analyzeImage = async () => {
    if (!selectedImage) {
      console.error('No image selected for analysis');
      return;
    }

    setLoading(true);
    try {
      const result = await api.uploadImage(selectedImage);
      setResponse(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setResponse({ error: 'Failed to analyze image' });
    }
    setLoading(false);
  };

  /**
   * Renders the diagnosis results from the API response
   * Displays image feedback and detected plant diseases
   */
  const renderDiagnosis = () => {
    if (!response) return null;
    if ('error' in response) {
      return <Text style={styles.error}>{response.error}</Text>;
    }

    return (
      <View>
        {/* Display image quality feedback */}
        <Text style={styles.sectionTitle}>Image Feedback:</Text>
        <Text>Distance: {response.image_feedback.distance}</Text>
        <Text>Focus: {response.image_feedback.focus}</Text>

        {/* Display detected diagnoses if any */}
        {response.diagnoses_detected && (
          <>
            <Text style={styles.sectionTitle}>Diagnoses:</Text>
            {response.predicted_diagnoses.map(
              (diagnosis: Diagnosis, index: number) => (
                <View key={index} style={styles.diagnosis}>
                  <Text style={styles.diagnosisName}>
                    {diagnosis.common_name}
                  </Text>
                  <Text>Likelihood: {diagnosis.diagnosis_likelihood}</Text>
                  <Text>Scientific Name: {diagnosis.scientific_name}</Text>
                  <View style={styles.flexDir}>
                    <Text>Hosts: </Text>
                    <Text>{diagnosis.hosts.join(', ')}</Text>
                  </View>
                  {/* Display raw JSON response for debugging */}
                  <View style={styles.jsonContainer}>
                    <Text style={styles.jsonTitle}>Full JSON Response:</Text>
                    <Text style={styles.jsonText}>
                      {JSON.stringify(diagnosis, null, 2)}
                    </Text>
                  </View>
                </View>
              )
            )}
          </>
        )}
      </View>
    );
  };

  // Main render method
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>DeepLeaf API - Example App</Text>

        {/* Image selection button */}
        <TouchableOpacity style={styles.button} onPress={selectImage}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>

        {/* Display selected image and analysis button */}
        {selectedImage && (
          <>
            <Image
              source={{ uri: selectedImage }}
              style={styles.image}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={analyzeImage}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Display analysis results */}
        {response && (
          <View style={styles.responseContainer}>{renderDiagnosis()}</View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Styles for the application
 * Includes layout, colors, and typography definitions
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#35ff26',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 300,
    marginVertical: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  diagnosis: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  diagnosisName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  jsonContainer: {
    backgroundColor: 'black',
    padding: 10,
  },
  jsonTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  jsonText: {
    color: 'lime',
    fontSize: 12,
  },
  flexDir: {
    flexDirection: 'row',
  },
});
