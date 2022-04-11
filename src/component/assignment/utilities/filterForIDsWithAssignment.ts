export function filterForIDsWithAssignment(assignmentData, ids) {
  return ids.filter((id) =>
    Object.keys(assignmentData.assignment).filter((_id) => _id === id),
  );
}
