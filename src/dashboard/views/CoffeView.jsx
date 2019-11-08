import React from 'react';

import View from '../layouts/View.jsx';

export default function CoffeView() {
  return (
    <View file="./json-files/Coffe.json" title="Coffee" stackedMode={true} />
  );
}
