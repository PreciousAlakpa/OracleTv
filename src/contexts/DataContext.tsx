'use client';

import React, { createContext, useContext } from 'react';

interface DataContextType {
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  refreshData: async () => {}
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  return (
    <DataContext.Provider value={{ refreshData: async () => {} }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
