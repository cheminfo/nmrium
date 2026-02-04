import type { TextStyle } from '@zakodium/nmrium-core';
import type { SVGStyledTextUserConfig } from 'react-science/ui';
import { describe, expectTypeOf, it } from 'vitest';

describe('interoperability between nmrium-core and react-science', () => {
  it('TextStyle should match `SVGStyledTextUserConfig`', () => {
    expectTypeOf<TextStyle>().toEqualTypeOf<SVGStyledTextUserConfig>();
  });
});
