import React from 'react';

import View from '../layouts/View.jsx';

export default function CoffeeView() {
  return (
    <View file="./json-files/Coffee.json" title="Coffee" stackedMode={true} />
  );
}
