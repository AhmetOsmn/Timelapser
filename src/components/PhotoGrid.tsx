import React from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PhotoGridProps {
  photos: string[];
  onPhotoPress?: (index: number) => void;
  isLoading?: boolean;
}

export function PhotoGrid({ photos, onPhotoPress, isLoading = false }: PhotoGridProps) {
  const windowWidth = Dimensions.get('window').width;
  const gap = 16; // Boşluk miktarı
  const padding = 24; // Kenar boşluğu
  const itemSize = (windowWidth - (2 * padding) - gap) / 2; // 2 sütunlu grid, kenarlardan padding ve aralarında gap kadar boşluk

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {photos.length > 0 && (
        <Text style={styles.hint}>Silmek için çarpı işaretine dokunun</Text>
      )}
      <View style={[styles.grid, { gap }]}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: photo }}
              style={[styles.image, { width: itemSize, height: itemSize }]}
              resizeMode="cover"
              progressiveRenderingEnabled={true}
              fadeDuration={300}
              accessible={true}
              accessibilityLabel={`Fotoğraf ${index + 1}`}
              accessibilityHint="Fotoğrafı silmek için sağ üst köşedeki çarpı işaretine dokunun"
            />
            <TouchableOpacity
              style={styles.deleteIconContainer}
              onPress={() => onPhotoPress?.(index)}
              activeOpacity={0.6}
              accessible={true}
              accessibilityLabel="Sil"
              accessibilityHint="Bu fotoğrafı silmek için dokunun"
              accessibilityRole="button"
            >
              <Text style={styles.deleteIcon}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginVertical: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 16,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  image: {
    borderRadius: 12,
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
}); 