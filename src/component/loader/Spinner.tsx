import { useState, Fragment, useEffect, useContext, ReactNode } from 'react';

import { useChartData } from '../context/ChartContext';

import NoData from './NoData';
import { spinnerContext } from './SpinnerContext';

interface SpinnerProps {
  isLoading?: boolean;
  emptyText?: ReactNode;
}

function Spinner({ isLoading = true, emptyText = undefined }: SpinnerProps) {
  const { data } = useChartData();
  const [checkEmpty, startCheckEmpty] = useState(false);

  useEffect(() => {
    let timeout: any = null;
    if (!isLoading) {
      timeout = setTimeout(() => {
        startCheckEmpty(true);
      }, 500);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isLoading]);

  const getSpinner = useContext(spinnerContext);

  return (
    <Fragment>
      {isLoading && getSpinner()}
      {checkEmpty && !isLoading && (
        <NoData isEmpty={data && data.length === 0} emptyText={emptyText} />
      )}
    </Fragment>
  );
}

export default Spinner;
