import { useMemo } from 'preact/hooks';
import SpatialNavigator, { type OnDirectionHandledWithoutMovement } from '../spatial-navigation/SpatialNavigator';

type UseCreateSpatialNavigatorParams = {
  onDirectionHandledWithoutMovementRef: { current: OnDirectionHandledWithoutMovement };
};

export const useCreateSpatialNavigator = ({
  onDirectionHandledWithoutMovementRef,
}: UseCreateSpatialNavigatorParams): SpatialNavigator => {
  const spatialNavigator = useMemo(
    () =>
      new SpatialNavigator({
        onDirectionHandledWithoutMovementRef,
      }),
    // We only want to create the navigator once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return spatialNavigator;
};

