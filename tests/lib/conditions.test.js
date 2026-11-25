import { expect, test } from 'vitest';
import { conditionInfo } from '../../src/lib/conditions.js';

test('groups clear/cloud codes', () => {
  expect(conditionInfo(1000).group).toBe('clear');
  expect(conditionInfo(1003).group).toBe('partly');
  expect(conditionInfo(1006).group).toBe('cloudy');
  expect(conditionInfo(1009).group).toBe('overcast');
});

test('fog and haze', () => {
  expect(conditionInfo(1135).group).toBe('fog');
  expect(conditionInfo(1030, 'Smoky Haze').group).toBe('haze');
  expect(conditionInfo(1036, 'Smoky haze').group).toBe('haze'); // undocumented code seen live
});

test('rain intensities', () => {
  expect(conditionInfo(1153)).toMatchObject({ group: 'drizzle', precip: 'rain' });
  expect(conditionInfo(1195)).toMatchObject({ group: 'rain', precip: 'rain', intensity: 1 });
  expect(conditionInfo(1183).intensity).toBe(0.35);
  expect(conditionInfo(1189).intensity).toBe(0.7);
});

test('snow, sleet, thunder', () => {
  expect(conditionInfo(1225)).toMatchObject({ group: 'snow', precip: 'snow', intensity: 1 });
  expect(conditionInfo(1207).precip).toBe('sleet');
  expect(conditionInfo(1276)).toMatchObject({ group: 'thunder', lightning: true, precip: 'rain' });
  expect(conditionInfo(1087)).toMatchObject({ group: 'thunder', lightning: true, precip: 'none' });
});

test('unknown code falls back to cloudy', () => {
  expect(conditionInfo(9999)).toMatchObject({ group: 'cloudy', precip: 'none', lightning: false });
});
