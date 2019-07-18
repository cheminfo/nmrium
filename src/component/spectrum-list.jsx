import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';
import WifiIcon from '@material-ui/icons/Wifi';
import BluetoothIcon from '@material-ui/icons/Bluetooth';
import { withStyles } from '@material-ui/core/styles';

import './css/spectrum-list.css';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';

import { FaEye } from 'react-icons/fa';
import { FaMinus } from 'react-icons/fa';
import { Button } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    // maxWidth: 100,
    backgroundColor: theme.palette.background.paper,
  },
}));

// const AntSwitch = withStyles((theme) => ({
//   root: {
//     width: 28,
//     height: 14,
//     padding: 0,
//     display: 'flex',
//   },
//   switchBase: {
//     padding: 2,
//     color: theme.palette.grey[500],
//     '&$checked': {
//       transform: 'translateX(12px)',
//       color: theme.palette.common.white,
//       '& + $track': {
//         opacity: 1,
//         backgroundColor: theme.palette.primary.main,
//         borderColor: theme.palette.primary.main,
//       },
//     },
//   },
//   thumb: {
//     width: 12,
//     height: 12,
//     boxShadow: 'none',
//   },
//   track: {
//     border: `1px solid ${theme.palette.grey[500]}`,
//     borderRadius: 16 / 2,
//     opacity: 1,
//     backgroundColor: theme.palette.common.white,
//   },
//   checked: {},
// }))(Switch);

export default function SpectrumList({ data }) {
  data = [
    {
      id: '1',
      name: 'spectrum 1',
      color: 'red',
    },
    {
      id: '2',
      name: 'spectrum 2',
      color: 'green',
    },
    {
      id: '3',
      name: 'spectrum 3',
      color: 'yellow',
    },
  ];

  // const classes = useStyles();
  const [activated, setActivated] = React.useState();
  const [visibled, setVisible] = React.useState([]);


  useEffect(()=>{
    if(data){
      setVisible(data);
      setActivated(data[0])
    }



  },[]);

  const handleVisibility = (d) => {
    console.log(d);
    const currentIndex = visibled.findIndex((v) => v.id === d.id);
    console.log(currentIndex);
    const newChecked = [...visibled];

    if (currentIndex === -1) {
      newChecked.push(d);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setVisible(newChecked);
    console.log(visibled);
  };

  const isVisible = (id) => {
    return visibled.findIndex((v) => v.id === id) !== -1 ? true : false;
  };

  const handleToggle = (d) => {
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
      {/* <ToggleButtonGroup
        value={data && data[0]}
        exclusive
        onChange={handleToggle}
      > */}
        {data.map((d) => {
          return (
            <ListItem key={d.id}>
              <ListItemIcon>
                <Button onClick={() => handleVisibility(d)} >
                  <FaEye
                    style={isVisible(d.id) ? { opacity: 1 } : { opacity: 0.2 }}
                  />
                </Button>
              </ListItemIcon>
              <ListItemText primary={d.name} />
              <ListItemSecondaryAction>
                <Button onClick={() => handleToggle(d)}>
                  <FaMinus
                    style={
                      isActivated(d.id)
                        ? { fill: d.color }
                        : { fill: d.color, opacity: 0.2 }
                    }
                  />
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      {/* </ToggleButtonGroup> */}

    </List>
  );
}
