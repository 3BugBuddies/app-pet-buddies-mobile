import { Image, StyleSheet, type StyleProp, type ImageStyle } from 'react-native';

interface BrandMarkProps {
  style?: StyleProp<ImageStyle>;
}

export function BrandMark({ style }: BrandMarkProps) {
  return (
    <Image
      source={require('../../../assets/images/filo-simbolo.png')}
      style={[styles.mark, style]}
      resizeMode="contain"
      accessibilityLabel="PetBuddies"
    />
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 32,
    height: 32,
  },
});
