import React, { Component } from "react";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import CropFree from '@material-ui/icons/CropFree'
import ZoomIn from '@material-ui/icons/ZoomIn'



// const GreenRadio = withStyles({
//   root: {
//     color: green[400],
//     "&$checked": {
//       color: green[600]
//     }
//   },
//   checked: { 
// })(props => <Radio color="default" {...props} />);

export let options ={
    zoom:{id:"zoom",label:"Zoom"},
    brush:{id:"brush",label:"Brush"}

}

class OptionsPane extends Component {

  constructor(props) {
    super(props);
    this.state = { zoom: false, brush: false };
  }


 
  handleChange = (event,selectedOption) => {
    this.setState({ selectedOption });
    this.props.onChangeOption(selectedOption)
    // console.log(event.target.value);
    console.log(selectedOption);
  };

  render() {
    const { selectedOption } = this.state;

    return (
      <div>
        <ToggleButtonGroup
          size="small"
          value={selectedOption}
          exclusive
          onChange={this.handleChange}
        >
          <ToggleButton key={1} value={options.zoom.id}>
            <ZoomIn />
            <label >{options.zoom.label}</label>
          </ToggleButton>
          
          <ToggleButton key={2} value={options.brush.id}>
            <CropFree />
          <label >{options.brush.label}</label>
          </ToggleButton>
        
        </ToggleButtonGroup>
      </div>
    );
  }
}

export default OptionsPane;
