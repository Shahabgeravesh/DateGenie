import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const GenieIcon = ({ size = 72, color = "#FF6B8A" }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 72 72">
        <Defs>
          <LinearGradient id="genieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#FF8FA3" />
          </LinearGradient>
          <LinearGradient id="lampGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="100%" stopColor="#FFA500" />
          </LinearGradient>
        </Defs>
        
        {/* Genie Lamp Base */}
        <Path
          d="M20 50 L52 50 L48 60 L24 60 Z"
          fill="url(#lampGradient)"
          stroke="#DAA520"
          strokeWidth="1"
        />
        
        {/* Lamp Body */}
        <Path
          d="M24 30 Q36 20 48 30 L48 50 L24 50 Z"
          fill="url(#lampGradient)"
          stroke="#DAA520"
          strokeWidth="1"
        />
        
        {/* Lamp Spout */}
        <Path
          d="M48 30 Q52 25 50 20 Q48 15 44 20 Q42 25 44 30"
          fill="url(#lampGradient)"
          stroke="#DAA520"
          strokeWidth="1"
        />
        
        {/* Genie Smoke/Magic */}
        <Path
          d="M44 20 Q42 15 40 10 Q38 5 36 10 Q34 15 36 20"
          fill="none"
          stroke="#FF6B8A"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Genie Body */}
        <Path
          d="M36 20 Q32 15 30 20 Q28 25 30 30 Q32 35 36 30 Q40 25 38 20"
          fill="url(#genieGradient)"
          stroke="#FF6B8A"
          strokeWidth="1"
        />
        
        {/* Genie Head */}
        <Circle
          cx="36"
          cy="18"
          r="6"
          fill="url(#genieGradient)"
          stroke="#FF6B8A"
          strokeWidth="1"
        />
        
        {/* Genie Eyes */}
        <Circle cx="34" cy="17" r="1" fill="#FFFFFF" />
        <Circle cx="38" cy="17" r="1" fill="#FFFFFF" />
        <Circle cx="34" cy="17" r="0.5" fill="#000000" />
        <Circle cx="38" cy="17" r="0.5" fill="#000000" />
        
        {/* Genie Arms */}
        <Path
          d="M30 25 Q28 23 26 25 Q24 27 26 29"
          fill="none"
          stroke="url(#genieGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M42 25 Q44 23 46 25 Q48 27 46 29"
          fill="none"
          stroke="url(#genieGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Magic Sparkles */}
        <G opacity="0.8">
          <Path
            d="M20 15 L22 17 L20 19 L18 17 Z"
            fill="#FFD700"
          />
          <Path
            d="M52 12 L54 14 L52 16 L50 14 Z"
            fill="#FFD700"
          />
          <Path
            d="M15 35 L17 37 L15 39 L13 37 Z"
            fill="#FFD700"
          />
          <Path
            d="M57 40 L59 42 L57 44 L55 42 Z"
            fill="#FFD700"
          />
        </G>
        
        {/* Lamp Glow */}
        <Circle
          cx="36"
          cy="40"
          r="8"
          fill="none"
          stroke="#FFD700"
          strokeWidth="1"
          opacity="0.3"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GenieIcon; 