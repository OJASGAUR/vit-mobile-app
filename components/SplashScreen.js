import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing, 
  Dimensions,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onAnimationComplete }) {
  // Animation refs
  const fadeMain = useRef(new Animated.Value(0)).current;
  const scaleMain = useRef(new Animated.Value(0.9)).current;
  const particleScale = useRef(new Animated.Value(0)).current;
  const gradientRotate = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(1)).current;
  const textReveal = useRef(new Animated.Value(0)).current;
  const fadeOutAll = useRef(new Animated.Value(1)).current;
  const loaderWidth = useRef(new Animated.Value(0)).current; // NEW: Separate loader animation
  
  // Particle animations array
  const particleAnims = Array.from({ length: 8 }, () => ({
    scale: useRef(new Animated.Value(0)).current,
    rotate: useRef(new Animated.Value(0)).current,
    x: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  }));

  // Text animation array
  const textAnims = Array.from({ length: 3 }, () => ({
    opacity: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(20)).current,
  }));

  useEffect(() => {
    // Complex animation sequence
    const gradientAnimation = Animated.loop(
      Animated.timing(gradientRotate, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Main entrance
    Animated.parallel([
      Animated.timing(fadeMain, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleMain, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(particleScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(textReveal, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Loader animation
      Animated.timing(loaderWidth, {
        toValue: 1,
        duration: 1200,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // Important: set to false for width animation
      }),
    ]).start();

    // Start gradient rotation
    gradientAnimation.start();

    // Particle animations with delays
    particleAnims.forEach((particle, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.parallel([
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotate, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.spring(particle.x, {
            toValue: Math.random() * 200 - 100,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(particle.y, {
            toValue: Math.random() * 200 - 100,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0.4,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Text animations with staggered delays
    textAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(500 + index * 150),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Ripple effect
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 3,
          duration: 1600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 1600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Complete after 2.8 seconds
    const timer = setTimeout(() => {
      gradientAnimation.stop();
      
      // Coordinated exit - fade out EVERYTHING together
      const exitAnimations = [
        Animated.timing(fadeMain, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleMain, {
          toValue: 1.1,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeOutAll, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(loaderWidth, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
      ];
      
      // Also fade out all particles
      particleAnims.forEach(particle => {
        exitAnimations.push(
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          })
        );
      });
      
      // Also fade out all text
      textAnims.forEach(textAnim => {
        exitAnimations.push(
          Animated.timing(textAnim.opacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          })
        );
      });
      
      Animated.parallel(exitAnimations).start(() => {
        onAnimationComplete();
      });
    }, 2800);

    return () => {
      clearTimeout(timer);
      gradientAnimation.stop();
    };
  }, []);

  const gradientInterpolate = gradientRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Interpolate loader width
  const loaderWidthInterpolated = loaderWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Abstract particle shapes
  const Particle = ({ anim, index, size, color }) => {
    const rotateInterpolate = anim.rotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${index % 2 === 0 ? '360deg' : '-360deg'}`],
    });

    return (
      <Animated.View
        style={[
          styles.particle,
          {
            width: size,
            height: size,
            backgroundColor: color,
            opacity: anim.opacity,
            transform: [
              { scale: anim.scale },
              { rotate: rotateInterpolate },
              { translateX: anim.x },
              { translateY: anim.y },
            ],
          },
        ]}
      />
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeOutAll }]}>
      {/* Gradient Background using LinearGradient */}
      <Animated.View
        style={[
          styles.gradientContainer,
          {
            transform: [
              { rotate: gradientInterpolate },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(74, 0, 224, 0.3)', 'transparent', 'rgba(255, 107, 107, 0.2)', 'transparent']}
          start={{ x: 0.3, y: 0.5 }}
          end={{ x: 0.7, y: 0.2 }}
          style={styles.gradientBackground}
        />
      </Animated.View>

      {/* Ripple effect */}
      <Animated.View
        style={[
          styles.ripple,
          {
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />

      {/* Abstract particles */}
      {particleAnims.map((anim, index) => (
        <Particle
          key={index}
          anim={anim}
          index={index}
          size={index % 3 === 0 ? 60 : index % 3 === 1 ? 40 : 20}
          color={index % 4 === 0 ? '#FF6B6B' : 
                 index % 4 === 1 ? '#4ECDC4' : 
                 index % 4 === 2 ? '#FFD166' : '#6A0572'}
        />
      ))}

      {/* Main content */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: fadeMain,
            transform: [{ scale: scaleMain }],
          },
        ]}
      >
        {/* Abstract geometric logo */}
        <View style={styles.geometricLogo}>
          <View style={[styles.geoShape, styles.geoShape1]} />
          <View style={[styles.geoShape, styles.geoShape2]} />
          <View style={[styles.geoShape, styles.geoShape3]} />
          <View style={[styles.geoShape, styles.geoShape4]} />
          <View style={styles.centerDot} />
        </View>

        {/* App title with modern typography */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleMain}>VIT</Text>
          <Text style={styles.titleAccent}>WISE</Text>
        </View>

        {/* Animated tagline */}
        <Animated.View 
          style={[
            styles.taglineContainer,
            {
              opacity: textReveal,
              transform: [{ scale: textReveal }],
            }
          ]}
        >
          <Text style={styles.tagline}>SMART CAMPUS</Text>
          <View style={styles.taglineLine} />
          <Text style={styles.taglineSub}>COMPANION</Text>
        </Animated.View>

        {/* Animated feature highlights */}
        <View style={styles.featuresContainer}>
          {[
            { label: "Timetable", delay: 0 },
            { label: "Campus Tools", delay: 1 },
            { label: "Student Hub", delay: 2 },
          ].map((feature, index) => (
            <Animated.View
              key={feature.label}
              style={[
                styles.featureBadge,
                {
                  opacity: textAnims[index].opacity,
                  transform: [{ translateY: textAnims[index].translateY }],
                },
              ]}
            >
              <Text style={styles.featureText}>{feature.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Modern loading indicator - FIXED */}
        <View style={styles.loaderContainer}>
          <Animated.View 
            style={[
              styles.loaderTrack,
              {
                transform: [{ scaleX: particleScale }],
              },
            ]} 
          />
          <Animated.View style={styles.loaderFillContainer}>
            <LinearGradient
              colors={['#4A00E0', '#4ECDC4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loaderFill}
            />
            <Animated.View 
              style={[
                styles.loaderMask,
                {
                  width: loaderWidthInterpolated,
                },
              ]}
            />
          </Animated.View>
        </View>

        {/* Subtle version info */}
        <Text style={styles.version}>VIT University • Premium Experience</Text>
      </Animated.View>

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', '#0A0E17']}
        style={styles.bottomGradient}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradientContainer: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.75,
    opacity: 0.7,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  mainContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  geometricLogo: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  geoShape: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  geoShape1: {
    width: 120,
    height: 120,
    borderRadius: 60,
    transform: [{ rotate: '45deg' }],
  },
  geoShape2: {
    width: 100,
    height: 100,
    borderRadius: 50,
    transform: [{ rotate: '-45deg' }],
    backgroundColor: 'rgba(74, 0, 224, 0.2)',
    borderColor: 'rgba(74, 0, 224, 0.4)',
  },
  geoShape3: {
    width: 80,
    height: 80,
    borderRadius: 40,
    transform: [{ rotate: '0deg' }],
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  geoShape4: {
    width: 60,
    height: 60,
    borderRadius: 30,
    transform: [{ rotate: '90deg' }],
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderColor: 'rgba(78, 205, 196, 0.4)',
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#4A00E0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  titleMain: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(74, 0, 224, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  titleAccent: {
    fontSize: 48,
    fontWeight: '300',
    color: '#4ECDC4',
    letterSpacing: 6,
    marginLeft: 8,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 8,
    marginBottom: 4,
  },
  taglineLine: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(78, 205, 196, 0.5)',
    marginVertical: 8,
  },
  taglineSub: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 50,
  },
  featureBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  loaderContainer: {
    width: 200,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
    marginBottom: 30,
    overflow: 'hidden',
  },
  loaderTrack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  loaderFillContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  loaderFill: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  loaderMask: {
    position: 'absolute',
    right: 0,
    height: '100%',
    backgroundColor: '#0A0E17', // Same as background
  },
  version: {
    fontSize: 11,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
});