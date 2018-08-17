
const zrender = require('zrender');

// 圆形节点
function getNodeIt(cfg, option) {
    var node = new zrender.Circle({
        shape: {
            cx: 0,
            cy: 0,
            r: 1.4
        },
        scale: [cfg.symbolSize, cfg.symbolSize],
        id: cfg['id'],
        tag: 'node',
        style: {
            fill: cfg['id'] == 3 ? 'yellow' : 'red',
            text: cfg.name,
            textFill: '#ccc',
            textPosition: 'bottom',
            fontSize: 12
        },
        draggable: true
    })


    return node;
}
// 图片节点
function getImgIt(cfg, option) {
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
        id: cfg['id'],
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

    return node;
}

function getWaterNode(){
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
    getWaterNode
}