import { useChartData } from '../../context/ChartContext';
import { useScale } from '../../context/ScaleContext';
import { options } from '../../toolbar/ToolTypes';

const styles = {
  container: {
    transformOrigin: 'top left',
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: 1,
    backgroundColor: 'red',
  },
};

function VerticalIndicator() {
  const {
    height,
    toolOptions: {
      selectedTool,
      data: { pivot },
    },
  } = useChartData();
  const { scaleX } = useScale();

  if (options.phaseCorrection.id !== selectedTool) return null;
  return (
    <div
      style={{
        ...styles.container,
        transform: `translate(${scaleX()(pivot.value)}px, 0px)`,
        height: height,
      }}
    />
  );
}

export default VerticalIndicator;
