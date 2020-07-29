export function findOuterColumns(crossbars) {
  return crossbars
    .filter((crossbar) => crossbar.type === CrossbarTypes.AGAINST_OUTER || crossbar.type === CrossbarTypes.TOWARDS_OUTER)
    .map((crossbar) => crossbar.columns);
}

export function createColumnsQueue(outerColumns) {
  const original = outerColumns[0][0];
  let actual = outerColumns[0][1];
  outerColumns.splice(0, 1);
  let queue = [original];
  for(let i = 0; i < 11; i++) {
    for (const [index, col] of outerColumns.entries()) {
      const [firstCol, secondCol] = col;
      if(secondCol === actual) {
        queue.push(actual);
        actual = firstCol;
        outerColumns = outerColumns.filter((column, colIndex) => colIndex !== index);
        break;
      }
      if(firstCol === actual) {
        queue.push(actual);
        actual = secondCol;
        outerColumns = outerColumns.filter((column, colIndex) => colIndex !== index);
        break;
      }
    }
  }
  return queue;
}