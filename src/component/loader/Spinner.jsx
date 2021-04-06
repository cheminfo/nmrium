import { useState, Fragment, useEffect, useContext } from 'react';

import { useChartData } from '../context/ChartContext';

import NoData from './NoData';
import { spinnerContext } from './SpinnerContext';

function Spinner({ isLoading = true, message = undefined }) {
  const { data } = useChartData();
  const [checkEmpty, startCheckEmpty] = useState(false);

  useEffect(() => {
    let timeour = null;
    if (!isLoading) {
      timeour = setTimeout(() => {
        startCheckEmpty(true);
      }, 500);
    }
    return () => {
      clearTimeout(timeour);
    };
  }, [isLoading]);

  const getSpinner = useContext(spinnerContext);

  return (
    <Fragment>
      {isLoading && getSpinner()}
      {checkEmpty && !isLoading && (
        <NoData isEmpty={data && data.length === 0} message={message} />
      )}
    </Fragment>
  );
}

export default Spinner;
