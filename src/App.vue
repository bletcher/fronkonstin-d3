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

  
      <color-picker :width=300 :height=300 :disabled="false" v-model="selectedColor" startColor="#ff0000" @color-change="onColorChange">
      </color-picker>
      <div class="selected-color-info">
        <p>Selected color:</p>
        <svg height="32" width="32">
          <circle cx="16" cy="16" r="15" :fill="selectedColor" />
        </svg>
        <p> {{ selectedColor }}</p>
      </div>
    


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
      selectedNIter: 4,
      selectedPond: 0.5,
      selectedStep: 3,
      selectedAngle: 2,
      selectedCurve: 5,
      selectedScale: 150,
      selectedFunction: function() {
        return (0.2);
      },

      selectedValues: {   // will incorporate this on refactor
        selectedNEdges: 5,
        selectedNIter: 4,
        selectedPond: 0.5,
        selectedAngle: 2,
        selectedCurve: 5,
        selectedScale: 100
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
        .scaleExtent([1 / 2, 4])
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

    let ringNum = 1
    for (let i = 1; i < vm.selectedNIter; i++) {
      for (let n = 0; n < vm.selectedNEdges; n++) {
        i%vm.selectedStep === 0 ? this.connectPoints(n,i) : this.midPoints(n,i)
      }
    }
    this.drawLines(vm.currentTransform)
    console.log('poly', vm.selectedNEdges,vm.list.length, vm.list)
   },
   drawLines(transform){
     vm = this
     for (let n = 0; n < vm.list.length; n++) { 
       this.drawLine(n,transform)  
     }
    // vm.list.map(transform.apply, transform).forEach(vm.drawLine);
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
      //console.log('midPooints',n, vm.selectedNEdges, angle, currentIndex, vm.selectedFunction,vm.selectedFunction(ringNum),refIndex,vm.list)  
   },
   connectPoints(n,i) {
      const currentIndex = vm.list.length
      const refIndex = currentIndex - vm.selectedNEdges 

      const x = vm.list[refIndex][2]
      const y = vm.list[refIndex][3]
      let xEnd = null
      let yEnd = null

      if (n == (vm.selectedNEdges - 1)) {
        console.log("conn",n,refIndex,n === (vm.selectedNEdges - 1))
        xEnd = vm.list[refIndex + 1 - vm.selectedNEdges][2]
        yEnd = vm.list[refIndex + 1 - vm.selectedNEdges][3]
      } else {      
        xEnd = vm.list[refIndex + 1][2]
        yEnd = vm.list[refIndex + 1][3]
          console.log("connn2",n,refIndex,n === (vm.selectedNEdges - 1),xEnd)
      }
     console.log("conn3",n,refIndex,n === (vm.selectedNEdges - 1),xEnd)
      vm.list.push([x, y, xEnd, yEnd])
   },
    conPoints2(n, edges, ringNum, curve) {
      console.log('conPoints2', n, i)
      const i = n + edges * (ringNum - 1);
      var xSegOffset = null;
      var ySegOffset = null;
 
 console.log('conPoints2', n, i)

      if (n == edges) {
        xSegOffset = -(
          vm.listPolygonScreen[edges * (ringNum - 1)].xEnd -
          vm.listPolygonScreen[i - 1].xEnd
        );
        ySegOffset = -(
          vm.listPolygonScreen[edges * (ringNum - 1)].yEnd -
          vm.listPolygonScreen[i - 1].yEnd
        );
        vm.listCon.push({
          x: vm.listPolygonScreen[edges * (ringNum - 1)].xEnd,
          y: vm.listPolygonScreen[edges * (ringNum - 1)].yEnd,
          points: [0, 0, xSegOffset, ySegOffset],
          xEnd: vm.listPolygonScreen[edges * (ringNum - 1)].xEnd + xSegOffset,
          yEnd: vm.listPolygonScreen[edges * (ringNum - 1)].yEnd + ySegOffset,
          tension: curve,
          ringNum: ringNum,
          i: i,
          stroke: "blue",
          source: "conPoints2"
        });
      } else {
        xSegOffset = -(vm.listPolygonScreen[i].xEnd - vm.listPolygonScreen[i - 1].xEnd);
        ySegOffset = -(vm.listPolygonScreen[i].yEnd - vm.listPolygonScreen[i - 1].yEnd);

        vm.listCon.push({
          x: vm.listPolygonScreen[i].xEnd,
          y: vm.listPolygonScreen[i].yEnd,
          points: [0, 0, xSegOffset, ySegOffset],
          xEnd: vm.listPolygonScreen[i].xEnd + xSegOffset,
          yEnd: vm.listPolygonScreen[i].yEnd + ySegOffset,
          tension: curve,
          ringNum: ringNum,
          i: i,
          stroke: "blue",
          source: "conPoints2"
        });
      }
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
      vm.edges = vm.selectedNEdges 
      console.log('updateSelectedEdges',vm.currentTransform)
      vm.generateLines()
     // vm.render(vm.initXData,vm.initYData,vm.scale,vm.selectedNEdges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
     // console.log('in updateSElectedEdges', vm.selectedNEdges,500,500,vm.scale,
     // vm.edges,vm.nIter,vm.pond,vm.step,vm.angle,vm.curve,vm.fun)
    },
    updateNIter(){
      vm = this;
      vm.nIter = vm.selectedNIter 
      this.generateLines() 
      },
    updatePond(){
      vm = this;
      vm.pond = vm.selectedPond 
      this.generateLines()
    },
    updateStep(){
      vm = this;
      vm.step = vm.selectedStep 
      this.generateLines()
    },
    updateAngle(){
      vm = this;
      vm.angle = vm.selectedAngle 
      this.generateLines()
    },
    updateCurve(){
      vm = this;
      vm.curve = vm.selectedCurve 
      this.generateLines()
    },
    updateScale(){
      vm = this;
      vm.scale = vm.selectedScale 
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