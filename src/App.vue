<template>
  <v-app>
   <div id="app">

      <v-container id="container" grid-list-lg text-xs-center fill-height fluid>
          <v-layout row wrap fill-height>
            <v-flex xs9 ref="stageFlex">
              <v-card>
                <div id="canvasContainer">
                  <canvas width="960" height="500"></canvas>
                </div>
              </v-card>
            </v-flex>
            
            <v-flex xs3>
              <v-card class="pt-2">
                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedNEdges"
                  label="# of edges"
                  @change="updateSelectedEdges"
                  :max="20"
                  :min="1"
                  :step="1"
                ></v-slider>
            
                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedNIter"
                  label="# of iters"
                  @change="updateNIter"
                  :max="300"
                  :min="1"
                  :step="1"
                ></v-slider>
                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedPond"
                  label="Pond"
                  @change="updatePond"
                  :max="1"
                  :min="0"
                  :step="0.01"
                ></v-slider>
                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedStep"
                  label="Step"
                  @change="updateStep"
                  :max="20"
                  :min="1"
                  :step="1"
                ></v-slider>
                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedAngle"
                  label="Angle"
                  @change="updateAngle"
                  :max="20"
                  :min="0"
                  :step="0.1"
                ></v-slider>

                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedCurve"
                  label="Curve"
                  @change="updateCurve"
                  :max="10"
                  :min="0"
                  :step="0.1"
                ></v-slider>

                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedScale"
                  label="Scale"
                  @change="updateScale"
                  :max="500"
                  :min="1"
                  :step="1"
                ></v-slider>

                <v-select class="ma-2"
                  :items="functions"
                  label="Function"
                  v-model="selectedFunction"
                  @change="updateFunction"
                ></v-select>
      
              </v-card>
            </v-flex>

        </v-layout>
      </v-container>               

    </div> 
  </v-app>
</template>

<script>
import * as d3 from 'd3'
let vm = {};

