import NmriumPage from '../NmriumPage';

async function open13CFidSpectrum(nmrium: NmriumPage) {
  await nmrium.page.click('text=General');
  await nmrium.page.click('text=13C Spectrum');
}

async function zeroFillingFilter(nmrium: NmriumPage) {
  await nmrium.page.click('data-test-id=tool-zeroFilling');
  await nmrium.page.click('data-test-id=apply-zero-filling-btn');

  expect(
    await nmrium.page.isVisible(
      'data-test-id=filters-table >> text=Zero Filling',
    ),
  ).toBe(true);
  expect(
    await nmrium.page.isVisible(
      'data-test-id=filters-table >> text=Line broadening',
    ),
  ).toBe(true);
}

async function fourierTransformFilter(nmrium: NmriumPage) {
  await nmrium.page.click('data-test-id=tool-FFT-filter');

  expect(
    await nmrium.page.isVisible('data-test-id=filters-table >> text=FFT'),
  ).toBe(true);
}

async function phaseCorrectionFilter(nmrium: NmriumPage) {
  await nmrium.page.click('data-test-id=tool-phaseCorrection');
  await nmrium.page.fill('data-test-id=input-ph1', '-100');
  await nmrium.page.fill('data-test-id=input-ph0', '-104');
  await nmrium.page.waitForTimeout(1000);
  await nmrium.page.click('data-test-id=apply-phase-correction-btn');
  expect(
    await nmrium.page.isVisible(
      'data-test-id=filters-table >> text=Phase correction',
    ),
  ).toBe(true);
}
async function baselineCorrectionFilter(nmrium: NmriumPage) {
  await nmrium.page.click('data-test-id=tool-baseLineCorrection');
  await nmrium.page.click('data-test-id=apply-baseline-correction-btn');
  expect(
    await nmrium.page.isVisible(
      'data-test-id=filters-table >> text=Baseline Correction',
    ),
  ).toBe(true);
}

test('process 1d FID 13c spectrum', async () => {
  const nmrium = await NmriumPage.create();

  await open13CFidSpectrum(nmrium);

  await nmrium.waitForViewer();

  await nmrium.clickPanel('Filters');

  await zeroFillingFilter(nmrium);
  await fourierTransformFilter(nmrium);
  await phaseCorrectionFilter(nmrium);
  await baselineCorrectionFilter(nmrium);
});
