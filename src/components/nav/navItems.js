import { Clock3, LayoutDashboard, Map, Settings2, Star } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
  { id: 'saved', label: 'Saved', icon: Star },
  { id: 'clock', label: 'Clock', icon: Clock3 },
  { id: 'map', label: 'Map', icon: Map, soon: true },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];
