// Shared animation utilities and hooks for React Native animations
import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Animation configurations
 */
export const AnimationConfig = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },

  spring: {
    default: {
      friction: 8,
      tension: 40,
    },
    bouncy: {
      friction: 4,
      tension: 80,
    },
    gentle: {
      friction: 10,
      tension: 20,
    },
  },

  easing: {
    ease: Easing.ease,
    easeIn: Easing.in(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    easeInOut: Easing.inOut(Easing.ease),
    bounce: Easing.bounce,
    elastic: Easing.elastic(1),
  },
};

/**
 * Create a fade in/out animation
 */
export const createFadeAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = AnimationConfig.timing.normal,
  easing: any = AnimationConfig.easing.ease
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

/**
 * Create a scale animation
 */
export const createScaleAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = AnimationConfig.timing.normal,
  easing: any = AnimationConfig.easing.easeOut
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

/**
 * Create a spring animation
 */
export const createSpringAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  config: any = AnimationConfig.spring.default
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    ...config,
    useNativeDriver: true,
  });
};

/**
 * Create a slide animation
 */
export const createSlideAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = AnimationConfig.timing.normal,
  easing: any = AnimationConfig.easing.easeOut
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

/**
 * Create a shimmer/loading animation
 */
export const createShimmerAnimation = (
  animatedValue: Animated.Value,
  duration: number = 1500
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
    ])
  );
};

/**
 * Create a flash animation for highlighting changes
 */
export const createFlashAnimation = (
  animatedValue: Animated.Value,
  duration: number = 600
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    useNativeDriver: false,
  });
};

/**
 * Hook for fade in animation on mount
 */
export const useFadeIn = (
  duration: number = AnimationConfig.timing.normal,
  delay: number = 0
) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      createFadeAnimation(fadeAnim, 1, duration).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return fadeAnim;
};

/**
 * Hook for scale in animation on mount
 */
export const useScaleIn = (
  duration: number = AnimationConfig.timing.normal,
  delay: number = 0,
  initialScale: number = 0
) => {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      createScaleAnimation(scaleAnim, 1, duration).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, duration, delay, initialScale]);

  return scaleAnim;
};

/**
 * Hook for shimmer animation
 */
export const useShimmer = (duration: number = 1500) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    createShimmerAnimation(shimmerAnim, duration).start();
  }, [shimmerAnim, duration]);

  return shimmerAnim;
};

/**
 * Hook for press animation
 */
export const usePressAnimation = (
  scaleValue: number = 0.95,
  duration: number = AnimationConfig.timing.fast
) => {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    createScaleAnimation(pressAnim, scaleValue, duration).start();
  };

  const animateOut = () => {
    createSpringAnimation(pressAnim, 1, AnimationConfig.spring.gentle).start();
  };

  return {
    animatedValue: pressAnim,
    animateIn,
    animateOut,
  };
};

/**
 * Hook for slide animation
 */
export const useSlide = (
  initialValue: number = 0,
  duration: number = AnimationConfig.timing.normal
) => {
  const slideAnim = useRef(new Animated.Value(initialValue)).current;

  const slideTo = (toValue: number) => {
    createSlideAnimation(slideAnim, toValue, duration).start();
  };

  const resetSlide = () => {
    slideAnim.setValue(initialValue);
  };

  return {
    animatedValue: slideAnim,
    slideTo,
    resetSlide,
  };
};

/**
 * Hook for flash animation when value changes
 */
export const useFlashOnChange = <T>(
  value: T,
  duration: number = 600
) => {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const prevValue = useRef<T>(value);

  useEffect(() => {
    if (prevValue.current !== value && prevValue.current !== undefined) {
      flashAnim.setValue(0);
      createFlashAnimation(flashAnim, duration).start(() => {
        flashAnim.setValue(0);
      });
    }
    prevValue.current = value;
  }, [value, flashAnim, duration]);

  return flashAnim;
};

/**
 * Stagger animations for multiple items
 */
export const createStaggeredAnimation = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 100
): Animated.CompositeAnimation => {
  const staggeredAnimations = animations.map((animation, index) =>
    Animated.sequence([
      Animated.delay(index * staggerDelay),
      animation,
    ])
  );

  return Animated.parallel(staggeredAnimations);
};

/**
 * Sequence multiple animations
 */
export const createSequenceAnimation = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

/**
 * Parallel multiple animations
 */
export const createParallelAnimation = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.parallel(animations);
};
