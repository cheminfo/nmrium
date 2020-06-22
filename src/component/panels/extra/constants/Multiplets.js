const BasicMultiplets = [
  'massive (m)',
  'singlet (s)',
  'doublet (d)',
  'triplet (t)',
  'quartet (q)',
  'quintet (i)',
  'sextet (x)',
  'septet (p)',
  'octet (o)',
  'nonet (n)',
];

const Multiplets = BasicMultiplets.map((_multiplet, i) => {
  return {
    index: i,
    label: _multiplet,
    value: _multiplet.split('(')[1].charAt(0),
  };
});

export { BasicMultiplets, Multiplets };
