import React from 'react';

import { Accordion, AccordionItem } from '../elements/accordion';

import SpectrumListPanel from './SpectrumListPanel';
import IntegralTablePanel from './IntegralTablePanel';
import MoleculePanel from './MoleculePanel';
import FilterPanel from './FilterPanel';
import InformationPanel from './InformationPanel';
import RangesTablePanel from './RangesTablePanel';
import PeaksTablePanel from './PeaksTablePanel';

const Panels = () => {
  return (
    <Accordion>
      <AccordionItem title="Spectra">
        <SpectrumListPanel />
      </AccordionItem>
      <AccordionItem title="Information" style={{ overflow: 'hidden' }}>
        <InformationPanel />
      </AccordionItem>
      <AccordionItem title="Peaks">
        <PeaksTablePanel />
      </AccordionItem>
      <AccordionItem title="Filters">
        <FilterPanel />
      </AccordionItem>
      <AccordionItem title="Integrals">
        <IntegralTablePanel />
      </AccordionItem>
      <AccordionItem title="Ranges">
        <RangesTablePanel />
      </AccordionItem>
      <AccordionItem title="Structures">
        <MoleculePanel />
      </AccordionItem>
    </Accordion>
  );
};

export default Panels;
