import './defines';
import { Component, mixins, Prop, ChildHandler, OneWayExpectations } from '@axioma/vue';
import Template from './template.vue';
import { scaleLinear, select, arc as d3Arc, interpolateNumber, selectAll, Selection, BaseType, DefaultArcObject } from 'd3';
import { Circle, CircleData, CircleLocations } from '@axioma/wealth-commons';
import { noop } from '@axioma/core';


const DefaultLargeCircleFontSize = 24;
const DefaultLargeCircleInnerFontSize = 10;
const DefaultSmallCircleFontSize = 16;
const DefaultSmallCircleInnerFontSize = 10;
const chartWidth = 460;
const DefaultCenterCirlceX = chartWidth / 2;
const DefaultCenterCircleRadius = 105 / 2;
const DefaultSmallerCircleRadius = 92 / 2;
const MaxCircles = 7;
const DefaultOuterRingWidth = 0.04;

let centerCircleRadius = 0;
let smallerCircleRadius = 0;
let centerCircleY = 0;
let centerCirlceX = 0;
let largeCircleFontSize = 0;
let largeCircleInnerFontSize = 0;
let smallCircleFontSize = 0;
let smallCircleInnerFontSize = 0;
const Tau = 2 * Math.PI;
const AngleOffset = -Math.PI / 2; // Starting above the center in radians
const getAngleBetweenCircles = (circles: number): number => (Tau) / circles;
const CenterMargin = 4;
const CircleColor = 'B9C1C6';
const InnerCircleColor = 'var(--main-background)';
const TextColor = 'var(--main-font-color)';
const NegativeColor = 'F13832';
const PositiveColor = '72BD60';

type GalleryElement = BaseType & { __data__: Circle; };
export type GaugeChartOptions = { chartWidth: number; chartHeight: number; title: string; numberOfCircles: number; };
export type GaugeHandler = OneWayExpectations<{
	circleData: CircleData[];
	chartOptions: GaugeChartOptions;
}, {
	onLensHighlighter: (ev: PointerEvent, circle: Circle) => void;
}>;

@Component({
	name: 'GaugeChart',
	packageName: '@axioma-components/gauge-chart'
})
export default class GaugeChart extends mixins(Template) {
	@Prop()
	public readonly handler!: ChildHandler<GaugeHandler>;

	private readonly uniqueClass = `dynamic-class-${generateRandomString(8)}`;
	private readonly uniqueInnerClass = `dynamic-class-${generateRandomString(8)}`;
	private renderTo!: HTMLElement;

	protected mounted(): void {
		centerCircleY = this.handler.chartOptions().chartHeight / 2;
		centerCirlceX = this.handler.chartOptions().chartWidth / 2;
		const scalingFactor = DefaultCenterCirlceX / 200;
		centerCircleRadius = DefaultCenterCircleRadius * scalingFactor;
		smallerCircleRadius = DefaultSmallerCircleRadius * scalingFactor;
		largeCircleFontSize = DefaultLargeCircleFontSize * scalingFactor;
		largeCircleInnerFontSize = DefaultLargeCircleInnerFontSize * scalingFactor;
		smallCircleFontSize = DefaultSmallCircleFontSize * scalingFactor;
		smallCircleInnerFontSize = DefaultSmallCircleInnerFontSize * scalingFactor;

		this.renderTo = this.$refs.chart as HTMLElement;
		const circleLocations: CircleLocations[] = [];
		for (let z = 0; z < this.handler.chartOptions().numberOfCircles; z++) {
			const angle = this.anglei(z, this.handler.chartOptions().numberOfCircles);
			const x = this.xi(angle);
			const y = this.yi(angle);
			circleLocations.push({ x, y });
		}
		let rotatedLocations: CircleLocations[] = [];
		if (this.handler.circleData.length === 6) {
			rotatedLocations = [...circleLocations.slice(-3), ...circleLocations.slice(0, -3)];
		} else if (this.handler.circleData.length === 4) {
			rotatedLocations = [...circleLocations.slice(-1), ...circleLocations.slice(0, -1)];
		} else {
			rotatedLocations = circleLocations;
		}
		const data: Circle[] = this.handler.circleData().map((d, i) => {
			let x = rotatedLocations[i - 1]?.x;
			let y = rotatedLocations[i - 1]?.y;
			let radius = smallerCircleRadius;
			let fontSize = smallCircleFontSize;
			let innerFontSize = smallCircleInnerFontSize;
			if (d.id === 'center') {
				x = centerCirlceX;
				y = centerCircleY;
				radius = centerCircleRadius;
				fontSize = largeCircleFontSize;
				innerFontSize = largeCircleInnerFontSize;
			}
			return {
				x,
				y,
				radius,
				fontSize,
				innerFontSize,
				anchor: 'middle',
				arcColor: d.type === 'negative' ? NegativeColor : PositiveColor,
				id: d.id,
				decimals: d.decimals,
				unit: d.unit,
				maximum: d.maximum,
				minimum: d.minimum,
				value: d.value,
				innerText: d.innerText,
				prefix: d.prefix,
			} as Circle;
		});

		render(data, this.renderTo, this.uniqueClass, this.uniqueInnerClass).then(() => {
			update(data, this.uniqueInnerClass, this.handler);
		});
	}

