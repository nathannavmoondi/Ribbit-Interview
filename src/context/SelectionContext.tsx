import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockAirports } from '../data/MockAirports';
import { type Airport } from 'types';

///all the selection state (selected airport) and editable airport data (for name edits) is kept in this context
interface SelectionContextValue {
  selectedAirportId: string | null;
  setSelectedAirportId: React.Dispatch<React.SetStateAction<string | null>>;
  
  airports: Airport[];
  updateAirportName: (id: string, name: string) => void;
}

// Convenience hook.  Saves us from having to import useContext and SelectionContext in every component that needs it
const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

// Provide selection AND editable airport data so components can stay in sync
export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(null);
  const [airports, setAirports] = useState<Airport[]>(mockAirports);

  const updateAirportName = useCallback((id: string, name: string) => {
    setAirports(prev => prev.map(a => a.id === id ? { ...a, name } : a));
  }, []);

  //provide value object to context consumers.  Memoize to avoid unnecessary rerenders
  const value = useMemo(() => ({ selectedAirportId, setSelectedAirportId, airports, updateAirportName }), 
  [selectedAirportId, airports, updateAirportName]); //recreate when any of these change

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

// Convenience hook
export const useSelection = (): SelectionContextValue => {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within a SelectionProvider');
  return ctx;
};
