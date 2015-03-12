//= require Dizmo

Class("Gauge.Main", {
    has: {
        // This will be your wrapper around the dizmo API. It is instantiated
        // before the initialize function (defined below) is called and can
        // therefor already be used there.
        dizmo: {
            is: 'ro',
            init: function() {
                return new Gauge.Dizmo();
            }
        },

        unit: {
            is: 'rw',
            init: function() {
                return Gauge.Dizmo.load('unit');
            },

            setterName: 'setUnit'
        },

        maxval: {
            is: 'rw',
            init: function() {
                return Gauge.Dizmo.load('maxval');
            },

            setterName: 'setMaxval'
        },

        minval: {
            is: 'rw',
            init: function() {
                return Gauge.Dizmo.load('minval');
            },

            setterName: 'setMinval'
        }
    },

    after: {
        initialize: function() {
            var self = this;

            self.initEvents();
        }
    },

    methods: {
        initEvents: function() {
            var self = this;

            jQuery('.done-btn').on('click', function() {
                var unitval = jQuery('.unit input').val();
                if (unitval != '') {
                    self.setUnit(unitval);
                }

                var maxval = jQuery('.maximum_value input').val();
                if (maxval != '') {
                    self.setMaxval(maxval);
                }

                var minval = jQuery('.minimum_value input').val();
                if (minval != '') {
                    self.setMinval(minval);
                }

//                var displayedval = jQuery(this).attr('#.display_data');

                self.setBackgroundColor(8.5);
//                console.log((displayedval));

                Gauge.Dizmo.showFront();
            });

            jQuery(events).on('stdout.changed', function(e, value) {
                document.getElementById("display_data").innerHTML = value;
                self.setBackgroundColor(value);
            });

        },

        setUnit: function(unit) {
            var self = this;

            if (jQuery.type(unit) === 'string') {
                self.unit = unit;
                Gauge.Dizmo.save('unit', unit);
                console.log(unit);
            }
            jQuery('#display_unit').text(unit);
        },

        setMaxval: function(maxval){
            var self = this;
            var int_maxval = parseInt(maxval)

            if (jQuery.type(int_maxval) === 'number') {
                try {
                    Gauge.Dizmo.save('maxval', int_maxval);
                } catch(ex) {
                    console.error (ex);
                }
            }
            console.log(Gauge.Dizmo.load('maxval'));
        },

        setMinval: function(minval){
            var self = this;
            var int_minval = parseInt(minval)

            if (jQuery.type(int_minval) === 'number') {
                try {
                    Gauge.Dizmo.save('minval', int_minval);
                } catch(ex) {
                    console.error (ex);
                }
            }
            console.log(Gauge.Dizmo.load('minval'));
        },

        setBackgroundColor: function(value){
            var self = this;

            // set minimum and maximum color
            var min_color_rgb = Colors.hex2rgb('#447CA1');
            var max_color_rgb = Colors.hex2rgb('#CC2127');

            //mix color for the temperature measured
            var min_color_r = min_color_rgb.R;
            var min_color_g = min_color_rgb.G;
            var min_color_b = min_color_rgb.B;

            var max_color_r = max_color_rgb.R;
            var max_color_g = max_color_rgb.G;
            var max_color_b = max_color_rgb.B;

            var maxval = Gauge.Dizmo.load('maxval');
            var minval = Gauge.Dizmo.load('minval');

            var r = Math.round((max_color_r - min_color_r) * (value - minval) / (maxval - minval)) + min_color_r;
            var g = Math.round((max_color_g - min_color_g) * (value - minval) / (maxval - minval)) + min_color_g;
            var b = Math.round((max_color_b - min_color_b) * (value - minval) / (maxval - minval)) + min_color_b;
            var hex_color = '#ff' + (Colors.rgb2hex(r, g, b).slice(1));
            console.log(hex_color);

            dizmo.setAttribute('settings/framecolor', hex_color);
        }
    }
});
