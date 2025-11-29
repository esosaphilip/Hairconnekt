import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';
import { StyleProp, TextStyle } from 'react-native';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  // accept fill for compatibility with some screen usages
  fill?: string;
  style?: StyleProp<TextStyle>;
}

// Map common semantic names to Ionicons glyph names
const NAME_MAP: Record<string, string> = {
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
  'dollar-sign': 'logo-usd',
  tag: 'pricetag',
  users: 'people',
  gift: 'gift-outline',
  copy: 'copy-outline',
  'alert-circle': 'alert-circle-outline',
  'alert-triangle': 'warning-outline',
  'credit-card': 'card',
  'check-circle': 'checkmark-circle',
  'x-circle': 'close-circle',
  'thumbs-up': 'thumbs-up',
  'trending-up': 'trending-up',
  'building-2': 'business',
  // Fix: map non-existent name to Ionicons equivalent
  'chevron-right': 'chevron-forward',
  'chevron-left': 'chevron-back',
  plus: 'add',
  calendar: 'calendar-outline',
  'message-square': 'chatbubble-outline',
};

type IonName = React.ComponentProps<typeof Ionicons>['name'];

export default function Icon({ name, size = 24, color: c, fill, style }: IconProps) {
  const ionName: IonName = (NAME_MAP[name] || name) as IonName;
  // Prefer explicit color, fall back to fill, then default gray
  const finalColor = c || fill || colors.gray700;
  return <Ionicons name={ionName} size={size} color={finalColor} style={style} />;
}
