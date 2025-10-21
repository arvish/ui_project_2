import { writable } from 'svelte/store';

// --- Default plant state ---
const defaultPlant = {
  moisture: 0.65,
  sunlight: 0.7,
  nutrients: 0.8,
  temperature: 22,
  tempBounds: { min: 18, max: 28 },
  rainAmount: 0,
  simulationSpeed: 1,
  dayTime: 'Morning'
};

export const plantState = writable({ ...defaultPlant });

export function updatePlant(updates: Partial<typeof defaultPlant>) {
  plantState.update(s => ({ ...s, ...updates }));
}

export function setMoisture(delta: number) {
  plantState.update(s => ({
    ...s,
    moisture: Math.min(Math.max(s.moisture + delta, 0), 1)
  }));
}

export function setNutrients(delta: number) {
  plantState.update(s => ({
    ...s,
    nutrients: Math.min(Math.max(s.nutrients + delta, 0), 1)
  }));
}

export function setSunlight(delta: number) {
  plantState.update(s => ({
    ...s,
    sunlight: Math.min(Math.max(s.sunlight + delta, 0), 1)
  }));
}

export function setTemperature(temp: number) {
  plantState.update(s => ({ ...s, temperature: temp }));
}

export function setTempBounds(min: number, max: number) {
  plantState.update(s => ({
    ...s,
    tempBounds: { min, max }
  }));
}

export function setDayTime(label: string) {
  plantState.update(s => ({ ...s, dayTime: label }));
}

export function resetPlant() {
  plantState.set({ ...defaultPlant });
}
