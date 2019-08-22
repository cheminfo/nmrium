import React, { memo, useMemo, useCallback } from 'react';
import { withStyles } from '@material-ui/core/styles';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';

const ExpansionPanel = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 36,
    '&$expanded': {
      minHeight: 36,
    },
    fontSize: '12px',
  },
  content: {
    '&$expanded': {
      margin: '3px 0',
    },
    margin: '3px 0',
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(0),
    // theme.spacing(1)
  },
}))(MuiExpansionPanelDetails);

const InformationPanel = ({ listItem, activeItem }) => {
  const [expanded, setExpanded] = React.useState(activeItem);

  const handleChange = useCallback(
    (panel) => (event, newExpanded) => {
      setExpanded(newExpanded ? panel : false);
    },
    [],
  );

  const Accordion = useMemo(
    () =>
      listItem &&
      listItem.map((item) => (
        <ExpansionPanel
          square
          expanded={expanded === item.id}
          onChange={handleChange(item.id)}
          key={item.id}
        >
          <ExpansionPanelSummary
            aria-controls="panel1d-content"
            id="panel1d-header"
          >
            <Typography style={{ fontSize: '12px' }}>{item.title}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>{item.component}</ExpansionPanelDetails>
        </ExpansionPanel>
      )),
    [expanded, listItem],
  );

  return <div>{Accordion}</div>;
};

export default memo(InformationPanel);
