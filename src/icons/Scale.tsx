import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Icon from '../components/Icon';

/**
 * @typedef {object} Props
 * @property {number} [size=24] The size of the icon (width and height).
 * @property {string} [color] The color of the icon.
 * @property {StyleProp<ViewStyle>} [style] Optional styles for the container View.
 */

/**
 * @param {Props} props
 */
export default function Scale({ size = 24, color, style }) {
  // Note: We lose the type import 'StyleProp' here unless using more advanced JSDoc
  // or a tool like Flow. For basic JS, we often just document the expected type.
  return <Icon name="scale" size={size} color={color} style={style} />;
}