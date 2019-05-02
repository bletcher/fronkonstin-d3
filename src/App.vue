<template>
  <v-app>
   <div id="app">

      <v-container id="container" grid-list-lg text-xs-center fill-height fluid>
          <v-layout row wrap fill-height>
            <v-flex xs9 ref="stageFlex">
              <v-card>
                <div id="canvasContainer">
                  <canvas width="900" height="750"></canvas>
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
                        @change="update"
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

            <v-layout row wrap>
                <v-flex xs9>
                    <v-slider class="ma-2"
                    thumb-label
                    v-model="selectedAngle"
                    label="Angle"
                    @change="update"
                    :max="7"
                    :min="0"
                    :step="0.01"
                    ></v-slider>
                </v-flex>
                <v-flex xs3>
                    <v-text-field
                        v-model="selectedAngle"
                        class="ma-2"
                        @change="update"
                    ></v-text-field>
                </v-flex>
            </v-layout>

            <v-layout row wrap>
                <v-flex xs9>
                    <v-slider class="ma-2"
                        thumb-label
                        v-model="selectedCurve"
                        label="Curve"
                        @change="update"
                        :max="1"
                        :min="0"
                        :step="0.01"
                    ></v-slider>
                </v-flex>
                <v-flex xs3>
                    <v-text-field
                        v-model="selectedCurve"
                        class="ma-2"
                        @change="update"
                    ></v-text-field>
                </v-flex>
            </v-layout>

            <v-select class="ma-2"
                :items="functions"
                label="Function"
                v-model="selectedFunction"
                @change="updateFunction"
                solo
            ></v-select>
{{ selectedFunction }}
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
    <p style="margin-left: 30px">  See <a href="https://fronkonstin.com/2019/03/27/drrrawing-with-purrr/">this link</a> for detailed description of the algorithm and R code that inspired this application</p>
  </v-app>
</template>

<script>
import * as d3 from 'd3'
import ColorPicker from 'vue-color-picker-wheel'

