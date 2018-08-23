var GraphRelation = require('./../dist/index');
var datas = require('./datas');

var myChart = GraphRelation(document.getElementById('main'));

var options = {
    series: {
        type: 'graph',
        symbolSize: 6,
        roam: true,
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        itemStyle:{
        },
        label: {
            show: true,
            formatter: function (params) {
                // return params.id;
                return '';
            }
        },
        edgeLabel: {
            show: true,
            formatter: function (params) {
                // return params.id;
                return '';
            }
        },
        data: datas.nodes1,
        links: datas.links1,
        lineStyle: {
            opacity: 1,
            width: 1
        }
    }
};

myChart.setOption(options);

var rectSelect = [];

myChart.on('dblclick', function (e) {
    if (e.topTarget.name == 'globalGroup') {
        myChart.setRectSelect(true);
    } else if (e.topTarget.name == 'rectSelect') {
        myChart.setRectSelect(false);
        myChart.setSelectCenter(rectSelect);
    }
})

myChart.on('mouseup', function (e) {
    if (e.which != 1) {
        options.series.data.map((it) => {
            it.itemStyle = {}
        })
        myChart.setRectSelect(false);
        myChart.update();
    }
})



myChart.on('selected', function (params) {
    // 矩形选框 宽高
    var width = params.ctx.shape.width;
    var height = params.ctx.shape.height;

    // 矩形选框中心点
    var rectSelectCenterX = params.ctx.shape.x + params.ctx.position[0] + width / 2;
    var rectSelectCenterY = params.ctx.shape.y + params.ctx.position[1] + height / 2;


    rectSelect = [rectSelectCenterX, rectSelectCenterY, width, height];


    options.series.data.map((it) => {
        it.itemStyle = {
            borderColor: null,
            borderWidth: 1
        }
    })
    params.selected.map((it) => {
        it.itemStyle.borderColor = 'yellow';
        it.itemStyle.borderWidth = 5;
    })

    myChart.update();
})