	private anglei(circle: number, numberOfCircles = MaxCircles): number {
		return AngleOffset + circle * getAngleBetweenCircles(numberOfCircles);
	}

	private xi(anglei: number): number {
		return centerCirlceX + (centerCircleRadius * 2 + CenterMargin) * Math.cos(anglei);
	}

	private yi(anglei: number): number {
		return centerCircleY + (centerCircleRadius * 2 + CenterMargin) * Math.sin(anglei);
	}

	private highlight(data: unknown): void {
		noop(data);
		// TODO unhighlight or highlight stuff.
	}

}

function render(objectList: Circle[], renderTo: HTMLElement, uniqueClass: string, uniqueInnerClass: string): Promise<void> {
	const div = select(renderTo)
		.append('div');

	const svgLayer = div
		.append('svg')
		.attr('id', '#svg')
		.attr('width', 2 * centerCirlceX)
		.attr('height', 2 * centerCircleY);


	let gaugePanelLayer = svgLayer.select('g.' + uniqueClass);

	if (gaugePanelLayer.node() === null) {
		gaugePanelLayer = svgLayer.append('g').classed(uniqueClass, true) as unknown as Selection<BaseType, unknown, null, undefined>;
	}

	const panel = gaugePanelLayer.selectAll('.' + uniqueInnerClass)
		.data(objectList);

	// Update
	panel
		.attr('id', function (d) { return d.id; })
		.attr('transform', function (d) { return `translate(${d.x}, ${d.y})`; })
		.attr('unit', function (d) { return d.unit; })
		.attr('prefix', function (d) { return d.prefix || ''; });


	//draw Arc
	panel
		.select('.arc path')
		.attr('d', function (d) {
			const radius = d.radius;
			const outerRingWidth = Math.round(radius * DefaultOuterRingWidth);
			const endAngle = Tau;
			const arc = d3Arc().innerRadius(radius - outerRingWidth).outerRadius(radius).startAngle(0).endAngle(endAngle);
			return arc(d as unknown as DefaultArcObject)
				;
		});

	panel
		.select('.arc.arcHum path')
		.attr('d', function (d) {
			const initValue = 0; // this.getAttribute('preValue') || ;
			const radius = d.radius;
			const outerRingWidth = Math.round(d.radius * DefaultOuterRingWidth);

			const percentage = scale({
				min: d.minimum || 0,
				max: d.maximum || 100
			}, {
				start: 0,
				end: 1
			}, initValue);

			const endAngle = percentage * Tau;
			const arc = d3Arc().innerRadius(radius - outerRingWidth).outerRadius(radius).startAngle(0).endAngle(endAngle);
			return arc(d as unknown as DefaultArcObject);
		})
		.attr('fill', function (d) {
			return '#' + d.arcColor;
		});

	//draw Circle
	panel
		.select('circle')
		.attr('r', function (d) {
			const outerRingWidth = Math.round(d.radius * DefaultOuterRingWidth);
			return d.radius - outerRingWidth;
		})
		.attr('class', 'mouseTarget');

	panel.select('text')
		.attr('y', function (d) {
			return (d.fontSize / 2) - 5;
		})
		.style('font-size', function (d) {
			return d.fontSize;
		});

	// Enter
	const nPanel = panel
		.enter()
		.append('g')
		.attr('id', function (d) { return d.id; })
		.attr('class', uniqueInnerClass)
		.attr('opacity', 1)
		.attr('transform', function (d) { return `translate(${d.x}, ${d.y})`; })
		.attr('unit', function (d) { return d.unit; })
		.attr('prefix', function (d) { return d.prefix || ''; });

	//draw Arc
	nPanel
		.selectAll('.arc')
		.data(function (d) {
			const initValue = 0;
			return [{
				endAngle: Tau,
				color: '#' + CircleColor,
				radius: d.radius
			},
			{
				endAngle: initValue * Tau,
				color: '#' + d.arcColor,
				radius: d.radius
			}
			];
		})
		.enter()
		.append('g')
		.attr('class', function (_d, i) {
			return i === 1 ? 'arc arcHum' : 'arc';
		})
		.append('path')
		.attr('d', function (d) {
			const radius = d.radius;
			const outerRingWidth = Math.round(d.radius * DefaultOuterRingWidth);
			const arc = d3Arc().innerRadius(radius - outerRingWidth).outerRadius(radius).startAngle(0).endAngle(d.endAngle);
			return arc(d as unknown as DefaultArcObject);
		})
		.attr('fill', function (d) {
			return d.color;
		});

	//draw Circle
	nPanel
		.append('circle')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', function (d) {
			const outerRingWidth = Math.round(d.radius * DefaultOuterRingWidth);
			return d.radius - outerRingWidth;
		})
		.attr('fill', function () {
			return InnerCircleColor;
		});

	nPanel.append('text')
		.attr('id', 'value')
		.attr('y', function (d) {
			return -d.fontSize / 2;
		})
		.attr('text-anchor', 'middle')
		.attr('font-family', 'Open Sans')
		.attr('font-weight', 'bold')
		.style('font-size', function (d) {
			return d.fontSize + 'px';
		})
		.style('pointer-events', 'none')
		.text(function () {
			return '...';
		});

	nPanel.append('text')
		.attr('id', 'innerText')
		.attr('y', function (d) {
			return d.innerFontSize;
		})
		.attr('text-anchor', 'middle')
		.attr('font-family', 'Open Sans')
		.attr('font-weight', 'bold')
		.style('font-size', function (d) {
			return d.innerFontSize + 'px';
		})
		.style('pointer-events', 'none')
		.text(function () {
			return '';
		});
	// Exit
	panel.exit().remove();

	return Promise.resolve();
}


