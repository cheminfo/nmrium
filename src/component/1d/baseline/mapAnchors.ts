import type { Spectrum1D } from "@zakodium/nmrium-core";
import { xFindClosestIndex } from "ml-spectra-processing";

import { getMedianY } from "./getMedian.ts";

export interface AnchorData {
    x: number;
    id: string;
}
export function mapAnchors(spectrum: Spectrum1D,
    anchors: AnchorData[]) {
    const { x: dataX } = spectrum.data;

    const sorted = anchors.toSorted((a, b) => a.x - b.x);
    const x = sorted.map((a) => xFindClosestIndex(dataX, a.x, { sorted: true }));
    const y = sorted.map((a) => getMedianY(a.x, spectrum));

    return { x, y }
}