import { useQuery } from '@tanstack/react-query';
import { initializeMcp } from '../api/mcp-client';
import { searchSights } from '../api/sights';
import { getResorts } from '../api/resorts';
import { searchRailAway } from '../api/railaway';
import { searchTravelSystem, searchHolidayProducts } from '../api/products';
import type { Sight } from '../types/sight';
import type { Resort } from '../types/resort';
import type { RailAwayProduct } from '../types/railaway';
import type { TravelSystemProduct, HolidayProduct } from '../api/products';

let mcpInitialized = false;

async function ensureMcpInit() {
  if (!mcpInitialized) {
    await initializeMcp();
    mcpInitialized = true;
  }
}

export function useSights(language: string = 'de') {
  return useQuery<Sight[]>({
    queryKey: ['sights', language],
    queryFn: async () => {
      await ensureMcpInit();
      return searchSights({ limit: 1000, language: language as any });
    },
  });
}

export function useResorts() {
  return useQuery<Resort[]>({
    queryKey: ['resorts'],
    queryFn: async () => {
      await ensureMcpInit();
      return getResorts();
    },
  });
}

export function useRailAwayProducts(language: string) {
  return useQuery<RailAwayProduct[]>({
    queryKey: ['railaway', language],
    queryFn: async () => {
      await ensureMcpInit();
      return searchRailAway({ limit: 50, language });
    },
  });
}

export function useTravelProducts(language: string) {
  return useQuery<TravelSystemProduct[]>({
    queryKey: ['travelSystem', language],
    queryFn: async () => {
      await ensureMcpInit();
      return searchTravelSystem({ limit: 50, language });
    },
  });
}

export function useHolidayProducts(language: string) {
  return useQuery<HolidayProduct[]>({
    queryKey: ['holiday', language],
    queryFn: async () => {
      await ensureMcpInit();
      return searchHolidayProducts({ limit: 50, language });
    },
  });
}