function update(data: Circle[], uniqueInnerClass: string, handler: ChildHandler<GaugeHandler>) {
	const durationShort = 250;
	const durationLong = 1000;
	const opacity = 0.6;
	const gaugePanels = selectAll('svg .' + uniqueInnerClass).nodes();
	gaugePanels.forEach(dsp => {
		const val = data.find(i => i.id === (dsp as GalleryElement)?.__data__.id);
		const value = val?.value ? val?.value : 0;
		const panel = select(dsp);
		panel.attr('style', 'cursor: pointer')
			.on('click', function (this: BaseType, ev: PointerEvent, d: unknown) {
				handler.onLensHighlighter(ev, d as Circle);
				gaugePanels.forEach(p => {
					select(p).transition()
						.duration(durationShort)
						.attr('opacity', opacity);
				});
				select(this).transition()
					.duration(durationShort)
					.attr('opacity', 1);

			});
		if (val) {
			panel
				.select('.arc.arcHum path')
				.datum((d: Circle) => d)
				.transition('number')
				.duration(durationLong)
				.tween('number', function () {
					const path = select(this);
					const d: Circle = path.datum() as Circle;
					const { radius, decimals, minimum } = d;
					const preValue = Number(path.attr('preValue')) || minimum;
					const outerRingWidth = Math.round(radius * DefaultOuterRingWidth);
					const i = interpolateNumber(preValue, Number(d.value.toFixed(decimals)));
					path.attr('preValue', value.toFixed(d.decimals));
					return function (t) {
						const endAngle = (i(t) / d.maximum) * Tau;
						const arcData: DefaultArcObject = {
							endAngle,
							innerRadius: radius - outerRingWidth,
							outerRadius: radius,
							startAngle: 0
						};
						const arc = d3Arc()(arcData);
						if (arc) {
							path.attr('d', arc);
						}
					};
				});
			if (val.minimum === val.value) {
				panel.select('#value')
					.text('\u2713') // Unicode character ✓ represents the tick
					.attr('fill', '#' + PositiveColor);
			} else {
				panel.select('#value')
					.attr('fill', TextColor);
				panel.select('#value')
					.datum((d: Circle) => d)
					.transition()
					.duration(1000)
					.tween('number', function () {
						const element = select(this);
						const d: Circle = element.datum() as Circle;
						const preValue = Number(element.attr('preValue')) || d.minimum;
						const i = interpolateNumber(preValue, Number(d.value.toFixed(d.decimals)));
						element.attr('preValue', value.toFixed(d.decimals));

						return function (t) {
							const v = i(t).toFixed(d.decimals);
							element.text(`${d.prefix} ${v} ${d.unit}`);
						};
					});
			}
			const lines = val.innerText.split('\n');

			panel.select('#innerText')
				.attr('fill', TextColor)
				.selectAll('text') // Select existing tspans (if any)
				.remove() // Remove existing tspans, if needed
				.data(lines)
				.enter()
				.append('tspan')
				.text((d: string) => d)
				.attr('x', 0)
				.attr('dy', (_d, i) => i ? '1.2em' : 0);
		}
	});
}

function scale(valueRnage: { min: number, max: number }, range: { start: number, end: number }, value: number) {
	const innerScale = scaleLinear().domain([valueRnage.min, valueRnage.max]).range([range.start, range.end]);
	return innerScale(value);
}

function generateRandomString(length: number) {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(random() * characters.length));
	}
	return result;
}

function random(): number {
	const array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	const randomNumber = array[0] / (0xffffffff + 1);
	return Math.floor(randomNumber * 101) / 100;
}