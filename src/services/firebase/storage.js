import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload an image to Firebase Storage and return its download URL
 * @param {string} uri - The local URI of the image (from ImagePicker)
 * @param {string} path - The storage path where the image should be stored (e.g., 'athletes/profile-photos')
 * @param {string} fileName - The name to give the file in storage
 * @returns {Promise<string>} The public download URL of the uploaded image
 */
export const uploadImage = async (uri, path, fileName) => {
  try {
    // Convert the image URI to a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a storage reference
    const storageRef = ref(storage, `${path}/${fileName}`);

    // Upload the blob
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log("Image uploaded successfully. URL:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Example usage with ImagePicker:
/*
import * as ImagePicker from 'expo-image-picker';

const pickAndUploadImage = async () => {
  try {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    // Pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Upload the image
      const imageUri = result.assets[0].uri;
      const fileName = `profile-${Date.now()}.jpg`;
      const downloadURL = await uploadImage(imageUri, 'athletes/profile-photos', fileName);
      
      // Now you can use this URL in your athlete profile
      const athleteData = {
        name: "John Smith",
        college: "University of California",
        sport: "Basketball",
        amountRequested: 5000,
        profilePhotoUrl: downloadURL
      };
      
      // Add the athlete profile to Firestore
      const athleteId = await addAthleteProfile(athleteData);
      console.log("Athlete profile created with ID:", athleteId);
    }
  } catch (error) {
    console.error("Error in pickAndUploadImage:", error);
    // Handle error (show error message to user)
  }
};
*/ 