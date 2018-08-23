/* 默认样式 */
var graph = {
    symbolSize: 12,
    symbol:'circle',//'circle', 'rect'
    // 节点的样式
    itemStyle: {
        // borderColor: '#075c86',
        borderColor: 'white',
        borderWidth:1.0
    },
    // 节点下面文字的样式
    label: {
        show:true,
        color:'white',
        position: 'bottom',
        formatter: function () {
            return '444';
        }
    },
    // 线的样式
    lineStyle:{
        color:'#096593',
        width:1
    },
    // 线标文字的样式
    edgeLabel:{
        show:true,
        color:'#888888',
        formatter: function () {
            return ' ';
        }
    }
};

// 定义继承属性 继承自option.series
var nodes = [
    'symbolSize',
    'itemStyle',
    'label',
    'symbol'
];

var links = [
    'lineStyle',
    'edgeLabel'
];


exports.graph = graph;
exports.nodes = nodes;
exports.links = links;