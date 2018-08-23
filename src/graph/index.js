var addNodes = require('./addNodes');
var utils = require('./utils');
const rsDefaultOption = require('./rsDefaultOption');
const { clone, mergeWith, extend, isObject, isUndefined, isNull } = require('lodash');

const d3 = require('d3-force');

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-700));

function Graph(option) {
    this.option = option;
    this.setOption();
}

var ticked = function (a, b, c) {
    if (window.requestAnimationFrame) {
        if (scheduledAnimationFrame) { return }
        scheduledAnimationFrame = true
        window.requestAnimationFrame(() => {
            scheduledAnimationFrame = false;
            this.render();
        })
    } else {
        setTimeout(() => {
            this.render();
        }, 20)
    }
}


Graph.prototype = {
    constructor: Graph,
    setOption: function () {
        option = this.option;
        
        option.simulation = simulation;
        // debugger
        option.simulation.force("center", d3.forceCenter(this._zr.getWidth() / 2, this._zr.getHeight() / 2));

        option.simulation
            .nodes(option.series.data)
            .on("tick", ticked.bind(this));

        option.simulation.force("link")
            .links(option.series.links)
            .iterations(0.8)
            .distance(30).strength(0.4);
    },
    mergeOption: function (option) {
        option = option || this.option;
        function customizer(objValue, srcValue) {
            if (isObject(objValue)) {
                return mergeWith(objValue, srcValue, customizer);
            }
            return isUndefined(objValue) || isNull(objValue) ? srcValue : objValue;
        }

        mergeWith(option.series, rsDefaultOption.graph, customizer);

        option.series.data.map(function (_d) {
            rsDefaultOption.nodes.map(function (k) {
                if (_d[k]) {
                    mergeWith(_d[k], option.series[k], customizer);
                } else {
                    _d[k] = option.series[k];
                }
                _d[k] = clone(_d[k]);
            })
        })

        option.series.links.map(function (_d) {
            rsDefaultOption.links.map(function (k) {
                if (_d[k]) {
                    mergeWith(_d[k], option.series[k], customizer);
                } else {
                    _d[k] = option.series[k];
                }
                _d[k] = clone(_d[k]);
            })
        })
    },
    update: function () {
        this.mergeOption();
        this.render();
    },
    updateLayout = function () {
        var option = this;
        var nodes = [];
        var links = [];
        option.series.data.map(function (item) {
            if (!item.ig) {
                nodes.push(item);
            }
        })
        option.series.links.map(function (item) {
            if (!item.ig) {
                links.push(item);
            }
        })

        option.simulation.alphaTarget(0.3).restart();
    },
    render: function () {
        var option = this.option;

        if (!this._g) {
            /* *********************这里面只会进入一次************************ */
            this.globalG = rsAddNodes.addView(option);
            this._g = this.globalG.childOfName('contentGroup');

            this._zr.on('mousewheel', (params) => {
                var ps = this._g.position;
                if (params.wheelDelta > 0) {
                    this._g.scale[0] *= 1.1;
                    this._g.scale[1] *= 1.1;
                    ps[0] -= (params.offsetX - ps[0]) * 0.1;
                    ps[1] -= (params.offsetY - ps[1]) * 0.1;
                } else {
                    this._g.scale[0] *= 0.9;
                    this._g.scale[1] *= 0.9;
                    ps[0] -= -(params.offsetX - ps[0]) * 0.1;
                    ps[1] -= -(params.offsetY - ps[1]) * 0.1;
                }
                this._g.dirty();
            })

            // 拖动
            this._zr.on('mousemove', (params) => {
                this._g.cursor = 'all-scroll';
                if (!this._mousedown) return;

                if (!this.thisTarget && (params.target && params.target.tag == 'globalGroup' && !params.target.status)) {
                    this._g.position[0] += params.event.movementX;
                    this._g.position[1] += params.event.movementY;
                    this._g.dirty();
                }
            })
            // 拖动
            this._zr.on('mousedown', (params) => {
                this._mousedown = true;
                if (params.target && params.target.tag == 'node')
                    this.thisTarget = params.target;
            })

            this._zr.on('mouseup', (params) => {
                this._mousedown = false;
                this.thisTarget = null;
            })

            this._zr.add(this.globalG);
        } else {
            this._g = rsAddNodes.addView(option).childOfName('contentGroup');
            this._g.dirty();
        }


    },
}

module.exports = {
    ...addNodes
};