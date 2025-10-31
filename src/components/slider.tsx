import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { colors, radii } from '../theme/tokens';

type SliderProps = {
  value: number;
  onValueChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1 }: SliderProps) {
  const [width, setWidth] = useState(0);
  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  const position = useMemo(() => {
    const ratio = (clamp(value) - min) / (max - min);
    return width * ratio;
  }, [value, width, min, max]);

  const snap = (v: number) => {
    const snapped = Math.round(v / step) * step;
    return clamp(snapped);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / (width || 1)));
        const next = snap(min + ratio * (max - min));
        onValueChange(next);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / (width || 1)));
        const next = snap(min + ratio * (max - min));
        onValueChange(next);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const progress = ((clamp(value) - min) / (max - min)) * 100;

  return (
    <View style={styles.container} onLayout={onLayout} {...panResponder.panHandlers}>
      <View style={styles.track}>
        <View style={[styles.range, { width: `${progress}%` }]} />
        <View style={[styles.thumb, { left: Math.max(0, Math.min(width - 14, position - 7)) }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  track: {
    height: 4,
    width: '100%',
    backgroundColor: colors.gray200,
    borderRadius: radii.full,
  },
  range: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  thumb: {
    position: 'absolute',
    top: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
