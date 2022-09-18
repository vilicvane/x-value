import * as x from '../library';

test('medium requireCodec should throw on unknown symbol', () => {
  const medium = new x.Medium('Random', {
    codecs: {},
  });

  expect(() => medium.requireCodec(Symbol())).toThrow('Unknown codec symbol');
});
