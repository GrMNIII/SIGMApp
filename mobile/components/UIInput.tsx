import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';

type UIInputProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
};

export default function UIInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
}: UIInputProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={{ marginBottom: 6, fontWeight: '600' }}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: '#e6e6e6',
          padding: 10,
          borderRadius: 10,
          minHeight: multiline ? 80 : 44,
        }}
      />
    </View>
  );
}
