import { describe, it, expect } from 'vitest';

import getAtomsFromMF from '../getAtomsFromMF';

describe('getAtomsFromMF', () => {
  it('correct mf', () => {
    const atoms = getAtomsFromMF('C10 H20 Cl O3 Br2 C3 Cl3');
    expect(atoms).toStrictEqual({ C: 13, H: 20, Cl: 4, O: 3, Br: 2 });
  });
  it('wrong mf', () => {
    expect(() => {
      getAtomsFromMF('ab C10 H20 Cl O3 Br2 C3 Cl3');
    }).toThrow('MF can not be parsed: ab C10 H20 Cl O3 Br2 C3 Cl3');
  });
});
