// App.tsx

import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';

// Import the DeepLeaf API client and types
import { DeepLeafAPI } from 'deepleaf-api-rn';
import type {
  DeepLeafResponse,
  DiagnosisInfo,
  ImageFeedback,
} from 'deepleaf-api-rn';

// Import image picker for handling image selection
import * as ImagePicker from 'react-native-image-picker';

// Your API key for DeepLeaf services
const API_KEY = 'YOUR_API_KEY';

export default function App() {
  // State management for the application
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Stores the selected image URI
  const [response, setResponse] = useState<DeepLeafResponse | null>(null); // Stores the API response
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
        quality: 0.8,
        selectionLimit: 1,
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
      console.log('API Response:', JSON.stringify(result, null, 2)); // Debug log
      setResponse(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setResponse({
        success: false,
        error: {
          code: 'ANALYSIS_ERROR',
          message: 'Failed to analyze the image',
        },
        data: null,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renders the diagnosis results from the API response
   */
  const renderDiagnosis = () => {
    if (!response) return null;

    // Handle error responses
    if (!response.success || response.error) {
      return (
        <View>
          <Text style={styles.error}>Error</Text>
          <Text>
            {(response.error && response.error.message) || 'Unknown error'}
          </Text>
        </View>
      );
    }

    // Get the data from the response
    const responseData = response.data || {};

    // Extract specific fields from the data
    const imageFeedback: ImageFeedback = responseData.image_feedback || {};
    const diagnosesDetected: boolean = responseData.diagnoses_detected || false;
    const predictedDiagnoses: DiagnosisInfo[] =
      responseData.predicted_diagnoses || [];

    return (
      <View>
        {/* Display image quality feedback */}
        {imageFeedback && Object.keys(imageFeedback).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Image Feedback:</Text>
            <Text>Distance: {imageFeedback.distance}</Text>
            <Text>Focus: {imageFeedback.focus}</Text>
          </>
        )}

        {/* Display detected diagnoses if any */}
        <Text style={styles.sectionTitle}>
          Diagnoses {diagnosesDetected ? 'Detected' : 'Not Detected'}:
        </Text>

        {predictedDiagnoses.length > 0 ? (
          predictedDiagnoses.map((diagnosis, index) => (
            <View key={index} style={styles.diagnosis}>
              <Text style={styles.diagnosisName}>{diagnosis.common_name}</Text>
              <Text>Likelihood: {diagnosis.diagnosis_likelihood}</Text>
              <Text>Scientific Name: {diagnosis.scientific_name}</Text>
              <Text>Hosts: {diagnosis.hosts.join(', ')}</Text>
            </View>
          ))
        ) : (
          <Text>No specific diagnoses available</Text>
        )}

        {/* Display metadata if available */}
        {response.meta && (
          <View style={styles.metaContainer}>
            <Text style={styles.metaTitle}>Metadata:</Text>
            <Text>Request ID: {response.meta.request_id}</Text>
            <Text>Timestamp: {response.meta.timestamp}</Text>
          </View>
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
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#000" />
                  <Text style={styles.buttonText}>Analyzing...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Analyze Image</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Display analysis results */}
        {response && (
          <View style={styles.responseContainer}>{renderDiagnosis()}</View>
        )}

        {/* Debug view for showing the raw response */}
        {response && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Raw Response:</Text>
            <Text style={styles.debugText}>
              {JSON.stringify(response, null, 2)}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Styles for the application
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
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
    marginBottom: 10,
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
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#000',
    borderRadius: 6,
  },
  debugTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    color: '#0f0',
    fontSize: 10,
  },
  metaContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  metaTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
});
