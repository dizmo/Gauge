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
            }
        },

        maxval: {
            is: 'rw',
            init: function() {
                return Gauge.Dizmo.load('maxval');
            }
        },

        minval: {
            is: 'rw',
            init: function() {
                return Gauge.Dizmo.load('minval');
            }
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
                // not the docked storage yet
                if (dizmo.publicStorage.getProperty('stdout') != null){
                    self.setBackgroundColor(dizmo.publicStorage.getProperty('stdout'));
                }
                Gauge.Dizmo.showFront();
            });

            // When docked, read the 'stdout' of the other docked dizmo, update the value,
            // set the framecolor and write into the 'stdout' node of the own publicStorage.
            dizmo.onDock(function(dockedDizmo) {
                self.subscriptionId = dockedDizmo.publicStorage.subscribeToProperty( 'stdout', function(path, val, oldVal) {
                    var stdout = val;
                    self.syncValueText(stdout);
                    Gauge.Dizmo.publish('stdout/value', stdout);
                    self.setBackgroundColor(stdout);
                });
            });

            // When ondocking, cancel the subcription and remove the the 'stdout' node of the own publicStorage
            dizmo.onUndock(function(undockedDizmo) {
                if (self.subscriptionId !== undefined) {
                    dizmo.publicStorage.unsubscribeProperty(self.subscriptionId);
                    Gauge.Dizmo.unpublish('stdout');
                }
            });
        },

        setUnit: function(unit) {
            var self = this;

            if (jQuery.type(unit) === 'string') {
                self.unit = unit;
                Gauge.Dizmo.save('unit', unit);
            }
            jQuery('#display_unit').text(unit);
            jQuery('#unit_inputfield').text(Gauge.Dizmo.load('unit'));
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
            jQuery('#maximum_value_inputfield').val(Gauge.Dizmo.load('maxval'));
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
            jQuery('#minimum_value_inputfield').val(Gauge.Dizmo.load('minval'));
        },

        syncValueText: function (value) {
            var format = function (float, ext) {
                var string = float.toString();
                var parts = string.split('.');
                if (parts.length > 1) {
                    return parts[0] + '.' + parts[1].slice(0, ext);
                } else if (parts.length > 0) {
                    return parts[0] + '.00';
                } else {
                    return '0.00';
                }
            };

            if (jQuery.isNumeric(value)) {
                jQuery('#display_data').text(format(value, 2));
            } else {
                jQuery('#display_data').text('--.--');
            }
        },

        setBackgroundColor: function(value){
            var self = this;
            var maxval, minval
            if (Gauge.Dizmo.load('maxval') == null){
                maxval = 100;
            }
            else{
                maxval = Gauge.Dizmo.load('maxval');
            }

            if (Gauge.Dizmo.load('minval') == null){
                minval = 0;
            }
            else{
                var minval = Gauge.Dizmo.load('minval');
            }

            // set minimum and maximum color
            var min_color_rgb = Colors.hex2rgb('#447CA1');
            var max_color_rgb = Colors.hex2rgb('#CC2127');

            if (value >= maxval) {
                hex_color = '#ffCC2127';
            }
            else if (value <= minval) {
                hex_color = '#ff447CA1';
            }
            else {
                //mix color
                var min_color_r = min_color_rgb.R;
                var min_color_g = min_color_rgb.G;
                var min_color_b = min_color_rgb.B;

                var max_color_r = max_color_rgb.R;
                var max_color_g = max_color_rgb.G;
                var max_color_b = max_color_rgb.B;

                var r = Math.round((max_color_r - min_color_r) * (value - minval) / (maxval - minval)) + min_color_r;
                var g = Math.round((max_color_g - min_color_g) * (value - minval) / (maxval - minval)) + min_color_g;
                var b = Math.round((max_color_b - min_color_b) * (value - minval) / (maxval - minval)) + min_color_b;
                var hex_color = '#ff' + (Colors.rgb2hex(r, g, b).slice(1));
            }

            dizmo.setAttribute('settings/framecolor', hex_color);
            Gauge.Dizmo.publish('stdout/hex_color', hex_color);
        }
    }
});
