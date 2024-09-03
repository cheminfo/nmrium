import React, { createContext, useState } from 'react';

const initialContourCache: Record<string, any> = {};
const ContourCacheContext = createContext(null);
export const ContourCacheProvider = ContourCacheContext.Provider;
export function useContourCache() {
  React.useContext(ContourCacheContext);
  return useState(initialContourCache);
}
