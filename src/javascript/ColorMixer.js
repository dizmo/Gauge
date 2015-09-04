/**
 * @class Color mixer
 *
 * @description
 * Mixes a lower and upper threshold RGB color.
 * Gives a lighter or darker color of the mixed color.
 */

Class('Gauge.ColorMixer', {
    my: {
        methods: {
            mix: function (mincolor, maxcolor, minval, maxval, value) {
                var min_color_r = Colors.hex2rgb(mincolor).R;
                var min_color_g = Colors.hex2rgb(mincolor).G;
                var min_color_b = Colors.hex2rgb(mincolor).B;

                var max_color_r = Colors.hex2rgb(maxcolor).R;
                var max_color_g = Colors.hex2rgb(maxcolor).G;
                var max_color_b = Colors.hex2rgb(maxcolor).B;

                var r = Math.round((max_color_r - min_color_r) * (value - minval) / (maxval - minval)) + min_color_r;
                var g = Math.round((max_color_g - min_color_g) * (value - minval) / (maxval - minval)) + min_color_g;
                var b = Math.round((max_color_b - min_color_b) * (value - minval) / (maxval - minval)) + min_color_b;
                var frame_color = Colors.rgb2hex(r, g, b);
                return frame_color;
            },

            lightenColor: function (color, amount){
                var usePound = false;

                if (color === undefined){
                    return;
                }

                if (color[0] == "#") {
                    color = color.slice(1);
                    usePound = true;
                }

                var num = parseInt(color,16);

                var r = (num >> 16) + amount;

                if (r > 255) r = 255;
                else if  (r < 0) r = 0;

                var b = ((num >> 8) & 0x00FF) + amount;

                if (b > 255) b = 255;
                else if  (b < 0) b = 0;

                var g = (num & 0x0000FF) + amount;

                if (g > 255) g = 255;
                else if (g < 0) g = 0;

                var hex= (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
                return Colors.hex2rgb(hex);

            }
        }
    }
});
