import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const GenieIcon = ({ size = 80, color = "#FF6B8A" }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Defs>
          <LinearGradient id="genieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#E91E63" />
          </LinearGradient>
          <LinearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF1744" />
            <Stop offset="100%" stopColor="#D50000" />
          </LinearGradient>
        </Defs>
        
        {/* Genie Body - Rounded, plump figure matching logo */}
        <Path
          d="M40 20 Q30 20 25 28 Q20 36 22 48 Q24 60 40 60 Q56 60 58 48 Q60 36 55 28 Q50 20 40 20"
          fill={color}
          stroke="#9C27B0"
          strokeWidth="2"
        />
        
        {/* Genie Head */}
        <Circle
          cx="40"
          cy="25"
          r="10"
          fill={color}
          stroke="#9C27B0"
          strokeWidth="2"
        />
        
        {/* Genie Hair Bun/Topknot */}
        <Circle
          cx="40"
          cy="18"
          r="4"
          fill="#9C27B0"
        />
        
        {/* Genie Eyes - Closed, content expression like logo */}
        <Path
          d="M36 23 Q37 22 38 23 Q39 24 38 23"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M42 23 Q43 22 44 23 Q45 24 44 23"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Genie Mustache - Prominent handlebar like logo */}
        <Path
          d="M35 28 Q40 30 45 28"
          fill="none"
          stroke="#9C27B0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Genie Mouth - Simple, content */}
        <Path
          d="M38 30 Q40 31 42 30"
          fill="none"
          stroke="#9C27B0"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Genie Left Arm - Bent, hand on hip like logo */}
        <Path
          d="M30 35 Q27 37 25 42 Q23 47 26 50"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Genie Right Arm - Extended, presenting like logo */}
        <Path
          d="M50 35 Q53 33 56 28 Q59 23 62 20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Genie Hand - Open palm */}
        <Circle
          cx="62"
          cy="20"
          r="3"
          fill={color}
          stroke="#9C27B0"
          strokeWidth="2"
        />
        
        {/* Heart - Floating above hand like logo */}
        <Path
          d="M62 12 Q65 9 68 12 Q71 15 68 18 Q65 21 62 18 Q59 15 62 12"
          fill="url(#heartGradient)"
          stroke="#D50000"
          strokeWidth="1"
        />
        
        {/* Genie Swirling Tail/Smoke Base - Characteristic genie tail */}
        <Path
          d="M40 60 Q35 65 30 70 Q25 75 32 78 Q40 80 48 78 Q55 75 50 70 Q45 65 40 60"
          fill={color}
          stroke="#9C27B0"
          strokeWidth="2"
          opacity="0.9"
        />
        
        {/* Additional Swirl Details */}
        <Path
          d="M37 62 Q35 66 37 70"
          fill="none"
          stroke="#9C27B0"
          strokeWidth="2"
          opacity="0.8"
        />
        <Path
          d="M43 62 Q45 66 43 70"
          fill="none"
          stroke="#9C27B0"
          strokeWidth="2"
          opacity="0.8"
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