import { SearchType } from "./pages/types";

export const ROUTES = {
  main: '/',
  agentSearch: '/makelaar-zoeken',
  search: (type: SearchType, place: string) =>
    `/zoeken/${type}/?selected_area=${encodeURIComponent(place)}`,
  searchMap: (type: SearchType, place: string) =>
    `/zoeken/kaart/${type}?selected_area=${encodeURIComponent(place)}`,
} as const;
export { SearchType };