export default {
  name: 'App',

  data () {
    return {
            scale: 100,
      edges: 5, //# Number of edges of the original polygon
      nIter: 3, //# Number of iterations
      pond: 0.5, //# Weight to calculate the point on the middle of each edge
      step: 2, // # No of times to draw mid-segments before connect ending points
      angle: 2, //# angle of mid-segment with the edge
      curve: 5, //# Curvature of curves
      fun: function() {
        return (0.2);
      },
      functions: ['constant', 'identity', 'log', 'square root', 'sin', 'log(x + 1)', '1 - cos(x)^2', '1/x',],

      listPolygon: [],
      list: [],
      listPolygonScreen: [],
      listCon: [],
      listSegment: [],
     
      selectedNEdges: 5,
      selectedNIter: 25,
      selectedPond: 0.5,
      selectedStep: 3,
      selectedAngle: 2,
      selectedCurve: 5,
      selectedScale: 100,
      selectedFunction: function() {
        return (0.2);
      },

      selectedValues: {   // will incorporate this on refactor
        selectedNEdges: 5,
        selectedNIter: 25,
        selectedPond: 0.5,
        selectedAngle: 2,
        selectedCurve: 5,
        selectedScale: 100
      },
      initXData: null,
      initYData: null,
      stageWidth: null,
      stageHeight: null
    }
  },
  mounted(){
    vm = this

    const canvas = d3.select("canvas")
    vm.context = canvas.node().getContext("2d")
    vm.width = canvas.property("width")
    vm.height = canvas.property("height")
   // vm.radius = 2.5

   // vm.points = d3.range(2000).map(vm.phyllotaxis(10));

    canvas.call(d3.zoom()
        .scaleExtent([1 / 2, 4])
        .on("zoom", vm.zoomed));

    //vm.drawPoints(d3.zoomIdentity);
    const edges = 5
    const scale = 50
    for (let n = 0; n < edges; n++) {
      this.polygon(n, edges, scale, vm.width/2, vm.height/2);
    }
    console.log('poly', vm.list.length, vm.list)  

    this.drawLines(d3.zoomIdentity)

  },
 methods: {
   drawLines(transform){
     vm = this
     for (let n = 0; n < vm.list.length; n++) { 
       this.drawLine(n,transform)  
     }

      
    // vm.list.map(transform.apply, transform).forEach(vm.drawLine);
   },
   drawLine(n,transform){
     console.log('line', n,transform)
     vm = this
     vm.context.beginPath()
     vm.context.strokeStyle = "red"; // Green path
     vm.context.moveTo(transform.applyX(vm.list[n][0]), transform.applyY(vm.list[n][1]));
     vm.context.lineTo(transform.applyX(vm.list[n][2]), transform.applyY(vm.list[n][3]));
     vm.context.stroke(); // Draw it
   }, 
   polygon(n, edges, scale, initX, initY) {
       const xStart = n == 0 ? initX : vm.list[n - 1][2];
       const yStart = n == 0 ? initY : vm.list[n - 1][3];
       const xEnd = xStart + Math.cos(((n + 1) * 2 * Math.PI) / edges) * scale;
       const yEnd = yStart + Math.sin(((n + 1) * 2 * Math.PI) / edges) * scale;  

       vm.list.push([xStart, yStart, xEnd, yEnd])
   },

  zoomed() {
    vm = this
    vm.context.clearRect(0, 0, vm.width, vm.height);
    vm.drawLines(d3.event.transform);
  },

  drawPoints(transform) {
    vm = this 
    vm.context.beginPath();
    vm.points.map(transform.apply, transform).forEach(vm.drawPoint);
    vm.context.fill();
  },

  drawPoint(point) {
    this.context.moveTo(point[0] + this.radius, point[1]);
    this.context.arc(point[0], point[1], this.radius, 0, 2 * Math.PI);
  },

    updateSelectedEdges(){
      vm = this;
      vm.edges = vm.selectedNEdges 
      vm.render(vm.initXData,vm.initYData,vm.scale,vm.selectedNEdges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
      console.log('in updateSElectedEdges', vm.selectedNEdges,500,500,vm.scale,
      vm.edges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
    },
    updateNIter(){
      vm = this;
      vm.nIter = vm.selectedNIter 
      vm.render(vm.initXData,vm.initYData,vm.scale,vm.selectedNEdges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
    },
    updatePond(){
      vm = this;
      vm.pond = vm.selectedPond 
      vm.render(vm.initXData,vm.initYData,vm.scale,vm.selectedNEdges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
    },
    updateStep(){
      vm = this;
      vm.step = vm.selectedStep 
      vm.render(vm.initXData,vm.initYData,vm.scale,vm.selectedNEdges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
    },
    updateAngle(){
      vm = this;
      vm.angle = vm.selectedAngle 
      vm.render(vm.initXData,vm.initYData,vm.scale,vm.selectedNEdges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
    },
    updateCurve(){
      vm = this;
      vm.curve = vm.selectedCurve 
      vm.render(vm.initXData,vm.initYData,vm.scale,vm.selectedNEdges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
    },
    updateScale(){
      vm = this;
      vm.scale = vm.selectedScale 
      vm.render(vm.initXData,vm.initYData,vm.scale,vm.selectedNEdges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
    },
    updateFunction(){
      vm = this;
      
      switch(vm.selectedFunction) {
        case 'constant':
          vm.fun = function() {
              return (0.2);
          }
          break;
        case 'identity':
          vm.fun = function(d) {
              return (d);
          }
          break;
        case 'log':
          vm.fun = function(d) {
              return Math.log(d);
          }
          break;
        case 'square root':
          vm.fun = function(d) {
              return Math.sqrt(d);
          }
          break;
        case 'sin':
          vm.fun = function(d) {
              return Math.sin(d);
          }
          break;
        case 'log(x + 1)':
          vm.fun = function(d) {
              return Math.log(d + 1);
          }
          break;
        case '1 - cos(x)^2':
          vm.fun = function(d) {
              return 1 - Math.cos(d)^2;
          }
          break;
        case '1/x':
          vm.fun = function(d) {
              return 1 / d;
          }
          break;
        default:
          vm.fun = function(d) {
              return (d);
          }
      }

      vm.selectedFunction = vm.fun
      console.log('function', vm.fun, 1,vm.selectedFunction)
      vm.render(vm.initXData,vm.initYData,vm.scale,vm.selectedNEdges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
    }
  },
}


</script>

<style>

</style>  