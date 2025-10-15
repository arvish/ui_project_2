import { writable } from 'svelte/store';

const defaultPlant = {
  moisture: 0.65,
  sunlight: 0.7,
  nutrients: 0.8,
  temperature: 22,
  rainAmount: 0,
  simulationSpeed: 1,
  dayTime: 'Morning'
};

export const plantState = writable(defaultPlant);

export function updatePlant(updates: Partial<typeof defaultPlant>) {
  plantState.update(s => ({ ...s, ...updates }));
}
