import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { PhotoGrid } from '../components/PhotoGrid';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoCreation'>;

interface SelectedImage {
  uri: string;
  width: number;
  height: number;
}

export default function VideoCreationScreen({ navigation }: Props) {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [duration, setDuration] = useState(5); // Default duration in seconds
  const [isLoading, setIsLoading] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Hata', 'Galeriye erişim izni gereklidir.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
        }));
        setSelectedImages(newImages);
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraflar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    Alert.alert(
      'Fotoğrafı Sil',
      'Bu fotoğrafı silmek istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          onPress: () => {
            const newImages = [...selectedImages];
            newImages.splice(index, 1);
            setSelectedImages(newImages);
          },
          style: 'destructive'
        }
      ]
    );
  };

  const createVideo = async () => {
    if (selectedImages.length < 2) {
      Alert.alert('Hata', 'En az 2 fotoğraf seçmelisiniz.');
      return;
    }

    // TODO: Implement video creation logic
    Alert.alert('Başarılı', 'Video oluşturuldu!', [
      { text: 'Tamam', onPress: () => navigation.navigate('VideoList') }
    ]);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f4511e" />
          <Text style={styles.loadingText}>Fotoğraflar Yükleniyor...</Text>
        </View>
      );
    }

    if (selectedImages.length > 0) {
      return (
        <PhotoGrid
          photos={selectedImages.map(img => img.uri)}
          onPhotoPress={(index) => {
            handleDeleteImage(index);
          }}
        />
      );
    }

    return <Text style={styles.placeholder}>Henüz fotoğraf seçilmedi</Text>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {renderContent()}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={pickImages}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Fotoğraf Seç</Text>
        </TouchableOpacity>

        <View style={styles.durationContainer}>
          <Text style={styles.label}>Video Süresi: {duration} saniye</Text>
          <View style={styles.durationButtons}>
            <TouchableOpacity
              style={[styles.durationButton, duration <= 5 && styles.disabledButton]}
              onPress={() => setDuration(prev => Math.max(5, prev - 1))}
              disabled={duration <= 5}
            >
              <Text style={styles.durationButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.durationButton, duration >= 15 && styles.disabledButton]}
              onPress={() => setDuration(prev => Math.min(15, prev + 1))}
              disabled={duration >= 15}
            >
              <Text style={styles.durationButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.createButton, isLoading && styles.disabledButton]}
          onPress={createVideo}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Video Oluştur</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gridContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  placeholder: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#666',
    paddingTop: 20,
  },
  controls: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  durationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  durationButton: {
    backgroundColor: '#f4511e',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 