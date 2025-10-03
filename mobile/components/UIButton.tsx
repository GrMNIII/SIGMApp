import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle } from 'react-native';

type UIButtonProps = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function UIButton({ title, onPress, style }: UIButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#191970',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 6,
        ...(style as object),
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600' }}>{title}</Text>
    </TouchableOpacity>
  );
}
