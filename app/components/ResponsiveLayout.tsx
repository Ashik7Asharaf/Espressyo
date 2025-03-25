import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, ViewStyle } from 'react-native';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: number;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  maxWidth = 1200,
  padding = 16,
}) => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  const webStyles: ViewStyle = isWeb ? {
    maxWidth,
    marginHorizontal: 'auto' as const,
    paddingHorizontal: padding,
  } : {};

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...webStyles,
  };

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
}); 