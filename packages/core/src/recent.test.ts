import { pushRecent } from './recent';

describe('pushRecent', () => {
  it('moves an existing id to the front without duplicates', () => {
    expect(pushRecent(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });
  it('caps the list', () => {
    expect(pushRecent(['a', 'b'], 'c', 2)).toEqual(['c', 'a']);
  });
});
