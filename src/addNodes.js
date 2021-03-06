const zrender = require('zrender');
const { merge } = require('lodash');

const nodeFactory = require('./node.factory');
var nodeId = {};


var globalG = new zrender.Group({
    position: [0, 0],
    name: 'globalGroup'
});

// 大背景 比如全局鼠标样式  里面包括矩形框选
const _rect = new zrender.Rect({
    shape: {
        x: 0,
        y: 0,
        width: 3000,
        height: 3000
    },
    invisible: true,
    z: -1,
    tag: 'globalGroup',
    name: 'globalGroup',
    cursor:'inherit',
    style: {
        fill: 'transparent'
    },
    onmousemove: function (e) {
        if (e.which == 1 && this.status && this.msd) {
            this.selectModel.width = e.offsetX - this.selectModel.x;
            this.selectModel.height = e.offsetY - this.selectModel.y;
            var rectS = new zrender.Rect({
                shape: this.selectModel,
                name: 'rectSelect',
                cursor: 'all-scroll',
                draggable: true,
                z:99,
                style: {
                    // stroke: '#9eacc7',
                    stroke: 'white',
                    lineDash: [6, 6],
                    fill: 'transparent'
                    // fill: 'rgba(1,15,31,0.3)'
                }
            });
            globalG.remove(globalG.childOfName('rectSelect'));
            globalG.add(rectS);
            // mouseup
            rectS.on('mousemove', function (e) {
                var selected = [];
                _g.childOfName('nodeGroups').eachChild((child) => {
                    // 变换局部坐标位置到全局坐标空间。
                    var childCoord = child._children[0].transformCoordToGlobal(0, 0);
                    if (this.contain(childCoord[0], childCoord[1])) {
                        var node = child.childOfName('node');
                        selected.push(nodeId[node.index]);
                    };
                })
                _g.__zr.trigger('selected', {
                    selected: selected,
                    ctx: this
                });

            })
            rectS.trigger('mousemove');
        }
    },
    onmouseup: function () {
        this.z = -1;
        this.msd = false;
        this.dirty();
    },
    onmousedown: function (e) {
        console.log(e);
        if (e.which != 1) return;
        globalG.remove(globalG.childOfName('rectSelect'));
        this.z = 9999;
        this.dirty();
        this.msd = true;
        // 矩形框选开始坐标
        this.selectModel = {
            x: e.offsetX,
            y: e.offsetY,
            width: 0,
            height: 0
        };
    }
});


const _g = new zrender.Group({
    position: ['none', 'none'],
    name: 'contentGroup'
});


function setEvents(node, cfg, option) {
    var events = {
        onmouseover: function () {
            this.parent.parent.animate()
                .when(160, { scale: [1.15, 1.15] })
                .start('elasticOut');
        },
        onmouseout: function (e) {
            this.parent.parent.animate()
                .when(60, { scale: [1, 1] })
                .start('elasticOut');
        },
        ondrag: function (params) {
            nodeId[this.index].bindS.map((item) => {
                item.setShape('x1', this.parent.parent.position[0] + this.position[0]);
                item.setShape('y1', this.parent.parent.position[1] + this.position[1]);
            })
            nodeId[this.index].bindT.map((item) => {
                item.setShape('x2', this.parent.parent.position[0] + this.position[0]);
                item.setShape('y2', this.parent.parent.position[1] + this.position[1]);
            })

            cfg.x = this.parent.parent.position[0] + this.position[0];
            cfg.y = this.parent.parent.position[1] + this.position[1];
            cfg.fx = this.parent.parent.position[0] + this.position[0];
            cfg.fy = this.parent.parent.position[1] + this.position[1];
            option.updateLayout();
        }
    }

    merge(node, events);
}

function getNode(cfg, option) {
    var nodeG = new zrender.Group({
        position: [cfg.x, cfg.y],
        ignore: nodeId[cfg.index].ignore,
        name: 'nodeG',
        culling: true
    });

    var opc = cfg.opacity || 1;//节点透明度



    var node;

    if (/\//.test(cfg.symbol)) {
        node = nodeFactory.getImgIt(cfg, option);
    } else if (cfg.symbol == 'circle') {
        node = nodeFactory.getNodeIt(cfg, option);
    } else if (cfg.symbol == 'rect') {
        node = nodeFactory.getNodeRect(cfg, option);
    }

    setEvents(node.childOfName('node'), cfg, option);

    var lock = new zrender.Image({
        style: {
            x: 1.4,
            y: 1.8,
            image: '/assets/images/relation.dev/lock.svg',
            width: 2,
            opacity: opc,
            height: 2
        },
        index: cfg['index'],
        ignore: !cfg.lock,
        name: 'node',
        tag: 'lock',
        scale: [cfg.symbolSize * 0.4, cfg.symbolSize * 0.4],
    })

    nodeG.add(node);
    nodeG.add(lock);

    return nodeG;
}


