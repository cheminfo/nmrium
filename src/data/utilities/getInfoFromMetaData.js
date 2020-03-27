import { getNucleusFrom2DExperiment } from './getNucleusFrom2DExperiment';
import { getSpectrumType } from './getSpectrumType';

export function getInfoFromMetaData(info) {
  const metadata = {
    dimension: 0,
    nucleus: [],
    isFid: false,
    isFt: false,
    isComplex: false,
  };

  maybeAdd(metadata, 'title', info.TITLE);
  maybeAdd(metadata, 'solvent', info['.SOLVENTNAME']);
  maybeAdd(
    metadata,
    'pulse',
    info['.PULSESEQUENCE'] || info['.PULPROG'] || info.$PULPROG,
  );
  maybeAdd(metadata, 'experiment', getSpectrumType(metadata, info));
  maybeAdd(metadata, 'temperature', parseFloat(info.$TE || info['.TE']));
  maybeAdd(metadata, 'frequency', parseFloat(info['.OBSERVEFREQUENCY']));
  maybeAdd(metadata, 'type', info.DATATYPE);
  maybeAdd(metadata, 'probe', info.$PROBHD);
  maybeAdd(metadata, 'bf1', info.$BF1);
  maybeAdd(metadata, 'sfo1', info.$SFO1);
  maybeAdd(metadata, 'sw', info.$SW);
  maybeAdd(metadata, 'dspfvs', info.$DSPFVS);
  maybeAdd(metadata, 'decim', info.$DECIM);
  maybeAdd(metadata, 'grpdly', info.$GRPDLY);

  if (info.$FNTYPE !== undefined) {
    maybeAdd(metadata, 'acquisitionMode', parseInt(info.$FNTYPE, 10));
  }
  maybeAdd(metadata, 'expno', parseInt(info.$EXPNO, 10));
  // console.log(metadata.type);
  if (metadata.type) {
    if (metadata.type.toUpperCase().indexOf('FID') >= 0) {
      metadata.isFid = true;
    } else if (metadata.type.toUpperCase().indexOf('SPECTRUM') >= 0) {
      metadata.isFt = true;
    }
  }

  // eslint-disable-next-line dot-notation
  if (info['$NUC1']) {
    // eslint-disable-next-line dot-notation
    let nucleus = info['$NUC1'];
    if (!Array.isArray(nucleus)) nucleus = [nucleus];
    nucleus = nucleus.map((value) => value.replace(/[^A-Za-z0-9]/g, ''));
    let beforeLength = nucleus.length;
    nucleus = nucleus.filter((value) => value);
    if (nucleus.length === beforeLength) {
      metadata.nucleus = nucleus;
    }
  }

  if (!metadata.nucleus) {
    if (info['.NUCLEUS']) {
      metadata.nucleus = info['.NUCLEUS'].split(',').map((nuc) => nuc.trim());
    } else if (info['.OBSERVENUCLEUS']) {
      metadata.nucleus = [info['.OBSERVENUCLEUS'].replace(/[^A-Za-z0-9]/g, '')];
    } else {
      metadata.nucleus = getNucleusFrom2DExperiment(metadata.experiment);
    }
  }

  metadata.dimension = metadata.nucleus.length;

  if (info.SYMBOL) {
    let symbols = info.SYMBOL.split(/[, ]+/);
    if (symbols.includes('R') && symbols.includes('I')) {
      metadata.isComplex = true;
    }
  }

  if (info.$DATE) {
    metadata.date = new Date(info.$DATE * 1000).toISOString();
  }
  return metadata;
}

function maybeAdd(obj, name, value) {
  if (value !== undefined) {
    if (typeof value === 'string') {
      if (value.startsWith('<') && value.endsWith('>')) {
        value = value.substring(1, value.length - 2);
      }
      obj[name] = value.trim();
    } else {
      obj[name] = value;
    }
  }
}
