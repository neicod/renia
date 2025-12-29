// @env: mixed
import React from 'react';

export const useIsClient = () => {
  // Always initialize with false on both SSR and CSR to ensure hydration match
  // The effect will set it to true on CSR after hydration is complete
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

export default useIsClient;
