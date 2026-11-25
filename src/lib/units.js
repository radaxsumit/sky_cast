export const convertTemp = (c, f, unit) => Math.round(unit === 'F' ? f : c);
export const convertWind = (kph, mph, unit) => Math.round(unit === 'mph' ? mph : kph);
