import React, { useEffect } from 'react';
import propTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { FaEye } from 'react-icons/fa';
import { FaMinus } from 'react-icons/fa';
import { Button } from '@material-ui/core';

import './css/spectrum-list.css';



export default function SpectrumList({ data,onChangeVisibility,onChangeActive }) {

  const [activated, setActivated] = React.useState();
  const [visibled, setVisible] = React.useState([]);


  useEffect(()=>{
      setVisible(data);
      setActivated(data[0])
      // onChangeVisibility(data);
      // onChangeActive(data[0])
  },[]);




  const handleVisibility = (d) => {
    // console.log(d);
    const currentIndex = visibled.findIndex((v) => v.id === d.id);
    // console.log(currentIndex);
    const newChecked = [...visibled];

    if (currentIndex === -1) {
      newChecked.push(d);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    onChangeVisibility(newChecked);
    setVisible(newChecked);
    console.log(newChecked);
  };

  const isVisible = (id) => {
    return visibled.findIndex((v) => v.id === id) !== -1 ? true : false;
  };

  const handleToggle = (d) => {
    onChangeActive(d);
    setActivated(d);
  };

  const isActivated = (id) => {
    return activated && activated.id === id;
  };

  return (
    <List
      // subheader={<ListSubheader>Spectrum List</ListSubheader>}
      className="spectrum-list"
    >
 
        {data.map((d) => {
          return (
            <ListItem key={d.id}>
              <ListItemIcon>
                <Button onClick={() => handleVisibility(d)} >
                  <FaEye
                    style={isVisible(d.id) ? { opacity: 1,stroke:"black",strokeWidth: "1px" } : { opacity: 0.1 }}
                  />
                </Button>
              </ListItemIcon>
              <ListItemText primary={d.name} />
              <ListItemSecondaryAction>
                <Button onClick={() => handleToggle(d)}>
                  <FaMinus
                    style={
                      isActivated(d.id)
                        ? { fill: d.color}
                        : { fill: d.color, opacity: 0.1 }
                    }
                  />
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
    </List>
  );
}

SpectrumList.propTypes = {
  data:propTypes.array.isRequired
}

SpectrumList.defaultProps = {
   
  onChangeVisibility : function () { return null},
  onChangeActive:function () { return null}
};
