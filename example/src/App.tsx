// example/src/App.tsx

/**
 * Main application component for the DeepLeaf API demo
 * This app allows users to select an image and analyze it for plant diseases
 * using the DeepLeaf API service.
 */

import { useEffect, useState } from 'react';
import {
  Alert,
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

// Import image picker for handling image selection
import { launchImageLibrary } from 'react-native-image-picker';
import type { ImagePickerResponse } from 'react-native-image-picker';

// Import useLocationService and usePermissions hooks
import { useLocationService, usePermissions } from 'deepleaf-api-rn';

// Your API key for DeepLeaf services
const API_KEY = 'ENTER_YOUR_API_KEY';

export default function App() {
  // State management for the application
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { location, locationLoading } = useLocationService();
  const { requestPermissions } = usePermissions();

  useEffect(() => {
    // Request permissions when the app starts
    requestPermissions();
  }, [requestPermissions]);

  // Initialize the DeepLeaf API client
  const api = new DeepLeafAPI({
    apiKey: API_KEY,
    language: 'en',
  });

  /**
   * Handles image selection using react-native-image-picker
   * It first requests for necessary permissions and then launches the image library.
   */
  const selectImage = async () => {
    // First, request permissions
    const hasPermissions = await requestPermissions();

    // If permissions are not granted, show an alert and exit the function.
    if (!hasPermissions) {
      Alert.alert(
        'Permissions required',
        'Please grant camera and storage permissions to select an image.',
        [{ text: 'OK' }]
      );
      console.log('Permissions not granted');
      return;
    }

    // Launch the image library
    try {
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
      });

      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.errorCode) {
        console.log('ImagePicker Error: ', result.errorMessage);
        Alert.alert('Image Picker Error', result.errorMessage);
      } else if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset && asset.uri ? asset.uri : null);
        setResponse(null);
      }
    } catch (error) {
      console.error('An unknown error occurred with ImagePicker: ', error);
      Alert.alert(
        'Error',
        'An unknown error occurred while picking the image.'
      );
    }
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
      const result = await api.uploadImage(
        selectedImage,
        location || undefined
      );

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

    // Handle API error responses
    if (response.success === false || 'error' in response) {
      return (
        <View>
          <Text style={styles.error}>An error occurred:</Text>
          <View style={styles.jsonContainer}>
            <Text style={styles.jsonTitle}>Error Details:</Text>
            <Text style={styles.jsonText}>
              {JSON.stringify(response, null, 2)}
            </Text>
          </View>
        </View>
      );
    }

    // Handle success responses
    if (response.success === true && response.data) {
      const { image_feedback, diagnoses_detected, predicted_diagnoses } =
        response.data;

      return (
        <View>
          {/* Display image quality feedback */}
          <Text style={styles.sectionTitle}>Image Feedback:</Text>
          <Text>Distance: {image_feedback.distance}</Text>
          <Text>Focus: {image_feedback.focus}</Text>

          {/* Display detected diagnoses if any */}
          {diagnoses_detected && predicted_diagnoses && (
            <>
              <Text style={styles.sectionTitle}>Diagnoses:</Text>
              {predicted_diagnoses.map(
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
    }

    // Handle any other unknown response format
    return (
      <View>
        <Text style={styles.error}>An unknown response was received:</Text>
        <View style={styles.jsonContainer}>
          <Text style={styles.jsonTitle}>Response Details:</Text>
          <Text style={styles.jsonText}>
            {JSON.stringify(response, null, 2)}
          </Text>
        </View>
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
              disabled={loading || locationLoading}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? 'Analyzing...'
                  : locationLoading
                    ? 'Getting location...'
                    : 'Analyze Image'}
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
