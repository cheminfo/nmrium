import generateID from '../generateID';

test('generateID', () => {
  const id = generateID();
  expect(id).toHaveLength(8);
});
