import { useCallback, useEffect, useState } from 'react';

// Runs an async loader and tracks { data, isLoading, error }. Call reload() to run it again.
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, isLoading: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (active) setState((current) => ({ ...current, isLoading: true, error: null }));
        return loader();
      })
      .then((data) => active && setState({ data, isLoading: false, error: null }))
      .catch((error) => active && setState((current) => ({ ...current, isLoading: false, error })));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass the loader's inputs as deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { ...state, setData: (data) => setState((s) => ({ ...s, data })), reload };
}