const addNodes = function (option) {
    var series = option.series;
    var ln = series.data.length;
    var nodeg = new zrender.Group({
        name: 'nodeGroups',
        tag: 'nodeGroups'
    });

    for (var i = 0; i < ln; i++) {
        var _id = series.data[i]['index'];
        
        nodeId[_id] = series.data[i];
        nodeId[_id].bindS = [];
        nodeId[_id].bindT = [];
        nodeId[_id].ignore = series.data[i].ignore;
        // console.time();
        var node = getNode(series.data[i], option);
        // console.timeEnd();

        nodeg.add(node);
    };

    _g.add(nodeg);
};

const addLinks = function (option) {
    var series = option.series;
    var ln = series.links.length;
    var linksG = new zrender.Group({
        name: 'relationGroups'
    });

    for (var i = 0; i < ln; i++) {
        var lk = series.links[i];
        var linkG = new zrender.Group({
            name: 'relationG'
        });

        var edgeLabelText = lk.edgeLabel.show ? lk.edgeLabel.formatter(series.links[i]) : '';
        // var edgeLabelText = '';
        var source = lk.source.index;
        var target = lk.target.index;
        // var _opc = nodeId[source].opacity<nodeId[target].opacity ? nodeId[source].opacity : nodeId[target].opacity;
        var _opc = lk.opacity;

        var x1 = nodeId[source].x,
            y1 = nodeId[source].y,
            x2 = nodeId[target].x,
            y2 = nodeId[target].y


        var rota = Math.atan((nodeId[target].x - nodeId[source].x) / (nodeId[target].y - nodeId[source].y)) - Math.PI / 2;
        rota = Math.abs(rota) > Math.PI / 2 ? rota - Math.PI : rota;

        var link = new zrender.Line({
            shape: {
                x1: nodeId[source].x,
                y1: nodeId[source].y,
                x2: nodeId[target].x,
                y2: nodeId[target].y
            },
            tag: "Line",
            data: {
                source: nodeId[source],
                target: nodeId[target]
            },
            ignore: nodeId[source].ignore || nodeId[target].ignore,
            style: {
                stroke: lk.lineStyle.color,
                text: edgeLabelText,
                fontSize: 14,
                textRotation: rota,
                lineWidth: lk.lineStyle.width,
                textFill: lk.edgeLabel.color,
                opacity: lk.lineStyle.opacity
            },
            z: -1
        })

        nodeId[source].bindS.push(link);
        nodeId[target].bindT.push(link);
        linkG.add(link);

        linksG.add(linkG);
    };

    _g.add(linksG);
};

const addView = function (option) {

    if (_g.position[0] == 'none') {
        _g.position[0] = 0;
        _g.position[1] = 0;
        // _g.position[0] = option._zr.getWidth() / 2;
        // _g.position[1] = option._zr.getHeight() / 2;
    }
    // console.time();
    _g.removeAll();
    // console.timeEnd();
    addNodes(option);
    
    
    
    addLinks(option);
    
    for (var k in nodeId) {
        _g.eachChild(function (child) {
            if (nodeId[k].index == child.index) {
                child._b = nodeId[k];
            }
        })
    }

    return globalG;
};


const setWaterText = function (str, ops) {
    var waterGroup = nodeFactory.getWaterNode(str, ops);

    waterGroup.dirty();
    globalG.remove(globalG.childOfName('waterText'));
    globalG.add(waterGroup);
}

globalG.add(_rect);
globalG.add(_g);



// 设置视图中心点
function setCenter(center, layout) {
    if (center && typeof center === 'object') {
        if (layout) {
            _g.animate()
                .when(800, { position: center })
                .start('quarticIn')
        } else {
            _g.position = center;
        }

        return;
    }
    _g.position = ['none', 'none'];
}

// 获取视图中心点
function getCenter() {
    return [_g.position[0], _g.position[1]];
}

// 设置视图缩放  set 为true时 是直接设置传过来的值为当前缩放比例   否则默认当做相对当前缩放倍数
//layout动画
function setZoom(scale, set, layout) {
    if (scale && typeof scale === 'object') {
        if (set) {
            _g.scale = scale;
        } else {
            if (layout) {
                _g.animate()
                    .when(800, { scale: [_g.scale[0] * scale[0], _g.scale[1] * scale[1]] })
                    .start('quarticIn')
            } else {
                _g.scale[0] *= scale[0];
                _g.scale[1] *= scale[1];
            }

        }
    }
}

// 获取当前缩放
function getZoom() {
    return [_g.scale[0], _g.scale[1]];
}

function setRectSelect(status) {
    if (status) {
        _rect.cursor = 'crosshair';
        _rect.status = status;
    } else {
        _rect.cursor = 'inherit';
        _rect.status = status;
        globalG.remove(globalG.childOfName('rectSelect'));
    }
    globalG.dirty();
}

module.exports = {
    addView,
    setWaterText,
    setCenter, //setCenter 设置视图的中心点
    getCenter,//获取视图中心点
    setZoom, // 设置视图缩放
    getZoom, // 获取视图缩放
    setRectSelect //矩形框选
}

