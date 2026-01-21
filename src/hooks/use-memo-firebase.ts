'use client';
import React, { useMemo, DependencyList } from 'react';
import { isEqual } from 'lodash';

// Custom hook to deeply compare dependencies for React's memoization hooks
function useDeepCompareMemoize(value: DependencyList) {
  const ref = React.useRef<DependencyList>([]);

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

export function useMemoFirebase<T>(
  factory: () => T,
  deps: DependencyList | undefined
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, useDeepCompareMemoize(deps || []));
}
