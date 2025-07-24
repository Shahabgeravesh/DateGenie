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
            <Stop offset="50%" stopColor="#FF1493" />
            <Stop offset="100%" stopColor="#E91E63" />
          </LinearGradient>
          <LinearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF1744" />
            <Stop offset="50%" stopColor="#FF4081" />
            <Stop offset="100%" stopColor="#D50000" />
          </LinearGradient>
          <LinearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="50%" stopColor="#FFA500" />
            <Stop offset="100%" stopColor="#FF8C00" />
          </LinearGradient>
        </Defs>
        
        {/* Genie Body - Rounded, plump figure */}
        <Path
          d="M36 15 Q28 15 24 20 Q20 25 22 35 Q24 45 36 45 Q48 45 50 35 Q52 25 48 20 Q44 15 36 15"
          fill="url(#genieGradient)"
          stroke="#9C27B0"
          strokeWidth="2"
        />
        
        {/* Genie Head */}
        <Circle
          cx="36"
          cy="18"
          r="8"
          fill="url(#genieGradient)"
          stroke="#9C27B0"
          strokeWidth="2"
        />
        
        {/* Genie Hair Bun/Topknot */}
        <Circle
          cx="36"
          cy="12"
          r="3"
          fill="#9C27B0"
        />
        
        {/* Genie Eyes - Closed, content expression */}
        <Path
          d="M33 17 Q34 16 35 17 Q36 18 35 17"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M37 17 Q38 16 39 17 Q40 18 39 17"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Genie Mustache */}
        <Path
          d="M32 20 Q36 22 40 20"
          fill="none"
          stroke="#9C27B0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Genie Mouth - Simple, content */}
        <Path
          d="M35 21 Q36 22 37 21"
          fill="none"
          stroke="#9C27B0"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Genie Left Arm - Bent, hand on hip */}
        <Path
          d="M28 25 Q26 27 25 30 Q24 33 26 35"
          fill="none"
          stroke="url(#genieGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Genie Right Arm - Extended, presenting */}
        <Path
          d="M44 25 Q46 23 48 20 Q50 17 52 15"
          fill="none"
          stroke="url(#genieGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Genie Hand - Open palm */}
        <Circle
          cx="52"
          cy="15"
          r="3"
          fill="url(#genieGradient)"
          stroke="#9C27B0"
          strokeWidth="2"
        />
        
        {/* Heart - Floating above hand */}
        <Path
          d="M52 10 Q54 8 56 10 Q58 12 56 14 Q54 16 52 14 Q50 12 52 10"
          fill="url(#heartGradient)"
          stroke="#D50000"
          strokeWidth="1"
        />
        
        {/* Genie Swirling Tail/Smoke Base */}
        <Path
          d="M36 45 Q32 50 30 55 Q28 60 32 62 Q36 64 40 62 Q42 60 44 55 Q46 50 42 45"
          fill="url(#genieGradient)"
          stroke="#9C27B0"
          strokeWidth="2"
          opacity="0.9"
        />
        
        {/* Additional Swirl Details */}
        <Path
          d="M34 48 Q32 52 34 56"
          fill="none"
          stroke="#9C27B0"
          strokeWidth="2"
          opacity="0.8"
        />
        <Path
          d="M38 48 Q40 52 38 56"
          fill="none"
          stroke="#9C27B0"
          strokeWidth="2"
          opacity="0.8"
        />
        
        {/* Magic Sparkles */}
        <G opacity="1">
          <Path
            d="M20 15 L22 17 L20 19 L18 17 Z"
            fill="url(#sparkleGradient)"
          />
          <Path
            d="M52 8 L54 10 L52 12 L50 10 Z"
            fill="url(#sparkleGradient)"
          />
          <Path
            d="M15 35 L17 37 L15 39 L13 37 Z"
            fill="url(#sparkleGradient)"
          />
          <Path
            d="M57 40 L59 42 L57 44 L55 42 Z"
            fill="url(#sparkleGradient)"
          />
          <Path
            d="M25 10 L27 12 L25 14 L23 12 Z"
            fill="url(#sparkleGradient)"
          />
          <Path
            d="M47 25 L49 27 L47 29 L45 27 Z"
            fill="url(#sparkleGradient)"
          />
        </G>
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