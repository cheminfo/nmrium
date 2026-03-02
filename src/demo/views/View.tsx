import BaseView from './BaseView.js';
import type { ViewProps } from './View.helpers.js';
import { useView } from './View.helpers.js';

export default function View(props: ViewProps) {
  const [data, otherProps] = useView(props);

  if (!data) {
    return <BaseView {...otherProps} />;
  }

  const { state, aggregator } = data;
  return <BaseView {...otherProps} state={state} aggregator={aggregator} />;
}
