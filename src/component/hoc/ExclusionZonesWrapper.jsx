import { useChartData } from '../context/ChartContext';

export default function ExclusionZonesWrapper(WrappedComponent) {
  function Wrapper(props) {
    const {
      toolOptions: {
        data: { exclusionZones },
      },
      activeTab,
    } = useChartData();

    return (
      <WrappedComponent
        {...props}
        exclusionZones={
          exclusionZones[activeTab] ? exclusionZones[activeTab] : null
        }
      />
    );
  }

  return (props) => {
    return <Wrapper {...props} />;
  };
}
