import { useChartData } from '../context/ChartContext';

function ContoursWrapper(WrappedComponent) {
  const Wrapper = (props) => {
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
  };

  return (props) => {
    return <Wrapper {...props} />;
  };
}
export default ContoursWrapper;
