import BaseView from './BaseView.js';
import type { ViewProps } from './View.helpers.js';
import { useView } from './View.helpers.js';

export default function View(props: ViewProps) {
  const [data, otherProps] = useView(props);

  return <BaseView {...otherProps} data={data} />;
}
