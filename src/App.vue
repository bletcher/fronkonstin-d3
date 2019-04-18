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

  
      <color-picker :width=300 :height=300 :disabled="false" v-model="color" startColor="#ff0000" @color-change="onColorChange">
      </color-picker>
      <div class="selected-color-info">
        <p>Selected color:</p>
        <svg height="32" width="32">
          <circle cx="16" cy="16" r="15" :fill="color" />
        </svg>
        <p> {{ color }}</p>
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
      stageHeight: null,

      currentTransform: d3.zoomIdentity,
      color: "#ff6600"
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

    this.generateLines()

       // nIter steps
        for (let r = 1; r < vm.selectedNIter; r++) {
          //console.log("in r loop", r);
  /*        this.midPoints(0, scale, edges, r, pond, angle, fun);
          //this.midPoints(1, scale, edges, 2);
          for (let n = 1; n < edges; n++) {
            this.midPoints(n, scale, edges, r, pond, angle, fun);
            //if(r % step === 0) this.conPoints(n, edges, r, curve); 
            this.conPoints2(n, edges, r, curve);
          }
          // // last line
          this.conPoints2(edges, edges, r, curve);
*/
        }
        



   

  },
 methods: {
   generateLines(){
     vm = this
     vm.list.length = 0
     vm.context.clearRect(0, 0, vm.width, vm.height);

     for (let n = 0; n < vm.selectedNEdges; n++) {
       this.polygon(n, vm.selectedNEdges, 50, vm.width/2, vm.height/2);
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
   midPoints(n, scale, edges, ringNum, pond, angle, fun) {
      const i = n + edges * (ringNum - 1);
      //console.log("fun", i, fun(i), ringNum, fun(ringNum));
      var xEndSegmentOffset = null;
      var yEndSegmentOffset = null;
      const ang =
        Math.atan2(
          vm.listPolygonScreen[i].yEnd - vm.listPolygonScreen[i].y,
          vm.listPolygonScreen[i].xEnd - vm.listPolygonScreen[i].x
        ) + Math.PI/angle;

      if (ringNum > 1) {
        xEndSegmentOffset = -fun(ringNum) * Math.cos(ang) * scale; // not sure why this is necessary
        yEndSegmentOffset = -fun(ringNum) * Math.sin(ang) * scale;
      } else {
        xEndSegmentOffset = fun(ringNum) * Math.cos(ang) * scale;
        yEndSegmentOffset = fun(ringNum) * Math.sin(ang) * scale;
      }
      const xSeg =
        pond * vm.listPolygonScreen[i].x +
        (1 - pond) * vm.listPolygonScreen[i].xEnd;
      const ySeg =
        pond * vm.listPolygonScreen[i].y +
        (1 - pond) * vm.listPolygonScreen[i].yEnd;

      vm.listSegment.push({
        angle: angle,
        x: xSeg,
        y: ySeg,
        xEndSegmentOffset: xEndSegmentOffset,
        yEndSegmentOffset: yEndSegmentOffset,
        xEnd: xSeg + xEndSegmentOffset,
        yEnd: ySeg + yEndSegmentOffset,
        points: [0, 0, xEndSegmentOffset, yEndSegmentOffset],
        ringNum: ringNum,
        i: i,
        stroke: "green",
        source: "midPoints"
      });
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
    console.log('zoomed',d3.event.transform)
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
    },
    onColorChange(color) {
      console.log('Color has changed to: ', color);
    }
  },
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