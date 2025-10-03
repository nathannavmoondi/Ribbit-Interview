import React, { createContext, useContext, useState, useMemo } from 'react';

interface SelectionContextValue {
  selectedAirportId: string | null;
  setSelectedAirportId: React.Dispatch<React.SetStateAction<string | null>>;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

//return selection provider for dashboard with the state of selected airport id and a function to set it
export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(null);
  const value = useMemo(() => ({ selectedAirportId, setSelectedAirportId }), [selectedAirportId]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

//clients can use this to get context.  savesa  bit of typing.
export const useSelection = (): SelectionContextValue => {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within a SelectionProvider');
  return ctx;
};
