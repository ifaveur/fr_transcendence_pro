import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { IStatOnUser } from 'src/app/interfaces/stat.interface';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser } from 'src/app/interfaces/user.interface';
import { socketType } from 'src/app/modules/general/home/home.component';

@Component({
	selector: 'app-statgraph1',
	templateUrl: './statgraph1.component.html',
	styleUrls: ['./statgraph1.component.scss']
})
export class Statgraph1Component implements OnInit, OnChanges, OnDestroy, OnChanges {

	
	@Input() public user!: IUser;
	@Input() public iduser: number = 0;
	@Input() public dispayid: number = 0;
	@Input() public socket!: socketType;

	public data!: IStatOnUser
	public svg: any;

	public columnName: string[] = [
		"level",
		"game played",
		"victory",
		"lose",
		"max win gap",
		"min win gap",
		"max lose gap",
		"min lose gap",
	];

	public color = d3.scaleOrdinal()
		.domain(this.columnName)
		.range(d3.schemeCategory10);

	public width: number = 0;
	public height: number = 0;
	public widthtscale: number = 0;
	public heightscale: number = 0;
	public maxvalue: number = 0;
	public nb: number = 8;

	public getUserStatListener = (data: IStatOnUser) => {
		this.data = data;
		if (this.data)
			this.createSvg();

	}

	constructor() { }
	ngOnDestroy(): void {
		this.socket.off("getUserStat", this.getUserStatListener)
	}
	
	ngOnChanges(changes: SimpleChanges): void {
		this.socket.emit("getUserStat", this.dispayid);
	}

	async ngOnInit(): Promise<void> {
		this.socket.on("getUserStat", this.getUserStatListener)
		this.socket.emit("getUserStat", this.dispayid);
	}

	public sleep(ms: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	public createSvg() {
		let div = document.getElementById("stat-svg");
		this.svg = d3.select('#stat-svg')
		.attr('border', '1px solid black');
		
		if (div) {
			div.innerHTML =  '';
			this.height = div.clientHeight + 20;
			this.width = div.clientWidth - 180;
			
			this.widthtscale = (this.width - 60) / ((this.nb * 2));
			this.maxvalue = this.findmaxvalue()
			this.heightscale = (this.height - 60) / this.maxvalue ;
		}

		var yScale = d3.scaleLinear()
			.domain([0, this.maxvalue ])
			.range([(this.height), 60]);

		const yAxisGrid = d3.axisLeft(yScale)
			.tickSize(- (this.width - 60))

		this.svg.append('g')
			.attr('class', 'y axis-grid')
			.attr("transform", "translate(30, -30)")
			.call(yAxisGrid)


		this.drawall()

		this.svg.selectAll("text")
			.attr("color", "white")
			.attr("font-size", "16px")

			
		this.svg.selectAll("line")
			.attr("stroke", "grey")
			
		this.svg.selectAll("path")
			.attr("stroke", "grey")
	}

	public drawall() {
		this.drawbar(this.data.lv, 0)
		this.drawbar(this.data.nbgameplayed, 1)
		this.drawbar(this.data.nbvictory, 2)
		this.drawbar(this.data.nblose, 3)
		this.drawbar(this.data.maxwingap, 4)
		this.drawbar(this.data.minwingap, 5)
		this.drawbar(this.data.maxlosegap, 6)
		this.drawbar(this.data.minlosegap, 7)
	}



	public findmaxvalue(): number {
		let max:number = 0;

		if (this.data.lv > max)
			max = this.data.lv;
		if (this.data.nbgameplayed > max)
			max = this.data.nbgameplayed;
		if (this.data.nbvictory > max)
			max = this.data.nbvictory;
		if (this.data.nblose > max)
			max = this.data.nblose;
		if (this.data.maxwingap > max)
			max = this.data.maxwingap;
		if (this.data.minwingap > max)
			max = this.data.minwingap;
		if (this.data.maxlosegap > max)
			max = this.data.maxlosegap;
		if (this.data.minlosegap > max)
			max = this.data.minlosegap;

		if (max < 10)
			max = 10;
		else {
			max += 2;
		}
		return max;
	}

	public drawbar(size: number, index: number) {
		const dif = this.maxvalue - size
		const time: number = 200;
		const name: string = this.columnName[index];
		
		let rect = this.svg.append("rect")
		
		rect
			.attr("x", ((index * 2) * this.widthtscale + (this.widthtscale / 2)))
			.attr("y", (this.maxvalue * this.heightscale))
			.attr("width", this.widthtscale)
			.attr("height", 0)
			.attr("transform", "translate(30, 30)")
			.transition()
			.delay(index * time)
			.ease(d3.easeQuad)
			.duration(1000)
			.attr("x", ((index * 2) * this.widthtscale + (this.widthtscale / 2)))
			.attr("y", (dif * this.heightscale))
			.attr("width", this.widthtscale)
			.attr("height", (size * this.heightscale))
			.attr("fill", this.color(this.columnName[index]))

		rect.on("mouseover", handleMouseOver)
			.on("mousemove", handleMouseMove)
			.on("mouseout", handleMouseOut)

		let legendrect = this.svg.append("rect")

		legendrect
			.attr('x', this.width )
			.transition()
			.delay(index * time)
			.duration(1000)
			.style("opacity", 1)
			.attr('x', this.width )
			.attr('y', 50 + (index * 30))
			.attr("width", 20)
			.attr("height", 20)
			.attr("fill", this.color(name))


		legendrect.on("mouseover", handleMouseOver)
			.on("mousemove", handleMouseMove)
			.on("mouseout", handleMouseOut)

		this.svg.append("text")
			.attr('x', this.width )
			.transition()
			.delay(index * time)
			.duration(1000)
			.style("opacity", 1)
			.attr('x', this.width + 30)
			.attr('y', 50 + (index * 30) + (15))
			.attr("width", 20)
			.attr("height", 20)
			.text(name)
			.attr("fill", "white")
			.attr("font-size", "12px")

		function handleMouseOver(d, i) {
			d3.select(this).attr("opacity", 0.5);
			let div = d3.select(".tooltip")
			if (div) {
				let div = d3.select(".tooltip")
				let msg: string = name + "<br>" +
					"value : " + size;
				div.html(msg)
			}
				let mydiv = document.getElementById("tooltip");
				let h = mydiv.clientHeight;
				let w = mydiv.clientWidth;
	
				div.style("left", (d.x) - (w + 20)+ "px")
					.style("top", (d.y) - (h / 2) + "px");
				div.transition()
					.duration(300)
					.style("opacity", 1);
		}

		function handleMouseMove(d, i) {
			let div = d3.select(".tooltip")
			let mydiv = document.getElementById("tooltip");
			let h = mydiv.clientHeight;
			let w = mydiv.clientWidth;

			div.style("left", (d.x) - (w + 20)+ "px")
				.style("top", (d.y) - (h / 2) + "px");
		}

		function handleMouseOut(d, i) {
			d3.select(this).attr("opacity", 1);

			let div = d3.select(".tooltip")
			if (div) {
				div.transition()
					.duration(300)
					.style("opacity", 0)
				div.transition()
					.delay(350)
					.style("left", 0 + "px")
					.style("top", 0 + "px");
				div.html("");
			}
		}

	}

}
