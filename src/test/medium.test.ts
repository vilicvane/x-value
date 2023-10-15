import * as x from '../library/index.js';

test('medium requireCodec should throw on unknown symbol', () => {
  const medium = new x.Medium({
    codecs: {},
  });

  expect(() => medium.getCodec(Symbol())).toMatchInlineSnapshot(`[Function]`);
});
