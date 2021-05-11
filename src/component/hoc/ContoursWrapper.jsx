import { useChartData } from '../context/ChartContext';

export default function ContoursWrapper(WrappedComponent) {
  function Wrapper(props) {
    const { data, displayerKey } = useChartData();

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        data={data}
        displayerKey={displayerKey}
        ref={forwardedRef}
      />
    );
  }

  return (props) => {
    return <Wrapper {...props} />;
  };
}
