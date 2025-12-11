import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const APP_NAME = 'VITWISE';

export default function SplashScreen({ onAnimationComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const cursorBlinkRef = useRef(null);

  useEffect(() => {
    // Start background fade in
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Blinking cursor animation
    cursorBlinkRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    cursorBlinkRef.current.start();

    // Logo animation - appears first with scale and rotation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // Typewriter effect - starts after logo appears
    let currentIndex = 0;
    let typeInterval = null;
    
    const typewriterDelay = setTimeout(() => {
      typeInterval = setInterval(() => {
        if (currentIndex < APP_NAME.length) {
          setDisplayedText(APP_NAME.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          typeInterval = null;
          
          // Stop cursor blinking when text completes
          if (cursorBlinkRef.current) {
            cursorBlinkRef.current.stop();
            Animated.timing(cursorOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
          
          // After text completes, wait a moment then fade out
          setTimeout(() => {
            Animated.timing(containerOpacity, {
              toValue: 0,
              duration: 400,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }).start(() => {
              onAnimationComplete();
            });
          }, 600);
        }
      }, 120); // 120ms per letter for smooth typewriter effect
    }, 600); // Start typing after logo animation begins

    return () => {
      clearTimeout(typewriterDelay);
      if (typeInterval) {
        clearInterval(typeInterval);
      }
      if (cursorBlinkRef.current) {
        cursorBlinkRef.current.stop();
      }
    };
  }, []);

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Professional gradient background */}
      <Animated.View style={[styles.backgroundContainer, { opacity: backgroundOpacity }]}>
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        {/* Subtle accent gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(59, 130, 246, 0.08)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.accentOverlay}
        />
      </Animated.View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo - appears first */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { rotate: logoRotation },
              ],
            },
          ]}
        >
          <View style={styles.logo}>
            <View style={styles.logoShape}>
              <View style={styles.logoInner} />
            </View>
          </View>
        </Animated.View>

        {/* App name with typewriter effect */}
        <View style={styles.textContainer}>
          <Text style={styles.appName}>
            {displayedText}
            {displayedText.length < APP_NAME.length && (
              <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                |
              </Animated.Text>
            )}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  accentOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoShape: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoInner: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 8,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
  },
  cursor: {
    fontSize: 48,
    color: '#3B82F6',
    fontWeight: '300',
    opacity: 1,
  },
});
