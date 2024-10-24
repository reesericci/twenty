import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { isNonEmptyString } from '@sniptt/guards';
import { FixedLengthArray } from 'type-fest';

export const useAvailableComponentInstanceIdOrThrow = <
  T extends { instanceId: string },
>(
  Context:
    | FixedLengthArray<ComponentInstanceStateContext<any>, 2>
    | ComponentInstanceStateContext<T>,
  instanceIdFromProps?: string,
): string => {
  const firstInstanceStateContext = useComponentInstanceStateContext(
    Array.isArray(Context) ? Context[0] : Context,
  );
  const secondInstanceStateContext = useComponentInstanceStateContext(
    Array.isArray(Context) ? Context[1] : Context,
  );

  const instanceIdFromContext =
    secondInstanceStateContext?.instanceId ??
    firstInstanceStateContext?.instanceId;

  if (isNonEmptyString(instanceIdFromProps)) {
    return instanceIdFromProps;
  } else if (isNonEmptyString(instanceIdFromContext)) {
    return instanceIdFromContext;
  } else {
    throw new Error(
      'Instance id is not provided and cannot be found in context.',
    );
  }
};
