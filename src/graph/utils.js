function mergeOption(option) {
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
};

function render() {
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


};

module.exports = {
    mergeOption,
    render
};