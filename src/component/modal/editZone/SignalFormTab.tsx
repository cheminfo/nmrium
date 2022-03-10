import EditPathLengthFormik from './EditPathLengthFormik';

interface SignalFormTabProps {
  signalIndex: number;
}

function SignalFormTab({ signalIndex }: SignalFormTabProps) {
  return <EditPathLengthFormik signalIndex={signalIndex} />;
}

export default SignalFormTab;
