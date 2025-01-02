import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import './i18n';
import useStore from './store/useStore';

export default function App() {
  const { t } = useTranslation();
  const { isDark, toggleTheme, selectedImages, addImages } = useStore();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      addImages(uris);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          {t('timelapse.title')}
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons 
            name={isDark ? 'sunny' : 'moon'} 
            size={24} 
            color={isDark ? '#fff' : '#000'} 
          />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>
        {t('timelapse.uploadPrompt')}
      </Text>

      <View style={styles.imageGrid}>
        {selectedImages.map((uri, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.imagePreview}
            onPress={() => useStore.getState().removeImage(index)}
          >
            <View style={[styles.imageOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }]}>
              <Ionicons name="close-circle" size={24} color={isDark ? '#fff' : '#000'} />
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]}
          onPress={pickImage}
        >
          <Text style={[styles.uploadButtonText, { color: isDark ? '#fff' : '#000' }]}>
            {t('timelapse.addPhotos')}
          </Text>
        </TouchableOpacity>
      </View>

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
