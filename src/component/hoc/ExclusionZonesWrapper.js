import { useChartData } from '../context/ChartContext';

function ExclusionZonesWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const { exclusionZones, activeTab } = useChartData();

    return (
      <WrappedComponent
        {...props}
        exclusionZones={
          exclusionZones[activeTab] ? exclusionZones[activeTab] : null
        }
      />
    );
  };

  return (props) => {
    return <Wrapper {...props} />;
  };
}
export default ExclusionZonesWrapper;
