import { getNucleusFrom2DExperiment } from './getNucleusFrom2DExperiment';
import { getSpectrumType } from './getSpectrumType';

export function getInfoFromMetaData(metaData) {
  const info = {
    dimension: 0,
    nucleus: [],
    isFid: false,
    isFt: false,
    isComplex: false,
  };

  maybeAdd(info, 'title', metaData.TITLE);
  maybeAdd(info, 'solvent', metaData['.SOLVENTNAME']);
  maybeAdd(
    info,
    'pulse',
    metaData['.PULSESEQUENCE'] || metaData['.PULPROG'] || metaData.$PULPROG,
  );
  maybeAdd(info, 'experiment', getSpectrumType(info, metaData));
  maybeAdd(info, 'temperature', parseFloat(metaData.$TE || metaData['.TE']));
  maybeAdd(
    info,
    'frequency',
    metaData['.OBSERVEFREQUENCY']
      ? parseFloat(metaData['.OBSERVEFREQUENCY'])
      : parseFloat(metaData.$SFO1),
  );
  maybeAdd(info, 'type', metaData.DATATYPE);
  maybeAdd(info, 'probe', metaData.$PROBHD);
  maybeAdd(info, 'bf1', metaData.$BF1);
  maybeAdd(info, 'sfo1', metaData.$SFO1);
  maybeAdd(info, 'sw', metaData.$SW);
  maybeAdd(info, 'numberOfPoints', metaData.$TD);
  maybeAdd(info, 'dspfvs', metaData.$DSPFVS);
  maybeAdd(info, 'decim', metaData.$DECIM);
  maybeAdd(info, 'grpdly', metaData.$GRPDLY);

  if (metaData.$FNTYPE !== undefined) {
    maybeAdd(info, 'acquisitionMode', parseInt(metaData.$FNTYPE, 10));
  }
  maybeAdd(info, 'expno', parseInt(metaData.$EXPNO, 10));

  if (info.type) {
    if (info.type.toUpperCase().indexOf('FID') >= 0) {
      info.isFid = true;
    } else if (info.type.toUpperCase().indexOf('SPECTRUM') >= 0) {
      info.isFt = true;
    }
  }

  // eslint-disable-next-line dot-notation
  if (metaData['$NUC1']) {
    // eslint-disable-next-line dot-notation
    let nucleus = metaData['$NUC1'];
    if (!Array.isArray(nucleus)) nucleus = [nucleus];
    nucleus = nucleus.map((value) =>
      value.replace(/[^A-Za-z0-9]/g, '').replace('NA', ''),
    );
    let beforeLength = nucleus.length;
    nucleus = nucleus.filter((value) => value);
    if (nucleus.length === beforeLength) {
      info.nucleus = nucleus;
    }
  }

  if (!info.nucleus || info.nucleus.length === 0) {
    if (metaData['.NUCLEUS']) {
      info.nucleus = metaData['.NUCLEUS'].split(',').map((nuc) => nuc.trim());
    } else if (metaData['.OBSERVENUCLEUS']) {
      info.nucleus = [metaData['.OBSERVENUCLEUS'].replace(/[^A-Za-z0-9]/g, '')];
    } else {
      info.nucleus = getNucleusFrom2DExperiment(info.experiment);
    }
  }
  if (metaData['2D_X_NUCLEUS'] && metaData['2D_Y_NUCLEUS']) {
    info.nucleus = [
      metaData['2D_X_NUCLEUS'].replace(/[^A-Za-z0-9]/g, ''),
      metaData['2D_Y_NUCLEUS'].replace(/[^A-Za-z0-9]/g, ''),
    ];
  }

  info.dimension = info.nucleus.length;

  if (metaData.SYMBOL) {
    let symbols = metaData.SYMBOL.split(/[, ]+/);
    if (symbols.includes('R') && symbols.includes('I')) {
      info.isComplex = true;
    }
  }

  if (metaData.$DATE) {
    info.date = new Date(metaData.$DATE * 1000).toISOString();
  }
  return info;
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
