// @env: mixed
import React from 'react';

export const useIsClient = () => {
  const [isClient, setIsClient] = React.useState(() => typeof window !== 'undefined');

  React.useEffect(() => {
    if (!isClient) {
      setIsClient(true);
    }
  }, [isClient]);

  return isClient;
};

export default useIsClient;
