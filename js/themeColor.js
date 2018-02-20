function createCanvas() {
    var clcanvas = document.createElement("canvas");
    var allcanvas = document.createElement("canvas");
    allcanvas.id = "spectrum-all";
    clcanvas.id = "spectrum-color";
    clcanvas.height = "200";
    allcanvas.height = "200";
    allcanvas.width = "20";
    /* var html = '<canvas height="200" id="spectrum-color" style="width:80%;height:200px;"> </canvas>' + '<canvas height="200" id="spectrum-all" width="20"> </canvas>' + '<br>' + '<div class="selected-color"></div>';*/
    document.getElementById('themeCanvas').appendChild(clcanvas);
    document.getElementById('themeCanvas').appendChild(allcanvas);
}

//Default Store Theme Color
(function ($, window, document, undefined) {

    'use strict';

    var defaultColor = 'primaryColor',
        dataName = 'primary-color',
        defaults = {
            skip: 5,
            callback: null
        };

    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, this.configure(options));
        this._defaults = defaults;
        this._name = defaultColor;
        this.primary = {
            rgb: '',
            count: 0
        };
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function () {
            $(new Image()).on('load', $.proxy(this.onLoad, this)).prop('src', this.element.src || '');
        },
        configure: function (options) {
            if (typeof options === 'function') {
                return {
                    callback: options
                };
            } else if (typeof options === 'object' || !options) {
                return options;
            }
            return {};
        },
        getImageData: function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.element.width;
            canvas.height = this.element.height;
            var context = canvas.getContext('2d');
            context.drawImage(this.element, 0, 0);
            return context.getImageData(0, 0, this.element.width, this.element.height);
        },
        isApproximateColor: function (color1, color2) {
            if (!color1 || !color2) {
                return false;
            }
            var c1 = color1.split(','),
                c2 = color2.split(','),
                r = c1[0] - c2[0],
                g = c1[1] - c2[1],
                b = c1[2] - c2[2],
                l = Math.sqrt(r * r + g * g + b * b);
            return l < 60;
        },
        onLoad: function () {
            var image_data = this.getImageData(),
                data = image_data.data,
                pixel_length = data.length / 4,
                colors = {};
            for (var px = 0; px < pixel_length; px = px + this.settings.skip * 4) {
                if (data[px + 3] < 255) {
                    continue;
                }

                var rgb = [data[px], data[px + 1], data[px + 2]].join(',');
                if (this.primary.rgb && this.isApproximateColor(this.primary.rgb, rgb)) {
                    rgb = this.primary.rgb;
                }
                colors[rgb] = colors[rgb] || 0;
                var count = ++colors[rgb];
                if (count > this.primary.count) {
                    this.primary.rgb = rgb;
                    this.primary.count = count;
                }
            }

            $.data(this.element, dataName, this.primary.rgb);

            if (typeof this.settings.callback === 'function') {
                this.settings.callback.call(this.element, this.primary.rgb);
            }
        }
    });

    $.fn[defaultColor] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + defaultColor)) {
                $.data(this, 'plugin_' + defaultColor, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);


//Theme Chosen
try {
    var colorChosen = JSON.parse(localStorage.getItem('soko-store-id-' + localStorage.getItem('soko-active-store'))).theme
} catch (err) {
    console.log(err);
    var colorChosen = null
}

$("#colorChosen").css("background", colorChosen);
