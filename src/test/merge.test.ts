import {internal_mergeIntersectionPartials as merge} from '../library/index.js';

test('merge for object-type should work', () => {
  expect(
    merge([
      {
        foo: 'abc',
        bar: 123,
      },
      {
        yoha: true,
      },
      {
        bar: 456,
      },
    ]),
  ).toStrictEqual({
    foo: 'abc',
    bar: 456,
    yoha: true,
  });

  expect(
    merge([
      {
        foo: 'abc',
        bar: {
          x: 1,
        },
      },
      {
        bar: {
          y: 2,
        },
      },
    ]),
  ).toStrictEqual({
    foo: 'abc',
    bar: {
      x: 1,
      y: 2,
    },
  });

  expect(
    merge([
      {
        foo: 'abc',
        bar: [
          {
            x: 1,
          },
        ],
      },
      {
        bar: [
          {
            x: 1,
            y: 2,
          },
        ],
      },
    ]),
  ).toStrictEqual({
    foo: 'abc',
    bar: [
      {
        x: 1,
        y: 2,
      },
    ],
  });

  expect(merge([{a: 1}, {a: 2}, {a: 3}])).toStrictEqual({
    a: 3,
  });
});

test('merge for object-type should error for unexpected cases', () => {
  expect(() => merge([null, 123])).toThrow(TypeError);
  expect(() => merge([{}, 123])).toThrow(TypeError);
});
