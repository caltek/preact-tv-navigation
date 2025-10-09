import SpatialNavigator from '../spatial-navigation/SpatialNavigator';
import { useEffect } from 'preact/hooks';
import { remoteControlSubscriber, remoteControlUnsubscriber } from '../utils/remoteControl';
import { useDeviceType } from '../context/DeviceTypeContext';

export const useRemoteControl = ({
  spatialNavigator,
  isActive,
}: {
  spatialNavigator: SpatialNavigator;
  isActive: boolean;
}) => {
  const { setDeviceType } = useDeviceType();
  
  useEffect(() => {
    if (!remoteControlSubscriber) {
      console.warn(
        '[Preact Spatial Navigation] You probably forgot to configure the remote control. Please call the configuration function.',
      );

      return;
    }

    if (!isActive) {
      return () => undefined;
    }

    const listener = remoteControlSubscriber((direction) => {
      setDeviceType('remoteKeys');
      spatialNavigator.handleKeyDown(direction);
    });
    
    return () => {
      if (!remoteControlUnsubscriber) {
        console.warn(
          '[Preact Spatial Navigation] You did not provide a remote control unsubscriber. Are you sure you called configuration correctly?',
        );

        return;
      }
      remoteControlUnsubscriber(listener);
    };
  }, [spatialNavigator, isActive, setDeviceType]);
};

