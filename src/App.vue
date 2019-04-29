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

                <v-layout row wrap>
                    <v-flex xs9>
                        <v-slider class="ma-2"
                        thumb-label
                        v-model="selectedNEdges"
                        label="# of edges"
                        @change="update"
                        :max="20"
                        :min="1"
                        :step="1"
                        ></v-slider> 
                    </v-flex> 
                    <v-flex xs3>
                        <v-text-field
                            v-model="selectedNEdges"
                            class="ma-2"
                            type="number"
                            @click="update"
                        ></v-text-field>
                    </v-flex>
                </v-layout>

            <v-layout row wrap>
                <v-flex xs9>
                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedNIter"
                  label="# of iters"
                  @change="update"
                  :max="500"
                  :min="1"
                  :step="1"
                ></v-slider>
                </v-flex>
                <v-flex xs3>
                        <v-text-field
                            v-model="selectedNIter"
                            class="ma-2"
                            type="number"
                            @click="update"
                        ></v-text-field>
                    </v-flex>
                </v-layout>


            <v-layout row wrap>
                <v-flex xs9>
                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedPond"
                  label="Pond"
                  @change="update"
                  :max="1"
                  :min="0"
                  :step="0.01"
                ></v-slider>
                </v-flex>
                <v-flex xs3>
                        <v-text-field
                            v-model="selectedPond"
                            class="ma-2"
                            type="number"
                            @click="update"
                        ></v-text-field>
                    </v-flex>
                </v-layout>


            <v-layout row wrap>
                <v-flex xs9>
                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedStep"
                  label="Step"
                  @change="update"
                  :max="20"
                  :min="1"
                  :step="1"
                ></v-slider>
                </v-flex>
                <v-flex xs3>
                        <v-text-field
                            v-model="selectedStep"
                            class="ma-2"
                            type="number"
                            @click="update"
                        ></v-text-field>
                </v-flex>
            </v-layout>
               



                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedAngle"
                  label="Angle"
                  @change="update"
                  :max="7"
                  :min="0"
                  :step="0.01"
                ></v-slider>

                <v-slider class="ma-2"
                  thumb-label
                  v-model="selectedCurve"
                  label="Curve"
                  @change="update"
                  :max="10"
                  :min="0"
                  :step="0.1"
                ></v-slider>

                <v-select class="ma-2"
                  :items="functions"
                  item-text="selectedFunction"
                  label="Function"
                  v-model="selectedFunction"
                  @change="updateFunction"
                ></v-select>
                <hr>

                <v-expansion-panel>
                    <v-expansion-panel-content>
                        <template v-slot:header>
                        <div>Color picker</div>
                        </template>
                        <v-card>

                                <v-flex xs12 sm6 class="py-2">      
                                <v-btn-toggle 
                                v-model="colorSource"
                                @change="updateColorSource"
                                >
                                    <v-btn flat value="Lines">
                                    Lines
                                    </v-btn>
                                    <v-btn flat value="Background">
                                    Background
                                    </v-btn>
                                </v-btn-toggle>
                                </v-flex>

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
                    </v-expansion-panel-content>
                    </v-expansion-panel>
    
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

      list: [],

      selectedNEdges: 5, //# Number of edges of the original polygon
      selectedNIter: 4, //# Number of iterations
      selectedPond: 0.5, //# Weight to calculate the point on the middle of each edge
      selectedStep: 3,// # No of times to draw mid-segments before connect ending points
      selectedAngle: 2, //# angle of mid-segment with the edge
      selectedCurve: 5, //# Curvature of curves
      selectedScale: 1, // inital scaling factor
      selectedFunction: function() {
        return (0.2);
      },
      initXData: null,
      initYData: null,
      stageWidth: null,
      stageHeight: null,

      currentTransform: d3.zoomIdentity,
      selectedColor: "#ff6600",
      selectedLinesColor: "#ff6600",
      selectedBackgroundColor: "#ffffff",
      colorSource: 'Lines',
      
      margin: 50,

      xScale: null,
      yScale: null
    }
  },
  mounted(){
    vm = this

    const canvas = d3.select("canvas")
    vm.context = canvas.node().getContext("2d")
    vm.width = canvas.property("width")
    vm.height = canvas.property("height")

    const smallerAxis = Math.min(vm.height, vm.width)
    vm.xScale = d3.scaleLinear().range([vm.margin, smallerAxis - vm.margin]);  
    vm.yScale = d3.scaleLinear().range([smallerAxis - vm.margin, vm.margin]);

    const zoom = d3.zoom()
        .scaleExtent([1/10 , 50])
        .on("zoom", vm.zoomed);

    canvas.call(zoom)

    vm.generateLines()
  },
 methods: {
   getDomain(){
    vm = this   

    const xStartValues = vm.list.map(function(value,index) { return value[0]; })
    const yStartValues = vm.list.map(function(value,index) { return value[1]; })
    const xEndValues   = vm.list.map(function(value,index) { return value[2]; })
    const yEndValues   = vm.list.map(function(value,index) { return value[3]; })
    const xMin = Math.min(...xStartValues,...xEndValues)
    const xMax = Math.max(...xStartValues,...xEndValues)
    const yMin = Math.min(...yStartValues,...yEndValues)
    const yMax = Math.max(...yStartValues,...yEndValues)

    const xRange = [Math.min(...xStartValues,...xEndValues), Math.max(...xStartValues,...xEndValues)]
    const yRange = [Math.min(...yStartValues,...yEndValues), Math.max(...yStartValues,...yEndValues)]

    vm.xScale.domain(xRange)
    vm.yScale.domain(yRange)
    console.log('getDomain', vm.list, xStartValues,yStartValues,xRange,yRange,xRange[1]-xRange[0],yRange[1]-yRange[0])
   },
   zoomed() {
     vm = this
     vm.currentTransform = d3.event.transform
     vm.drawLines(d3.event.transform);
    },
   generateLines(){
     vm = this
     vm.list.length = 0
     vm.context.clearRect(0, 0, vm.width, vm.height);

     for (let n = 0; n < vm.selectedNEdges; n++) {
       this.polygon(n);
     }

    for (let i = 1; i < vm.selectedNIter; i++) {
      for (let n = 0; n < vm.selectedNEdges; n++) {
        i%vm.selectedStep === 0 ? this.connectPoints(n,i) : this.midPoints(n,i)
      }
    }
    console.log('generateLines', vm.currentTransform)

    vm.getDomain() // domain of data. Used for xScale, yScale
    this.drawLines(vm.currentTransform)
   },
   drawLines(transform){
     vm = this
 //    console.log('drawLines', transform)
     vm.context.clearRect(0, 0, vm.width, vm.height);
     vm.context.fillStyle = vm.selectedBackgroundColor
     vm.context.fillRect(0, 0, vm.width, vm.height)
     
     for (let n = 0; n < vm.list.length; n++) { 
       this.drawLine(n,transform)  
     }
   },
   drawLine(n,transform){
 //    console.log('drawLine', transform, vm.xScale(500),vm.yScale(400), 
 //      transform.x + transform.k * vm.xScale(vm.list[n][0]),
 //      transform.y + transform.k * vm.yScale(vm.list[n][1]))
     vm = this
     vm.context.beginPath()
     vm.context.strokeStyle = vm.selectedLinesColor
     vm.context.moveTo(transform.x + transform.k * vm.xScale(vm.list[n][0]),
                       transform.y + transform.k * vm.yScale(vm.list[n][1]));
     vm.context.lineTo(transform.x + transform.k * vm.xScale(vm.list[n][2]),
                       transform.y + transform.k * vm.yScale(vm.list[n][3]));
     vm.context.stroke(); 

   }, 
   polygon(n) {
       const xStart = n == 0 ? vm.width/2  : vm.list[n - 1][2];
       const yStart = n == 0 ? vm.height/2 : vm.list[n - 1][3];
       const xEnd = xStart + Math.cos(((n + 1) * 2 * Math.PI) / vm.selectedNEdges);
       const yEnd = yStart + Math.sin(((n + 1) * 2 * Math.PI) / vm.selectedNEdges);  

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
  update(){
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
    vm = this
    if(vm.colorSource == 'Lines'){
      vm.selectedLinesColor = selectedColor
    }
    else {
      vm.selectedBackgroundColor = selectedColor
    }
    vm.drawLines(vm.currentTransform)
    //vm.drawCircles(vm.currentTransform)
    console.log('Color has changed to: ', selectedColor, vm.colorSource, vm.currentTransform);
  },
  updateColorSource(){
    vm = this
    console.log('updateColorSource', vm.colorSource, vm.currentTransform)
    vm.drawLines(vm.currentTransform)
    //vm.drawCircles(vm.currentTransform)
  },
  getAvg(d) {
    const total = d.reduce((acc, c) => acc + c, 0);
    return total / d.length;
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