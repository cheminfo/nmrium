let props = {
  configuration: {
    serieStyle: {
      unselected: {
        // if the spectrum is not selected
        line: {}, // SVG line properties for color, width, styl
        marker: {}, // SVG line properties for size, shape (???), color, border, etc.
      },
      selected: {
        // if the spectrum is selected
        line: {}, // SVG line properties
        marker: {}, // SVG line properties
      },
    },
    xAxis: {
      label: 'δ (ppm)',
      min: 0, // by default if undefined min value
      max: 10, // by default max value
      flipped: true,
      primaryGrid: true,
      secondaryGrid: true,
      primaryGridColor: '#AAAAAA',
      secondaryGridColor: '#DDDDDD',
      styles: {
        line: {},
        text: {},
      },
    },
    yAxis: {
      label: 'Intensity',
      primaryGrid: true,
      secondaryGrid: true,
      primaryGridColor: '#AAAAAA',
      secondaryGridColor: '#DDDDDD',
    },
  },
  data: [
    // array of spectra. They will share the same axis
    // each series is a React component in the SVG dom
    // if a series has to be rerender a new object in the array is created
    {
      id: '',

      data: [{ x: 1, y: 1, color: 'red' }],
      // we could rather than have data use 3 different array. It could be faster

      x: [1, 2, 3, 4, 5],
      y: [1, 2, 3, 2, 1],
      color: undefined, // an array of colors for each segment of line. Use always modulo color.length to get the color

      isFid: true, // allows to determine the label of the axis
      is2D: false, // TODO: need to define where to put the spectrum if it is 1D
      color: 'green',
    },
  ],
  annotations: [
    // different react component per annotation type and annotations
    /*
        Each data may be associated with one or many annotations
        Annotations include:
        - line
        - rectangle
        - integral (surface under the line)
        - circle / ellipse
        An annotation may have relative position (based on the X / Y units) or
        absolute position (based on 0,0 that it the top left point)
        Annotations should have a format as close as possible to the SVG properties
    */
    {
      type: 'rectangle',
      position: [
        // to be defined how to specify the position
        {
          x: 1, // units may be a number or a string with px or %
          y: 1,
          dx: '2px', // dx and dy allows to specify a shift from X / Y. The unit can change
          dy: '1px',
        },
        {
          x: 1.5,
          y: 1.5,
        },
      ],
      style: {},
    },
    {
      type: 'text',
      value: 'My label',
      position: [
        // to be defined how to specify the position
        {
          x: 1, // units may be a number or a string with px or %
          y: 1,
          dx: '2px', // dx and dy allows to specify a shift from X / Y. The unit can change
          dy: '1px',
        },
      ],
      style: {},
    },
  ],
  onProcess: (type, value, meta) => {
    // call back received from the `Data manager`
    switch (type) {
      case 'zoomOut':
        break;
      case 'fourrierTransform':
        break;
    }
  },
};
