import { createContext } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import type { JSX } from 'preact';

/**
 * Device types supported by the library
 */
export type DeviceType = 'tv' | 'desktop' | 'mobile' | 'tablet';

/**
 * Device type context value
 */
export interface DeviceTypeContextValue {
  deviceType: DeviceType;
  isTv: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

/**
 * Props for SpatialNavigationDeviceTypeProvider
 */
export interface SpatialNavigationDeviceTypeProviderProps {
  /** Device type - can be manually specified or auto-detected */
  deviceType?: DeviceType;
  /** Children elements */
  children: JSX.Element | JSX.Element[];
}

const DeviceTypeContext = createContext<DeviceTypeContextValue | null>(null);

/**
 * Detect device type based on user agent and screen size
 */
function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';

  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  // Check for TV devices
  if (
    userAgent.includes('tv') ||
    userAgent.includes('smarttv') ||
    userAgent.includes('googletv') ||
    userAgent.includes('appletv') ||
    userAgent.includes('hbbtv') ||
    userAgent.includes('pov_tv') ||
    userAgent.includes('netcast') ||
    userAgent.includes('nettv')
  ) {
    return 'tv';
  }

  // Check for mobile devices
  if (
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) &&
    width < 768
  ) {
    return 'mobile';
  }

  // Check for tablets
  if (
    (/ipad|android/i.test(userAgent) && width >= 768) ||
    (width >= 768 && width < 1024)
  ) {
    return 'tablet';
  }

  // Default to desktop
  return 'desktop';
}

/**
 * SpatialNavigationDeviceTypeProvider - Provides device type context
 * Detects or accepts device type and provides it to child components
 */
export function SpatialNavigationDeviceTypeProvider({
  deviceType: providedDeviceType,
  children,
}: SpatialNavigationDeviceTypeProviderProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>(
    providedDeviceType || detectDeviceType()
  );

  // Re-detect on window resize (for responsive behavior)
  useEffect(() => {
    if (providedDeviceType) {
      setDeviceType(providedDeviceType);
      return;
    }

    const handleResize = () => {
      setDeviceType(detectDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [providedDeviceType]);

  const contextValue: DeviceTypeContextValue = {
    deviceType,
    isTv: deviceType === 'tv',
    isDesktop: deviceType === 'desktop',
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
  };

  return (
    <DeviceTypeContext.Provider value={contextValue}>
      {children}
    </DeviceTypeContext.Provider>
  );
}

/**
 * Hook to access device type context
 * 
 * @returns Device type context value
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isTv, deviceType } = useDeviceType();
 *   
 *   return (
 *     <div>
 *       {isTv ? 'TV Interface' : 'Standard Interface'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDeviceType(): DeviceTypeContextValue {
  const context = useContext(DeviceTypeContext);

  if (!context) {
    // Return default values if not within provider
    const defaultDeviceType = detectDeviceType();
    return {
      deviceType: defaultDeviceType,
      isTv: defaultDeviceType === 'tv',
      isDesktop: defaultDeviceType === 'desktop',
      isMobile: defaultDeviceType === 'mobile',
      isTablet: defaultDeviceType === 'tablet',
    };
  }

  return context;
}

