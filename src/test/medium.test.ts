import * as x from '../library';

test('medium requireCodec should throw on unknown symbol', () => {
  const medium = new x.Medium({
    codecs: {},
  });

  expect(() => medium.getCodec(Symbol())).toMatchInlineSnapshot(`[Function]`);
});
