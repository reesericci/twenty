import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { isDefined } from 'twenty-ui';
import { FixedLengthArray } from 'type-fest';

class ComponentInstanceContextMap {
  constructor() {
    if (!isDefined((window as any).componentComponentStateContextMap)) {
      (window as any).componentComponentStateContextMap = new Map();
    }
  }

  public get(
    key: string,
  ):
    | FixedLengthArray<ComponentInstanceStateContext<any>, 2>
    | ComponentInstanceStateContext<any> {
    return (window as any).componentComponentStateContextMap.get(key);
  }

  public set(
    key: string,
    context:
      | FixedLengthArray<ComponentInstanceStateContext<any>, 2>
      | ComponentInstanceStateContext<any>,
  ) {
    (window as any).componentComponentStateContextMap.set(key, context);
  }
}

export const globalComponentInstanceContextMap =
  new ComponentInstanceContextMap();
