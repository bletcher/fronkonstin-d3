<template>
  <v-app>
   <div id="app">

      <v-container id="container" grid-list-lg text-xs-center fill-height fluid>
          <v-layout row wrap fill-height>
            <v-flex xs9 ref="stageFlex">
              <v-card>
                <div id="canvasContainer">
                  <canvas width="960" height="700"></canvas>
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
                  :max="7"
                  :min="0"
                  :step="0.01"
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
       
                <color-picker :width=300 :height=300 :disabled="false" v-model="selectedColor" startColor="#ff0000" @color-change="onColorChange">
                </color-picker>
                <div class="selected-color-info">
                  <p>Selected color:</p>
                  <svg height="32" width="32">
                    <circle cx="16" cy="16" r="15" :fill="selectedColor" />
                  </svg>
                  <p> {{ selectedColor }}</p>
                </div>
    
              </v-card>
            </v-flex>

        </v-layout>
      </v-container>

    </div> 
  </v-app>
</template>

<script>
import * as d3 from 'd3'
import ColorPicker from 'vue-color-picker-wheel';
let vm = {};

export default {
  name: 'App',
  components: {
    ColorPicker
  },
  data () {
    return {
      functions: ['constant', 'identity', 'log', 'square root', 'sin', 'log(x + 1)', '1 - cos(x)^2', '1/x',],

      listPolygon: [],
      list: [],
      listPolygonScreen: [],
      listCon: [],
      listSegment: [],
     
      selectedNEdges: 5, //# Number of edges of the original polygon
      selectedNIter: 4, //# Number of iterations
      selectedPond: 0.5, //# Weight to calculate the point on the middle of each edge
      selectedStep: 3,// # No of times to draw mid-segments before connect ending points
      selectedAngle: 2, //# angle of mid-segment with the edge
      selectedCurve: 5, //# Curvature of curves
      selectedScale: 150, // inital scaling factor
      selectedFunction: function() {
        return (0.2);
      },
      initXData: null,
      initYData: null,
      stageWidth: null,
      stageHeight: null,

      currentTransform: d3.zoomIdentity,
      selectedColor: "#ff6600"
    }
  },
  mounted(){
    vm = this

    const canvas = d3.select("canvas")
    vm.context = canvas.node().getContext("2d")
    vm.width = canvas.property("width")
    vm.height = canvas.property("height")

    canvas.call(d3.zoom()
        .scaleExtent([1 , 1])
        .on("zoom", vm.zoomed));
 
    this.generateLines()
  },
 methods: {
   generateLines(){
     vm = this
     vm.list.length = 0
     vm.context.clearRect(0, 0, vm.width, vm.height);

     for (let n = 0; n < vm.selectedNEdges; n++) {
       this.polygon(n, vm.selectedNEdges, vm.selectedScale, vm.width/2, vm.height/2);
     }

    for (let i = 1; i < vm.selectedNIter; i++) {
      for (let n = 0; n < vm.selectedNEdges; n++) {
        i%vm.selectedStep === 0 ? this.connectPoints(n,i) : this.midPoints(n,i)
      }
    }
    this.drawLines(vm.currentTransform)
   },
   drawLines(transform){
     vm = this
     for (let n = 0; n < vm.list.length; n++) { 
       this.drawLine(n,transform)  
     }
   },
   drawLine(n,transform){
     vm = this
     vm.context.beginPath()
     vm.context.strokeStyle = vm.selectedColor //"red"; // Green path
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
   midPoints(n, ringNum) {
      
      const currentIndex = vm.list.length
      const refIndex = currentIndex - vm.selectedNEdges 

      const angle =
        Math.atan2(
          vm.list[refIndex][3] - vm.list[refIndex][1],
          vm.list[refIndex][2] - vm.list[refIndex][0]
        ) + Math.PI/vm.selectedAngle;

      const x = vm.selectedPond * vm.list[refIndex][0] + (1 - vm.selectedPond) * vm.list[refIndex][2]  
      const y = vm.selectedPond * vm.list[refIndex][1] + (1 - vm.selectedPond) * vm.list[refIndex][3] 
      const xEnd = x + vm.selectedFunction(ringNum) * Math.cos(angle) * vm.selectedScale
      const yEnd = y + vm.selectedFunction(ringNum) * Math.sin(angle) * vm.selectedScale

      vm.list.push([x, y, xEnd, yEnd])
   },
   connectPoints(n,i) {
      const currentIndex = vm.list.length
      const refIndex = currentIndex - vm.selectedNEdges 

      const x = vm.list[refIndex][2]
      const y = vm.list[refIndex][3]
      let xEnd = null
      let yEnd = null

      if (n == (vm.selectedNEdges - 1)) {
        xEnd = vm.list[refIndex + 1 - vm.selectedNEdges][2]
        yEnd = vm.list[refIndex + 1 - vm.selectedNEdges][3]
      } else {      
        xEnd = vm.list[refIndex + 1][2]
        yEnd = vm.list[refIndex + 1][3]
      }
      vm.list.push([x, y, xEnd, yEnd])
   },
  zoomed() {
    vm = this
    vm.context.clearRect(0, 0, vm.width, vm.height);
    vm.drawLines(d3.event.transform);
    vm.currentTransform = d3.event.transform
    //console.log('zoomed',d3.event.transform)
  },
  updateSelectedEdges(){
    vm = this;
    vm.generateLines()
  },
  updateNIter(){
    vm = this;
    this.generateLines() 
    },
  updatePond(){
    vm = this;
    this.generateLines()
  },
  updateStep(){
    vm = this;
    this.generateLines()
  },
  updateAngle(){
    vm = this;
    this.generateLines()
  },
  updateCurve(){
    vm = this;
    this.generateLines()
  },
  updateScale(){
    vm = this;
    this.generateLines()
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
    this.generateLines()
  },
  onColorChange(selectedColor) {
    this.drawLines(vm.currentTransform)
    console.log('Color has changed to: ', selectedColor);
  }
 }
}

</script>

<style>

  @import url(https://fonts.googleapis.com/css?family=Barlow);

  * {
    font-family: "Barlow";
  }

  .center * {
    text-align: center;
  }

  #color-wheel {
    margin-left: auto;
    margin-right: auto;
  }

  .selected-color-info {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 15px 0;
  }

  .selected-color-info p {
    margin: 0 5px 0 0;
  }

</style>  