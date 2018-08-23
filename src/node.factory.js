
const zrender = require('zrender');



function getBorder(cfg) {
    // 线标
    var labelText = cfg.label.show ? cfg.label.formatter(cfg) : '';

    var borderColor = cfg.itemStyle.borderColor;
    var shadowBlur = cfg.itemStyle.shadowBlur || 0;
    var shadowColor = cfg.itemStyle.shadowColor || '';
    var imgUrl;


    var opc = cfg.opacity || 1;//节点透明度
    var _SecIgnore = false;
    // 外圈
    var _Sec = new zrender.Sector({
        shape: {
            cx: 0,
            cy: 0,
            r0: 1.40,
            r: 1.48 + cfg.itemStyle.borderWidth * 0.08
        },
        z: 10,
        name: 'outsideBorder',
        scale: [cfg.symbolSize, cfg.symbolSize],
        ignore: _SecIgnore, //是否隐藏
        style: {
            fill: borderColor,
            text: labelText,
            textFill: cfg.label.color,
            shadowBlur: shadowBlur,
            shadowColor: shadowColor,
            textPosition: cfg.label.position,
            fontSize: 12,
            opacity: opc
        }
    });

    return _Sec;
}

// 圆形节点
function getNodeIt(cfg, option) {
    var g = new zrender.Group({
        position: [0, 0]
    })

    var _Sec = getBorder(cfg);
// debugger
    var node = new zrender.Circle({
        shape: {
            cx: 0,
            cy: 0,
            r: 1.4
        },
        scale: [cfg.symbolSize, cfg.symbolSize],
        index: cfg['index'],
        tag: 'node',
        name: 'node',
        style: {
            fill: cfg['index'] == 3 ? 'yellow' : 'red',
            text: cfg.name,
            textFill: '#ccc',
            textPosition: 'bottom',
            fontSize: 12
        },
        draggable: true
    })



    g.add(_Sec);
    g.add(node);


    return g;
}



// 矩形节点
function getNodeRect(cfg, option) {
    var g = new zrender.Group({
        position: [0, 0]
    })

    if (!Array.isArray(cfg.symbolSize)) {
        cfg.symbolSize = [cfg.symbolSize, cfg.symbolSize];
    }
    var width = cfg.symbolSize[0];
    var height = cfg.symbolSize[1];

    var w = width / 3.2;
    var h = height / 3.2;

    var b = w > h ? w : h;

    var node = new zrender.Rect({
        shape: {
            x: -width / b / 2,
            y: -height / b / 2,
            width: width / b,
            height: height / b
        },
        scale: [b, b],
        index: cfg['index'],
        tag: 'node',
        name: 'node',
        style: {
            fill: cfg['index'] == 3 ? 'yellow' : 'red',
            text: '123',
            textFill: '#ccc',
            textPosition: 'bottom',
            fontSize: 12,
            stroke: cfg.itemStyle.borderColor,
            textPosition: cfg.label.position,
            lineWidth: cfg.itemStyle.borderWidth / b
        },
        draggable: true
    })

    g.add(node);


    return g;
}

// 图片节点
function getImgIt(cfg, option) {
    var g = new zrender.Group({
        position: [0, 0]
    })

    var _Sec = getBorder(cfg);

    var opc = cfg.opacity || 1;//节点透明度
    var img = new Image();
    img.crossOrigin = '*';
    img.src = cfg.symbol;

    var node = new zrender.Image({
        style: {
            x: -1.6,
            y: -1.6,
            image: img,
            width: 3.2,
            opacity: opc,
            height: 3.2
        },
        culling: true,
        index: cfg['index'],
        // invisible: !option.animate && !cfg.flag,
        source: cfg,
        name: 'node',
        tag: 'node',
        scale: [cfg.symbolSize * 0.88, cfg.symbolSize * 0.88],
        draggable: true
    })

    var clipPath = new zrender.Circle({
        shape: {
            cx: 0,
            cy: 0,
            r: 1.4
        }
    });

    node.setClipPath(clipPath);



    g.add(_Sec);
    g.add(node);

    return g;
}

function getWaterNode() {
    var waterTextBoxHeight = ops.height;
    var waterTextBoxWidth = ops.width;

    var waterGroup = new zrender.Group({
        name: 'waterText',
        position: [0, 0]
    })


    for (var i = -waterTextBoxWidth; i < waterTextBoxWidth * 2; i += 300) {
        for (var j = -waterTextBoxHeight; j < waterTextBoxHeight * 2; j += 300) {
            var style = {
                x: i,
                y: j,
                text: str,
                fontSize: 20,
                textFill: '#ccc'
            };
            style = _.extend(style, ops.style);

            var waterText = new zrender.Text({
                style: style,
                z: -10,
                cursor: 'inherit',
                rotation: 0.6
            })

            waterGroup.add(waterText);
        }
    }

    return waterGroup;
}

module.exports = {
    getImgIt,
    getNodeIt,
    getNodeRect,
    getWaterNode
}