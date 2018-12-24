/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */
/* eslint no-empty: 0 */
/* eslint prefer-default-export: 0 */
/* eslint no-useless-escape: 0 */
/* eslint radix: 0 */
/* eslint no-use-before-define: 0 */

import * as vega from "vega-lib";

var view;

vega.loader()
  .load('https://vega.github.io/vega/examples/bar-chart.vg.json')
  .then(function(data) { console.log("RENDERING VIS"); renderVis(JSON.parse(data)); });

export default function renderVis(spec) {
  view = new vega.View(vega.parse(spec))
    .renderer('canvas')  // set renderer (canvas or svg)
    .initialize('.view') // initialize view within parent DOM container
    .hover()             // enable hover encode set processing
    .run();
}