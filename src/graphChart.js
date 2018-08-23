+function () {

    const zrender = require('zrender');
    const rsAddNodes = require('./addNodes');
    const rsDefaultOption = require('./rsDefaultOption');
    const { clone, mergeWith, extend, isObject, isUndefined, isNull } = require('lodash');

    const d3 = require('d3-force');

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().distance(100).strength(100).id(function (d) { return d.id; }))
        .force("charge", d3.forceManyBody());


    const util = zrender.util;

    var Init = function (dom, ops) {
        ops = ops || {};
        // 取消鼠标右击事件
        dom.oncontextmenu = function () {
            return false;
        };

        var _this = this;

        this._zr = zrender.init(dom, ops);

    }

    var updateLayout = function () {
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
    }

    var scheduledAnimationFrame = false;
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

    Init.prototype = {
        constructor: Init,
        setOption: function (option) {
            this.option = option || this.option;
            option = this.option;

            if (!this.option) throw 'option Can\'t be empty';
            option.data = option.data || option.nodes;
            option._myChart = this;
            option._zr = this._zr;
            option.screenX = this._zr.getWidth();
            option.screenY = this._zr.getHeight();
            option.updateLayout = updateLayout;
            this.mergeOption(option);


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
        on: function (eventName, cb) {
            this._zr.on(eventName, cb);
        },
        setCenter: rsAddNodes.setCenter,
        getCenter: rsAddNodes.getCenter,
        setZoom: rsAddNodes.setZoom,
        getZoom: rsAddNodes.getZoom,
        setRectSelect: rsAddNodes.setRectSelect,
        //设置水印 ('str',options);
        setSelectCenter: function (rectSelect) {
            var option = this.option;
            var rectSelectCenterX = rectSelect[0];
            var rectSelectCenterY = rectSelect[1];
            var width = rectSelect[2];
            var height = rectSelect[3];


            if (!width || !height) return;

            // 画布宽高
            var screenX = option.screenX;
            var screenY = option.screenY;

            // 获取当前视图中心点
            var ps = this.getCenter();
            // 获取当前缩放倍数
            var scale = this.getZoom();
            var scaleX, scaleY;

            // 判断当次需要放大的倍数
            if (screenX / width > screenY / height) {
                scaleX = Math.abs(screenY / height);
                scaleY = Math.abs(screenY / height);
            } else {
                scaleX = Math.abs(screenX / width);
                scaleY = Math.abs(screenX / width);
            }

            // 设置缩放中心点
            ps[0] -= (rectSelectCenterX - ps[0]) * (scaleX - 1);
            ps[1] -= (rectSelectCenterY - ps[1]) * (scaleY - 1);

            // 整体居中
            ps[0] = ps[0] - (rectSelectCenterX - screenX / 2); //
            ps[1] = ps[1] - (rectSelectCenterY - screenY / 2);

            // 设置缩放倍数
            this.setZoom([scaleX, scaleY], false, true);
            // 设置视图中心点
            this.setCenter(ps, true);
            // 重画视图
            this.update();
        },
        setWaterText: function setWaterText(str, ops) {
            var options = {
                width: this._zr.getWidth(),
                height: this._zr.getHeight(),
                style: {
                    opacity: 0.2
                }
            };
            // 合并配置项
            options = extend(options, ops);
            // 设置水印
            rsAddNodes.setWaterText(str, options);
        }
    }


    function graph(dom, ops) {
        return new Init(dom, ops);
    }

    module.exports = graph;



}(window)