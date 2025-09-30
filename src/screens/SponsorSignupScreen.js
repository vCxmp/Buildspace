import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { submitSponsorProfile } from '../services/firebase/sponsors';
import { auth } from '../services/firebase/config';
import CustomHeader from '../components/CustomHeader';

const SponsorSignupScreen = () => {
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    description: '',
    minBudget: '',
    maxBudget: '',
    website: '',
    location: ''
  });
  const router = useRouter();

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!imageUri) {
        Alert.alert('Error', 'Please upload a company logo');
        return;
      }

      if (!formData.companyName || !formData.industry || !formData.description) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No user ID found. Please try logging in again.');
      }

      await submitSponsorProfile({
        ...formData,
        imageUri
      }, userId);
      
      Alert.alert('Success', 'Profile created successfully! Please log in to continue.');
      router.push('/login');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomHeader title="Create Sponsor Profile" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Add your company details to start connecting with athletes
          </Text>

          <View style={styles.form}>
            {/* Company Logo Upload */}
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profilePic} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Text style={styles.uploadText}>Upload Company Logo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your company name"
                value={formData.companyName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Industry</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your industry"
                value={formData.industry}
                onChangeText={(text) => setFormData(prev => ({ ...prev, industry: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your company location"
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Min Budget ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum"
                  value={formData.minBudget}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, minBudget: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Max Budget ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Maximum"
                  value={formData.maxBudget}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, maxBudget: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your company website"
                value={formData.website}
                onChangeText={(text) => setFormData(prev => ({ ...prev, website: text }))}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Company Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about your company"
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Create Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 24 : 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  imageUpload: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SponsorSignupScreen; 