//= require Dizmo
//= require ColorMixer

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
        },
        targetval: {
            is: 'rw',
            init: function() {
                return Gauge.Dizmo.load('targetval');
            }
        },
        targetaccuracy: {
            is: 'rw',
            init: function() {
                return Gauge.Dizmo.load('targetaccuracy');
            }
        }
    },

    after: {
        initialize: function() {
            var self = this;
            jQuery('#unit_inputfield').val(Gauge.Dizmo.load('unit'));
            jQuery('#display_unit').text(Gauge.Dizmo.load('unit'));
            jQuery('#maximum_value_inputfield').val(Gauge.Dizmo.load('maxval'));
            jQuery('#display_maxval').text(Gauge.Dizmo.load('maxval'));
            jQuery('#minimum_value_inputfield').val(Gauge.Dizmo.load('minval'));
            jQuery('#display_minval').text(Gauge.Dizmo.load('minval'));
            jQuery('#target_value_inputfield').val(Gauge.Dizmo.load('targetval'));
            jQuery('#target_textfield').val(Gauge.Dizmo.load('targetval'));

            if (Gauge.Dizmo.load('targetval')=== undefined){
                $('#target').hide();
            }else{
                $('#target').show();
            }

            self.initEvents();
        }
    },

    methods: {
        initEvents: function() {
            var self = this;

            jQuery('.done-btn').on('click', function() {
                var unitval = jQuery('.unit input').val();
                if (unitval !== '') {
                    self.setUnit(unitval);
                }

                var maxval = jQuery('.maximum_value input').val();
                if (maxval !== '') {
                    self.setMaxval(maxval);
                }

                var minval = jQuery('.minimum_value input').val();
                if (minval !== '') {
                    self.setMinval(minval);
                }
                var targetval = jQuery('.target_value input').val();
                if (targetval !== '') {
                    self.setTargetval(targetval);
                }

                var targetaccuracy = DizmoElements('.accuracy-select').val();
                if (targetaccuracy === 0)    {
                    console.log(targetaccuracy);
                } else{
                    self.setAccuracy(targetaccuracy);
                }

                // not the docked storage yet
                /*if (dizmo.publicStorage.getProperty('stdout') !== null){
                 self.setBackgroundColor(dizmo.publicStorage.getProperty('stdout'));
                 }*/
                Gauge.Dizmo.showFront();
            });

            // When docked, read the 'stdout' of the other docked dizmo, update the value,
            // set the framecolor and write into the 'stdout' node of the own publicStorage.
            dizmo.onDock(function(dockedDizmo) {
                var stdout = dockedDizmo.publicStorage.getProperty('stdout');
                //console.log(stdout);
                //self.syncingTasks(stdout);
                self.syncValueText(stdout);
                self.setBackgroundColor(stdout);
                Gauge.Dizmo.publish('stdout', stdout);
                self.subscriptionId = dockedDizmo.publicStorage.subscribeToProperty( 'stdout', function(path, val, oldVal) {
                    var stdout = val;
                    //self.syncingTasks(stdout);
                    self.syncValueText(stdout);
                    self.setBackgroundColor(stdout);
                    Gauge.Dizmo.publish('stdout', stdout);
                });
            });

            // When ondocking, cancel the subcription and remove the the 'stdout' node of the own publicStorage
            dizmo.onUndock(function(undockedDizmo) {
                if (self.subscriptionId !== undefined) {
                    dizmo.publicStorage.unsubscribeProperty(self.subscriptionId);
                    Gauge.Dizmo.unpublish('stdout');
                    //Gauge.Dizmo.unpublish('stdout/frame_color');
                }
            });

            var opts = {
                lines: 12, // The number of lines to draw
                angle: 0, // The length of each line
                lineWidth: 0.34, // The line thickness
                pointer: {
                    length: 30, // The radius of the inner circle
                    strokeWidth: 0, // The rotation offset
                    color: '#000000' // Fill color
                },
                percentColors: [[0.0, "#D6E49B" ], [0.50, "#FCD5A0"], [1.0, "#F79DA2"]], // !!!!
                limitMax: 'true',   // If true, the pointer will not go past the end of the gauge
                colorStart: '#D6E49B',   // Colors
                colorStop: '#91A63B',    // just experiment with them
                strokeColor: '#E0E0E0',   // to see which ones work best for you
                generateGradient: true
            };


            //console.log(opts);
            var target = document.getElementById('chart'); // your canvas element
            gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
            gauge.maxValue = 3000; // set max gauge value
            gauge.animationSpeed = 32; // set animation speed (32 is default value)
            gauge.set(3000); // set actual value
        },

        setUnit: function(unit) {
            var self = this;

            if (jQuery.type(unit) === 'string') {
                self.unit = unit;
                Gauge.Dizmo.save('unit', unit);
            }
        },

        setMaxval: function(maxval){
            var self = this;
            var int_maxval = parseInt(maxval);

            if (jQuery.type(int_maxval) === 'number') {
                try {
                    Gauge.Dizmo.save('maxval', int_maxval);
                } catch(ex) {
                    console.error (ex);
                }
            }
        },

        setMinval: function(minval){
            var self = this;
            var int_minval = parseInt(minval);

            if (jQuery.type(int_minval) === 'number') {
                try {
                    Gauge.Dizmo.save('minval', int_minval);
                } catch(ex) {
                    console.error (ex);
                }
            }
        },

        setTargetval: function(targetval){
            var self = this;
            var int_targetval = parseInt(targetval);

            if (jQuery.type(int_targetval) === 'number') {
                try {
                    Gauge.Dizmo.save('targetval', int_targetval);
                } catch(ex) {
                    console.error (ex);
                }
            }

            //jQuery('#tvalue').text(Gauge.Dizmo.load('targetval'));
            //show target value in the donut
        },

        setAccuracy: function(targetaccuracy){
            var self = this;

            var int_targetaccuracy = parseInt(targetaccuracy);

            if (jQuery.type(int_targetaccuracy) === 'number') {
                try {
                    Gauge.Dizmo.save('targetaccuracy', int_targetaccuracy);
                } catch(ex) {
                    console.error (ex);
                }
            }
            //jQuery('#display_data').text(int_targetaccuracy);
            //calculate targetvalue + and minus (100-targetaccuracy)
        },

        syncValueText: function (value) {
            /*var format = function (float, ext) {
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
             jQuery('#display_data').text('');
             } */
            var nv=value;
            console.log(nv);
            jQuery('#display_data').text(nv);
        },

        setBackgroundColor: function(value){
            var self = this;
            var maxval, minval, frame_color, lighter_color;
            var mincolor = '#ADC837';
            var maxcolor = '#EF3B45';
            if (Gauge.Dizmo.load('maxval') === undefined){
                maxval = 100;
            }
            else{
                maxval = Gauge.Dizmo.load('maxval');
            }

            if (Gauge.Dizmo.load('minval') === undefined){
                minval = 0;
            }
            else{
                minval = Gauge.Dizmo.load('minval');
            }

            // set minimum and maximum color

            if (value >= maxval) {
                frame_color = maxcolor;
            }
            else if (value <= minval) {
                frame_color = mincolor;
            }
            else {
                Gauge.ColorMixer.mix(mincolor, maxcolor, minval, maxval, value);
            }

            try{
                dizmo.setAttribute('settings/framecolor', frame_color);
            } catch (err){
                console.log(err);
            }
            //Gauge.Dizmo.publish('stdout/framecolor', frame_color);
        },

        syncingTasks: function(stdout){
            var self = this;
            self.syncValueText(stdout);

            self.setBackgroundColor(stdout);
            Gauge.Dizmo.publish('stdout', stdout);
        }
    }
});
