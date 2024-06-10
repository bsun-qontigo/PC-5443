import { loadModule } from '@axioma/core';

const svgNS = 'http://www.w3.org/2000/svg';

export class Downloader {
    public svg: SVGElement;
    public initialAttrMap!: Map<SVGElement, Map<string, string>>;
    private destroyers: Array<() => void> = [];
    private layers!: Layer[];

    public constructor(chart: HTMLElement, private readonly filename: string) {
        this.svg = (chart as HTMLElement).querySelector('svg') as SVGElement;
    }

    public addLayers(layers: Layer[]): this {
        this.layers = layers;
        this.initialAttrMap = new Map<SVGElement, Map<string, string>>();
        this.layers.forEach(layer => {
            layer.attrMap.forEach((v, k) => {
                this.initialAttrMap.set(k, new Map(v));
            });
        });
        return this;
    }

    public download(): void {
        this.layers.forEach(layer => {
            this.destroyers.push(layer.process());
        });
        loadModule('@axioma-framework/charts').then(({ cloneWithColors }) => {
            const cloned = cloneWithColors(this.svg) as SVGGElement;
            const svgSerialized = new XMLSerializer().serializeToString(cloned);
            const a = document.createElement('a');
            a.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgSerialized);
            a.download = `${this.filename}.svg`;
            a.click();
            this.destroyers.forEach(cb => cb());
        });
    }
}

export interface ILayer {
    process(): void;
}

abstract class Layer implements ILayer {
    public attrMap!: Map<SVGElement, Map<string, string>>;
    public abstract process(): () => void;
}

function collectAttrMap(elements: SVGElement[]): Map<SVGElement, Map<string, string>> {
    const attrMap: Map<SVGElement, Map<string, string>> = new Map();
    elements.forEach(e => {
        const pair = new Map<string, string>();
        attrMap.set(e, pair);
        for (const attr of e.getAttributeNames()) {
            pair.set(attr, e.getAttributeNS(null, attr) as string);
        }
    });
    return attrMap;
}

export class TitleLayer extends Layer {

    public constructor(private readonly context: Downloader, private readonly title: string, private readonly opts: Record<string, string>, private readonly isZoomedIn?: boolean) {
        super();
        const svg = this.context.svg;
        this.attrMap = collectAttrMap([svg, (svg.querySelector('g') as SVGGElement)]);
    }

    public process(): () => void {
        const isZoomedIn = this.isZoomedIn;
        const shiftY = isZoomedIn ? 48 : 16;
        const opts = (isZoomedIn ? Object.assign({
            'x': '0',
            'y': '30',
            'font-size': '24'
        }, this.opts ?? {}) : Object.assign({
            'x': '0',
            'y': '14',
            'font-size': '16'
        }, this.opts ?? {}));
        const svgText = document.createElementNS(svgNS, 'text');
        Object.keys(opts).forEach(k => svgText.setAttributeNS(null, k, opts[k]));
        const textNode = document.createTextNode(this.title);
        svgText.appendChild(textNode);
        const svg = this.context.svg;
        svg.prepend(svgText);
        const g = svg.querySelector('g') as SVGGElement;
        const currentTransform = g.getAttributeNS(null, 'transform') as string;
        const currentHeight = svg.getAttributeNS(null, 'height') as string;
        const currentViewBox = svg.getAttributeNS(null, 'viewBox') as string;
        const currentTranslateY = Number.parseInt(currentTransform.substring(currentTransform.indexOf(',') + 1, currentTransform.indexOf(')')).trim(), 10);
        const newTransform = isZoomedIn ? 'translate(0, 32)' : `translate(0, ${currentTranslateY + shiftY})`;
        const newHeight = (Number.parseInt(currentHeight, 10) + shiftY) + '';
        const newViewBox = currentViewBox.substring(0, currentViewBox.lastIndexOf(',')) + ',' + (Number.parseInt(currentViewBox.split(',')[3].trim() as string, 10) + shiftY);
        g.setAttributeNS(null, 'transform', newTransform);
        svg.setAttributeNS(null, 'height', newHeight);
        svg.setAttributeNS(null, 'viewBox', newViewBox);
        return (() => {
            // restore...
            g.setAttributeNS(null, 'transform', this.context.initialAttrMap.get(g)?.get('transform') as string);
            svg.removeChild(svgText);
            svg.setAttributeNS(null, 'height', this.context.initialAttrMap.get(svg)?.get('height') as string);
            svg.setAttributeNS(null, 'viewBox', this.context.initialAttrMap.get(svg)?.get('viewBox') as string);
        });
    }
}