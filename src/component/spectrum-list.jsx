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

export default function SpectrumList({
  data,
  onChangeVisibility,
  onChangeActive,
}) {
  const [activated, setActivated] = React.useState(null);
  const [visibled, setVisible] = React.useState([]);

  

  
  useEffect(() => {
    const v_data = data.filter((d)=>d.isVisible === true);
    setVisible(v_data);
    setActivated(activated);
    // onChangeVisibility(data);
    // onChangeActive(data[0])
  }, [data]);



  const handleVisibility = (d) => {
    const currentIndex = visibled.findIndex((v) => v.id === d.id);
    const newChecked = [...visibled];
    if (currentIndex === -1) {
      newChecked.push({ id: d.id });
    } else {
      newChecked.splice(currentIndex, 1);
    }
    onChangeVisibility(newChecked);
    setVisible(newChecked);
  };

  const isVisible = (id) => {
    return visibled.findIndex((v) => v.id === id) !== -1 ? true : false;
  };

  const handleToggle = (d) => {
    if (activated && activated.id === d.id) {
      onChangeActive(null);
      setActivated(null);
    } else {
      onChangeActive({ id: d.id });
      setActivated({ id: d.id });
    }
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
              <Button onClick={() => handleVisibility(d)}>
                <FaEye
                  style={
                    isVisible(d.id)
                      ? { opacity: 1, stroke: 'black', strokeWidth: '1px' }
                      : { opacity: 0.1 }
                  }
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
  data: propTypes.array.isRequired,
};

SpectrumList.defaultProps = {
  onChangeVisibility: function() {
    return null;
  },
  onChangeActive: function() {
    return null;
  },
};
