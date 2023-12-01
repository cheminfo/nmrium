import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { produce } from 'immer';
import { describe, it, expect } from 'vitest';

import { deepReplaceDiaIDs } from '../deepReplaceDiaIDs';

describe('deepReplaceDiaIDs', () => {
  it('basic case', () => {
    const data = {
      name: 'test',
      diaIDs: ['1', '2'],
    };
    deepReplaceDiaIDs(data, { '1': '3' });
    expect(data).toEqual({
      name: 'test',
      diaIDs: ['3', '2'],
    });
  });

  it('basic case with immer', () => {
    const data = {
      name: 'test',
      diaIDs: ['1', '2'],
    };
    const newData = produce(data, (draft) => {
      deepReplaceDiaIDs(draft, { '1': '3' });
    });
    expect(data).not.toEqual(newData);
    expect(newData).toEqual({
      name: 'test',
      diaIDs: ['3', '2'],
    });
  });

  it('deepReplaceDiaIDs', () => {
    const data = JSON.parse(
      readFileSync(join(__dirname, 'data/test.json'), 'utf8'),
    );
    const mappings = {
      'did@`@fTeYWaj@@@GzP`HeT': 'Hello World',
    };
    const newData = produce(data, (draft) => {
      deepReplaceDiaIDs(draft, mappings);
    });
    const lines = JSON.stringify(newData, undefined, 2).split('\n');
    const oldID = lines.filter((line) =>
      line.includes('did@`@fTeYWaj@@@GzP`HeT'),
    );
    expect(oldID.length).toBe(0);
    const newID = lines.filter((line) => line.includes('Hello World'));
    expect(newID.length).toBe(1);
  });
});
