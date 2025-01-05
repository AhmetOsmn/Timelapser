import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ResizeMode, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoList'>;

interface VideoItem {
  id: string;
  uri: string;
  createdAt: Date;
  duration: number;
}

export default function VideoListScreen({ navigation }: Props) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const downloadVideo = async (videoUri: string) => {
    try {
      const filename = videoUri.split('/').pop();
      if (!filename || !FileSystem.documentDirectory) {
        throw new Error('Invalid file path');
      }
      
      const result = await FileSystem.downloadAsync(
        videoUri,
        FileSystem.documentDirectory + filename
      );
      
      Alert.alert('Başarılı', 'Video indirildi!');
    } catch (error) {
      Alert.alert('Hata', 'Video indirilirken bir hata oluştu.');
    }
  };

  const deleteVideo = async (videoId: string) => {
    Alert.alert(
      'Videoyu Sil',
      'Bu videoyu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement actual video deletion
            setVideos(prev => prev.filter(v => v.id !== videoId));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: VideoItem }) => (
    <View style={styles.videoItem}>
      <Video
        source={{ uri: item.uri }}
        style={styles.videoPreview}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        shouldPlay={selectedVideo === item.id}
      />
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoDate}>
          {new Date(item.createdAt).toLocaleDateString('tr-TR')}
        </Text>
        <Text style={styles.videoDuration}>{item.duration} saniye</Text>
      </View>
      
      <View style={styles.videoActions}>
        <TouchableOpacity
          style={[styles.button, styles.playButton]}
          onPress={() => setSelectedVideo(selectedVideo === item.id ? null : item.id)}
        >
          <Text style={styles.buttonText}>
            {selectedVideo === item.id ? 'Durdur' : 'Oynat'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.downloadButton]}
          onPress={() => downloadVideo(item.uri)}
        >
          <Text style={styles.buttonText}>İndir</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => deleteVideo(item.id)}
        >
          <Text style={styles.buttonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {videos.length > 0 ? (
        <FlatList
          data={videos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Henüz video oluşturmadınız</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('VideoCreation')}
          >
            <Text style={styles.buttonText}>Video Oluştur</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 10,
  },
  videoItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 4,
  },
  videoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  videoDate: {
    color: '#666',
  },
  videoDuration: {
    color: '#666',
  },
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  downloadButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
}); 