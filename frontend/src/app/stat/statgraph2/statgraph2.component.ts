import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IStatAllUser } from 'src/app/interfaces/stat.interface';
import { IUser } from 'src/app/interfaces/user.interface';
import { socketType } from 'src/app/modules/general/home/home.component';

@Component({
    selector: 'app-statgraph2',
    templateUrl: './statgraph2.component.html',
    styleUrls: ['./statgraph2.component.scss']
})
export class Statgraph2Component implements OnInit, OnDestroy {
    
    @Input() public user!: IUser;
    @Input() public iduser: number = 0;
	@Input() public dispayid: number = 0;
    @Input() public socket!: socketType;

    public data: IStatAllUser[] = [];
    
    public svg: any;

    public width: number = 0;
    public height: number = 0;
    public maxratiovalue: number = 0;
    public minratiovalue: number = 0;

    public yScale: any;
    public xScale: any;
    public div: any;
    
    public maxnbgamevalue: number = 0;

    public getAllUserStatListener = (data: IStatAllUser[]) => {
        this.data=data;
        if (this.data) {
            this.sleep(100);
            this.createSvg();
        }
    }

    constructor() { }
    ngOnDestroy(): void {
        this.socket.off("getAllUserStat", this.getAllUserStatListener)

    }

    ngOnInit(): void {
        
        this.socket.on("getAllUserStat", this.getAllUserStatListener)
        this.socket.emit("getAllUserStat");
    }

    public sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    public createSvg() :void {
        this.defineMinMax();

        let mysvg = document.getElementById("allstat-svg");
        
        this.svg = d3.select('#allstat-svg')
            .attr('border', '1px solid black');

        if (mysvg) {
            mysvg.innerHTML =  '';
            this.height = mysvg.clientHeight - 20;
            this.width = mysvg.clientWidth;
        }
        
        this.yScale = d3.scaleLinear()
            .domain([this.minratiovalue, this.maxratiovalue])
            .range([(this.height), 60]);
        
        const yAxisGrid = d3.axisLeft(this.yScale)
            .tickSize(- (this.width - 90))
        
        this.xScale = d3.scaleLinear()
            .domain([0, this.maxnbgamevalue ])
            .range([0, (this.width - 90)]);
        
        this.svg.append("g")
            .attr("transform", "translate(60, " + (this.height - 30) + ")")
            .call(d3.axisBottom(this.xScale)).selectAll("text")
            .transition()
            .ease(d3.easeQuad)
            .duration(1000)
            .attr("y", "15")
            
        this.svg.append('g')
            .attr('class', 'y axis-grid')
            .attr("transform", "translate(60, -30)")
            .call(yAxisGrid).selectAll("text")
            .transition()
            .ease(d3.easeQuad)
            .duration(1000)
            .attr("x", "-15")
        
            
            
        this.data.forEach((raw, index) => {
            this.drawCircle(raw, index);
        })
        
        this.svg.selectAll("text")
            .attr("color", "white")
            .attr("font-size", "16px")

			
		this.svg.selectAll("line")
            .attr("stroke", "grey")
			
        this.svg.selectAll("path")
            .attr("stroke", "grey")
            
        this.svg.append("g").append("text")
            .attr("x", (this.width / 2) - 100)
            .attr("y", this.height + 15)
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("font-weight", "bolder")
            .text("Number of game played");

        this.svg.append("g").append("text")
            .attr("x", 15)
            .attr("y", 15)
            .attr("fill", "white")
            .attr("font-size", "12px")
            .attr("font-weight", "bolder")
            .text("Ratio");
        }
        
    public defineMinMax() {
        this.data.forEach(raw => {
            if (this.maxratiovalue < raw.ratio)
                this.maxratiovalue = raw.ratio;
            if (this.minratiovalue > raw.ratio)
                this.minratiovalue = raw.ratio;
            if (this.maxnbgamevalue < raw.nbgameplayed)
                this.maxnbgamevalue = raw.nbgameplayed;
        })
        if (this.maxratiovalue === 0)
            this.maxratiovalue = 10
        if (this.minratiovalue === 0)
            this.minratiovalue = -10
    }

    public async drawCircle(user: IStatAllUser, index: number) {

        let div = d3.select(".tooltip")
        
        const ratioscale: number = this.maxratiovalue + Math.abs(this.minratiovalue);
        let cricle = this.svg.append("circle")
            .attr("cx", this.xScale(0))
            .attr("cy", this.yScale(this.minratiovalue))
            .attr("fill", "#fff")
            .attr("r", "10")
            .attr("transform", "translate(60, -30)");


        cricle.transition()
            .delay(200)
            .ease(d3.easeQuad)
            .duration(4000)
            .attr("cx", this.xScale(user.nbgameplayed))
            .attr("cy", this.yScale(user.ratio))
            .attr("fill", d3.interpolateWarm((user.ratio + Math.abs(this.minratiovalue))/ ratioscale))
            .attr("r", 10 + (user.lv * 2))
            .attr("transform", "translate(60, -30)");
        

        cricle.on("mouseover", handleMouseOver)
            .on("mousemove", handleMouseMove)
            .on("mouseout", handleMouseOut)


            function handleMouseOver(d, i) {
                d3.select(this).attr("opacity", 0.5);
                let div = d3.select(".tooltip")
                if (div) {
                    let div = d3.select(".tooltip")
                    let msg: string = user.user.name + "<br>" +
                        "ratio : " + user.ratio + "<br>" +
                        "game played : " + user.nbgameplayed + "<br>" +
                        "victory : " + user.nbvictory + "<br>" +
                        "lose : " + user.nblose;
                    div.html(msg)
                    let mydiv = document.getElementById("tooltip");
                    let h = mydiv.clientHeight;
                    let w = mydiv.clientWidth;
        
                    div.style("left", (d.x) - (w + 20)+ "px")
                        .style("top", (d.y) - (h / 2) + "px");
                    
                    div.transition()
                        .duration(300)
                        .style("opacity", 1);

                }
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