export default {
  name: 'App',
  components: {
    ColorPicker
  },
  data () {
    return {
      functions: ['constant', 'identity', 'log', 'square root', 'sin', 'log(x + 1)', '1 - cos(x)^2', '1/x'],

      list: [],

      selectedNEdges: 5, // # Number of edges of the original polygon
      selectedNIter: 5, // # Number of iterations
      selectedPond: 0.5, // # Weight to calculate the point on the middle of each edge
      selectedStep: 3, // # No of times to draw mid-segments before connect ending points
      selectedAngle: 2, // # angle of mid-segment with the edge
      selectedCurve: 0, // # Curvature of curves
      curveAdjuster: 0.5,
      selectedFunction: function () {
        return (0.2)
      },

      currentTransform: d3.zoomIdentity,
      selectedColor: '#ff6600',
      selectedLinesColor: '#ff6600',
      selectedBackgroundColor: '#ffffff',
      colorSource: 'Lines',

      margin: 50,

      xScale: null,
      yScale: null
    }
  },
  mounted () {
    const canvas = d3.select('canvas')

    this.context = canvas.node().getContext('2d')
    this.width = canvas.property('width')
    this.height = canvas.property('height')

    const smallerAxis = Math.min(this.height, this.width)
    this.xScale = d3.scaleLinear().range([this.margin, smallerAxis - this.margin])
    this.yScale = d3.scaleLinear().range([smallerAxis - this.margin, this.margin])

    const zoom = d3.zoom()
      .scaleExtent([1 / 10, 50])
      .on('zoom', this.zoomed)

    canvas.call(zoom)
    this.generateLines()
  },
  methods: {
    getDomain () {
      const xStartValues = this.list.map(function (value, index) { return value[0] })
      const yStartValues = this.list.map(function (value, index) { return value[1] })
      const xEndValues = this.list.map(function (value, index) { return value[2] })
      const yEndValues = this.list.map(function (value, index) { return value[3] })

      const xRange = [Math.min(...xStartValues, ...xEndValues), Math.max(...xStartValues, ...xEndValues)]
      const yRange = [Math.min(...yStartValues, ...yEndValues), Math.max(...yStartValues, ...yEndValues)]

      this.xScale.domain(xRange)
      this.yScale.domain(yRange)
    // console.log('getDomain', this.list, xStartValues,yStartValues,xRange,yRange,xRange[1]-xRange[0],yRange[1]-yRange[0])
    },
    zoomed () {
      this.currentTransform = d3.event.transform
      this.drawLines(d3.event.transform)
    },
    generateLines () {
      this.list.length = 0
      this.context.clearRect(0, 0, this.width, this.height)

      for (let n = 0; n < this.selectedNEdges; n++) {
        this.polygon(n)
      }

      for (let i = 1; i < this.selectedNIter; i++) {
        for (let n = 0; n < this.selectedNEdges; n++) {
          i % this.selectedStep === 0 ? this.connectPoints(n, i) : this.midPoints(n, i)
        }
      }

      this.getDomain() // domain of data. Used for xScale, yScale
      this.drawLines(this.currentTransform)
    },
    drawLines (transform) {
      //    console.log('drawLines', transform, this.width, this.height)
      this.context.clearRect(0, 0, this.width, this.height)
      this.context.fillStyle = this.selectedBackgroundColor
      this.context.fillRect(0, 0, this.width, this.height)

      for (let n = 0; n < this.list.length; n++) {
        this.drawLine(n, transform)
      }
    },
    drawLine (n, transform) {
      const x3y3 = this.getX3Y3(this.list[n])
      console.log('drawLine', x3y3)
      this.context.beginPath()
      this.context.strokeStyle = this.selectedLinesColor
      this.context.moveTo(transform.x + transform.k * this.xScale(this.list[n][0]),
        transform.y + transform.k * this.yScale(this.list[n][1]))
      //  this.context.lineTo(transform.x + transform.k * this.xScale(this.list[n][2]),
      //                      transform.y + transform.k * this.yScale(this.list[n][3]));
      this.context.quadraticCurveTo(
        transform.x + transform.k * this.xScale(x3y3[0]),
        transform.y + transform.k * this.yScale(x3y3[1]),
        transform.x + transform.k * this.xScale(this.list[n][2]),
        transform.y + transform.k * this.yScale(this.list[n][3]))

      this.context.stroke()
    },
    getX3Y3 (d) {
      const midX = (d[0] + d[2]) / 2
      const midY = (d[1] + d[3]) / 2
      const slope = (d[3] - d[1]) / (d[2] - d[0])
      const dist = Math.sqrt(Math.pow(d[2] - d[0], 2) + Math.pow(d[3] - d[1], 2))
      const perpDist = dist * this.selectedCurve * this.curveAdjuster

      const angle = Math.atan(slope) / Math.PI * 180 - 90
      const radians = angle * Math.PI / 180
      const xUnits = Math.cos(radians) * perpDist
      const yUnits = Math.sin(radians) * perpDist

      const x3 = midX + xUnits
      const y3 = midY + yUnits

      return [x3, y3]
    },
    polygon (n) {
      const xStart = n === 0 ? this.width / 2 : this.list[n - 1][2]
      const yStart = n === 0 ? this.height / 2 : this.list[n - 1][3]
      const xEnd = xStart + Math.cos(((n + 1) * 2 * Math.PI) / this.selectedNEdges)
      const yEnd = yStart + Math.sin(((n + 1) * 2 * Math.PI) / this.selectedNEdges)

      this.list.push([xStart, yStart, xEnd, yEnd])
    },
    midPoints (n, ringNum) {
      const currentIndex = this.list.length
      const refIndex = currentIndex - this.selectedNEdges

      const angle =
        Math.atan2(
          this.list[refIndex][3] - this.list[refIndex][1],
          this.list[refIndex][2] - this.list[refIndex][0]
        ) + this.selectedAngle

      const x = this.selectedPond * this.list[refIndex][0] + (1 - this.selectedPond) * this.list[refIndex][2]
      const y = this.selectedPond * this.list[refIndex][1] + (1 - this.selectedPond) * this.list[refIndex][3]
      const xEnd = x + this.selectedFunction(ringNum) * Math.cos(angle)
      const yEnd = y + this.selectedFunction(ringNum) * Math.sin(angle)

      this.list.push([x, y, xEnd, yEnd])
    },
    connectPoints (n, i) {
      const currentIndex = this.list.length
      const refIndex = currentIndex - this.selectedNEdges

      const x = this.list[refIndex][2]
      const y = this.list[refIndex][3]
      let xEnd = null
      let yEnd = null

      if (n === (this.selectedNEdges - 1)) {
        xEnd = this.list[refIndex + 1 - this.selectedNEdges][2]
        yEnd = this.list[refIndex + 1 - this.selectedNEdges][3]
      } else {
        xEnd = this.list[refIndex + 1][2]
        yEnd = this.list[refIndex + 1][3]
      }
      this.list.push([x, y, xEnd, yEnd])
    },
    update () {
      this.generateLines()
    },
    updateFunction () {
      switch (this.selectedFunction) {
        case 'constant':
          this.fun = function () {
            return (0.2)
          }
          break
        case 'identity':
          this.fun = function (d) {
            return (d)
          }
          break
        case 'log':
          this.fun = function (d) {
            return Math.log(d)
          }
          break
        case 'square root':
          this.fun = function (d) {
            return Math.sqrt(d)
          }
          break
        case 'sin':
          this.fun = function (d) {
            return Math.sin(d)
          }
          break
        case 'log(x + 1)':
          this.fun = function (d) {
            return Math.log(d + 1)
          }
          break
        case '1 - cos(x)^2':
          this.fun = function (d) {
            return 1 - Math.cos(d) ^ 2
          }
          break
        case '1/x':
          this.fun = function (d) {
            return 1 / d
          }
          break
        default:
          this.fun = function (d) {
            return (d)
          }
      }
      this.selectedFunction = this.fun
      console.log('function', this.fun, 1, this.selectedFunction, this.selectedFunction(3), this.selectedFunction(4))
      this.generateLines()
    },
    onColorChange (selectedColor) {
      if (this.colorSource === 'Lines') {
        this.selectedLinesColor = selectedColor
      } else {
        this.selectedBackgroundColor = selectedColor
      }
      this.drawLines(this.currentTransform)
      // this.drawCircles(this.currentTransform)
      console.log('Color has changed to: ', selectedColor, this.colorSource, this.currentTransform)
    },
    updateColorSource () {
      console.log('updateColorSource', this.colorSource, this.currentTransform)
      this.drawLines(this.currentTransform)
    // this.drawCircles(this.currentTransform)
    },
    getAvg (d) {
      const total = d.reduce((acc, c) => acc + c, 0)
      return total / d.length
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
