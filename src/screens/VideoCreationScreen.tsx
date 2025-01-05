import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const ffmpeg = ffmpegRef.current;
        
        // FFmpeg'i doğrudan URL'lerden yükle
        await ffmpeg.load({
          coreURL: `${baseURL}/ffmpeg-core.js`,
          wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        });
        
        setIsFFmpegLoaded(true);
      } catch (error) {
        console.error('FFmpeg yüklenirken hata:', error);
        Alert.alert('Hata', 'Video oluşturma modülü yüklenemedi.');
      }
    };

    loadFFmpeg();
  }, []);

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

  const cancelVideoCreation = async () => {
    try {
      await ffmpegRef.current.terminate();
      setIsCreatingVideo(false);
      setProgress(0);
    } catch (error) {
      console.error('Video oluşturma iptal edilirken hata:', error);
    }
  };

  const createVideo = async () => {
    if (!isFFmpegLoaded) {
      Alert.alert('Hata', 'Video oluşturma modülü henüz hazır değil.');
      return;
    }

    if (selectedImages.length < 2) {
      Alert.alert('Hata', 'En az 2 fotoğraf seçmelisiniz.');
      return;
    }

    try {
      setIsCreatingVideo(true);
      setProgress(0);

      const ffmpeg = ffmpegRef.current;

      // Her resim için dosya oluştur
      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        const fileName = `image_${i.toString().padStart(4, '0')}.jpg`;
        const fileData = await fetchFile(img.uri);
        await ffmpeg.writeFile(fileName, fileData);
        setProgress((i + 1) * 50 / selectedImages.length);
      }

      // Her resim için süre hesapla
      const frameDuration = duration / selectedImages.length;
      
      // FFmpeg komutu oluştur
      const command = [
        '-framerate', `${1/frameDuration}`,
        '-i', 'image_%04d.jpg',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-r', '30',
        'output.mp4'
      ];

      // Progress takibi için
      ffmpeg.on('progress', ({ progress }) => {
        setProgress(50 + progress * 0.5);
      });

      // Video oluştur
      await ffmpeg.exec(command);

      // Oluşturulan videoyu oku
      const data = await ffmpeg.readFile('output.mp4');
      
      // Videoyu cihaza kaydet
      const outputPath = `${FileSystem.cacheDirectory}output.mp4`;
      await FileSystem.writeAsStringAsync(outputPath, data.toString(), {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert('Başarılı', 'Video başarıyla oluşturuldu!', [
        { text: 'Tamam', onPress: () => navigation.navigate('VideoList') }
      ]);

    } catch (error) {
      console.error('Video oluşturma hatası:', error);
      Alert.alert('Hata', 'Video oluşturulurken bir hata oluştu.');
    } finally {
      setIsCreatingVideo(false);
      setProgress(0);
    }
  };

  const renderProgressModal = () => (
    <Modal
      transparent
      visible={isCreatingVideo}
      animationType="fade"
      onRequestClose={cancelVideoCreation}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ActivityIndicator size="large" color="#f4511e" />
          <Text style={styles.progressText}>
            Video Oluşturuluyor... {Math.round(progress)}%
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelVideoCreation}
          >
            <Text style={styles.cancelButtonText}>İptal Et</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderContent = () => {
    if (isLoading || isCreatingVideo) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f4511e" />
          <Text style={styles.loadingText}>
            {isCreatingVideo ? 'Video Oluşturuluyor...' : 'Fotoğraflar Yükleniyor...'}
          </Text>
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
          style={[styles.button, (isLoading || isCreatingVideo) && styles.disabledButton]} 
          onPress={pickImages}
          disabled={isLoading || isCreatingVideo}
        >
          <Text style={styles.buttonText}>Fotoğraf Seç</Text>
        </TouchableOpacity>

        <View style={styles.durationContainer}>
          <Text style={styles.label}>Video Süresi: {duration} saniye</Text>
          <View style={styles.durationButtons}>
            <TouchableOpacity
              style={[styles.durationButton, (duration <= 5 || isCreatingVideo) && styles.disabledButton]}
              onPress={() => setDuration(prev => Math.max(5, prev - 1))}
              disabled={duration <= 5 || isCreatingVideo}
            >
              <Text style={styles.durationButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.durationButton, (duration >= 15 || isCreatingVideo) && styles.disabledButton]}
              onPress={() => setDuration(prev => Math.min(15, prev + 1))}
              disabled={duration >= 15 || isCreatingVideo}
            >
              <Text style={styles.durationButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.createButton, (isLoading || isCreatingVideo) && styles.disabledButton]}
          onPress={createVideo}
          disabled={isLoading || isCreatingVideo}
        >
          <Text style={styles.buttonText}>Video Oluştur</Text>
        </TouchableOpacity>
      </View>

      {renderProgressModal()}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 250,
  },
  progressText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 