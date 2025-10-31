import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  fill?: string; // accept fill for compatibility with some screen usages
  style?: any;
};

const NAME_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  // Common mappings to Ionicons names
  'arrow-left': 'arrow-back',
  upload: 'cloud-upload-outline',
  camera: 'camera-outline',
  image: 'image-outline',
  check: 'checkmark',
  // Additional mappings used across screens
  'more-vertical': 'ellipsis-vertical',
  'map-pin': 'map',
  navigation: 'navigate',
  'message-circle': 'chatbubble-outline',
  edit: 'create-outline',
  ban: 'close-circle',
  clock: 'time',
  star: 'star',
  phone: 'call',
  euro: 'logo-euro',
  'alert-circle': 'alert-circle-outline',
  'credit-card': 'card',
  'check-circle': 'checkmark-circle',
  'thumbs-up': 'thumbs-up',
  'trending-up': 'trending-up',
  'building-2': 'business',
};

export default function Icon({ name, size = 24, color: c, fill, style }: IconProps) {
  const ionName = (NAME_MAP[name] || (name as any)) as keyof typeof Ionicons.glyphMap;
  // Prefer explicit color, fall back to fill, then default gray
  const finalColor = c || fill || colors.gray700;
  return <Ionicons name={ionName} size={size} color={finalColor} style={style} />;
}