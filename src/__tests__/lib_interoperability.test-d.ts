import type { TextStyle } from '@zakodium/nmrium-core';
import type { svgTextStyleFieldsSchema } from 'react-science/ui';
import { describe, expectTypeOf, it } from 'vitest';
import type { z } from 'zod';

describe('interoperability between nmrium-core and react-science', () => {
  it('TextStyle should match `z.output<typeof svgTextStyleFieldsSchema>`', () => {
    expectTypeOf<TextStyle>().toEqualTypeOf<
      z.output<typeof svgTextStyleFieldsSchema>
    >();
  });
});
