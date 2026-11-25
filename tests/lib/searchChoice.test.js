import { expect, test } from 'vitest';
import { enterChoice } from '../../src/lib/searchChoice.js';

const la = { id: 1, name: 'Los Angeles' };
const lagos = { id: 2, name: 'Lagos' };

test('highlighted result when the list matches what was typed', () => {
  expect(enterChoice({ text: 'la', searched: 'la', results: [la, lagos], active: 1 })).toEqual({ place: lagos });
});

test('first result when nothing is highlighted but results are current', () => {
  expect(enterChoice({ text: 'la', searched: 'la', results: [la, lagos], active: -1 })).toEqual({ place: la });
});

test('stale results are never used; the typed text is searched instead', () => {
  expect(enterChoice({ text: 'Los Angeles', searched: 'Lo', results: [lagos], active: 0 })).toEqual({ query: 'Los Angeles' });
});

test('no results → typed text', () => {
  expect(enterChoice({ text: 'Pune', searched: 'Pune', results: [], active: -1 })).toEqual({ query: 'Pune' });
});

test('empty input → nothing', () => {
  expect(enterChoice({ text: '  ', searched: '', results: [], active: -1 })).toBeNull();
});
