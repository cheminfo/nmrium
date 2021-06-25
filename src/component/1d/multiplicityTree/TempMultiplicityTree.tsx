import { memo } from 'react';

import TempRangeWrapper from '../../hoc/TempRangeWrapper';

import MultiplicityTree from './MultiplicityTree';

function TempMultiplicityTree({ range }) {
  return (
    range?.signal &&
    range.signal.length > 0 &&
    range.signal.map((signal) => (
      <MultiplicityTree
        rangeFrom={range.from}
        rangeTo={range.to}
        signal={signal}
        key={signal.id}
      />
    ))
  );
}

export default TempRangeWrapper(memo(TempMultiplicityTree));
