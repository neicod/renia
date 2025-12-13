// @env: mixed
import React from 'react';
import { customerStore, type CustomerState } from '../services/customerStore';

const getSnapshot = () => customerStore.getState();

export const useCustomer = (): CustomerState => {
  return React.useSyncExternalStore(customerStore.subscribe, getSnapshot, getSnapshot);
};

export default useCustomer;
