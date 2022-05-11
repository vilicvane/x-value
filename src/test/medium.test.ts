import {Medium} from '../library';

test('medium requireCodec should throw on unknown symbol', () => {
  let medium = new Medium('Random', {
    codecs: {},
  });

  expect(() => medium.requireCodec(Symbol())).toThrow('Unknown codec symbol');
});
