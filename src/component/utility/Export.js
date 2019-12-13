import { saveAs } from 'file-saver';

function removeContent(content) {
  return content.replace(
    /&lt;!--[\s]*export-remove[\s]*--&gt.+?&lt;!--[\s]*export-remove[\s]*--&gt;/gi,
    '',
  );
}
/**
 * export the experiments result in JSON format
 * @param {*} data
 */
function exportAsJSON(data) {
  const fileData = JSON.stringify(data, undefined, 2);
  const blob = new Blob([fileData], { type: 'text/plain' });
  saveAs(blob, 'experiment.json');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'experiment.json';
  link.href = url;
  link.dispatchEvent(
    new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );
}
/**
 * export the vitalization result as SVG, if you need to remove some content during exportation process enclose the the content with <!-- export-remove --> ${content} <!-- export-remove -->
 * @param {*} tagID  // tag identifier  ex <div id="main"></div>  tagID=main
 * @param {*} styles // add specific style for the exported svg
 * @param {*} headerProps  // svg tag variables in addition to title="experiments" version="1.1" xmlns="http://www.w3.org/2000/svg"
 */
function exportAsSVG(tagID, styles = '', headerProps = '') {
  let svgData = removeContent(document.getElementById(tagID).innerHTML, '');
  const head = `<svg title="experiments" version="1.1" xmlns="http://www.w3.org/2000/svg" ${headerProps}>`;
  const style = `<style>.grid line,.grid path{stroke:none;} .regular-text{fill:black} ${styles}</style>`;
  const svg = `${head + style + svgData}</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  saveAs(blob, 'experiments.svg');
}

export { exportAsSVG, exportAsJSON };
