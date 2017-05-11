//= require Dizmo
//= require ColorMixer

var meter;

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
    targetrange: {
      is: 'rw',
      init: function() {
        return Gauge.Dizmo.load('targetrange');
      }
    }
  },

  after: {
    initialize: function() {
      var self = this;

      if (!Gauge.Dizmo.load('unit')){
        jQuery('#display_unit').hide();
      } else{
        jQuery('#display_unit').text(Gauge.Dizmo.load('unit'));
      }

      if (!Gauge.Dizmo.load('maxval')){
        jQuery('#display_maxval').text(100);
      }else{
        jQuery('#display_maxval').text(Gauge.Dizmo.load('maxval'));
        jQuery('#maximum_value_inputfield').val(Gauge.Dizmo.load('maxval'));
      }

      if (!Gauge.Dizmo.load('minval')){
        jQuery('#display_minval').text(0);
      }else{
        jQuery('#display_minval').text(Gauge.Dizmo.load('minval'));
        jQuery('#minimum_value_inputfield').val(Gauge.Dizmo.load('minval'));
      }

      jQuery('#target_value_inputfield').val(Gauge.Dizmo.load('targetval'));
      jQuery('#target_textfield').val(Gauge.Dizmo.load('targetval'));
      jQuery('#target_range_inputfield').val(Gauge.Dizmo.load('targetrange'));

      if (!Gauge.Dizmo.load('targetval')) {
        // jQuery('.t_label').hide();
        jQuery('.targetInput').hide();
        jQuery('#target_textfield').hide();
        jQuery('#display-unit').css('margin-right', 'auto');
        jQuery('#display-unit').css('margin-left', 'auto');
      }else{
        // jQuery('.t_label').show();
        jQuery('.targetInput').show();
        jQuery('#target_textfield').show();
      }

      jQuery('#unit_inputfield').val(Gauge.Dizmo.load('unit'));
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
        } else {
          dizmo.privateStorage.deleteProperty("unit");
          jQuery('#unit_inputfield').val("");
          jQuery('#display_unit').text("");
        }

        var maxval = jQuery('.maximum_value input').val();
        var minval = jQuery('.minimum_value input').val();
        if (maxval !== '') {
          minval = minval !== ''?minval:0;
          if(parseInt(minval) < parseInt(maxval)){
            self.setMaxval(maxval);
          }else{
            self.showDialog('Max value can not be less then min val','Error!','maximum_value');
          }
        }  else {
          dizmo.privateStorage.deleteProperty("maxval");
          jQuery('#maximum_value_inputfield').val("");
        }

        if (minval !== '') {
          if(parseInt(jQuery('.maximum_value input').val()) > parseInt(minval)){
            self.setMinval(minval);
          }else{
            self.showDialog('Min value can not be greater then max val','Error!','minimum_value');
          }
        }  else {
          dizmo.privateStorage.deleteProperty("minval");
          jQuery('#minimum_value_inputfield').val("");
        }

        var targetval = jQuery('.target_value input').val();
        if (targetval !== '') {
          if(parseInt(targetval) > parseInt(minval) && parseInt(targetval) < parseInt(maxval)){
            self.setTargetval(targetval);
          }else{
            self.showDialog('Target val should be in between max val and min val','Error!','target_value');
          }
        }  else {
          dizmo.privateStorage.deleteProperty("targetval");
          jQuery('#target_value_inputfield').val("");
        }

        //var targetaccuracy = DizmoElements('.accuracy-select').val();
        var targetrange = jQuery('.target_range input').val();
        if (targetrange !== '') {
          if(parseInt(targetrange) <= parseInt(targetval)){
            self.setRange(targetrange);
          }else{
            self.showDialog('Target range should be less then target val','Error!','target_range');
          }
        }else {
          dizmo.privateStorage.deleteProperty("targetrange");
          jQuery('#target_range_inputfield').val("");
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
      var range= Gauge.Dizmo.load('targetrange') ;
      var t_val= Gauge.Dizmo.load('targetval') ;
      Gauge.Dizmo.save('drawloop', 'loop');
      chart.loop();

      if (typeof(t_val)==='number'){
        if  (range===0) {
          //console.log('dyn');
          self.setDynamicBackgroundColor(stdout);
        }  else {
          //console.log('stat');
          self.setTargetRangeBackgroundColor(t_val, range, stdout);
        }
      }else {
        //console.log('dyn') ;
        self.setDynamicBackgroundColor(stdout);
      }

      Gauge.Dizmo.publish('stdout', stdout);
      if (!Gauge.Dizmo.load('targetval')){
        // jQuery('.t_label').hide();
        jQuery('.targetInput').hide();
        jQuery('#target_textfield').hide();
        jQuery('#display-unit').css('margin-right', 'auto');
        jQuery('#target_textfield').css('margin-left', 'auto');
      }else{
        // jQuery('.t_label').show();
        jQuery('.targetInput').show();
        jQuery('#target_textfield').show();
      }

      self.subscriptionId = dockedDizmo.publicStorage.subscribeToProperty( 'stdout', function(path, val, oldVal) {
        var stdout = val;
        //self.syncingTasks(stdout);
        self.syncValueText(stdout);
        var range= Gauge.Dizmo.load('targetrange') ;
        var t_val= Gauge.Dizmo.load('targetval') ;

        if (typeof(t_val)==='number'){
          if  (range===0) {
            //console.log('dyn');
            self.setDynamicBackgroundColor(stdout);
          }  else {
            //console.log('stat');
            self.setTargetRangeBackgroundColor(t_val, range, stdout);
          }
        }else {
          //console.log('dyn') ;
          self.setDynamicBackgroundColor(stdout);
        }
        Gauge.Dizmo.publish('stdout', stdout);
        if (!Gauge.Dizmo.load('targetval')){
          // jQuery('.t_label').hide();
          jQuery('.targetInput').hide();
          jQuery('#target_textfield').hide();
          jQuery('#display-unit').css('margin-right', 'auto');
          jQuery('#display-unit').css('margin-left', 'auto');
        }else{
          // jQuery('.t_label').show();
          jQuery('.targetInput').show();
          jQuery('#target_textfield').show();
        }
      });
    });

    // When ondocking, cancel the subcription and remove the the 'stdout' node of the own publicStorage
    dizmo.onUndock(function(undockedDizmo) {
      if (self.subscriptionId !== undefined) {
        dizmo.publicStorage.unsubscribeProperty(self.subscriptionId);
        //Gauge.Dizmo.unpublish('stdout');
        dizmo.publicStorage.deleteProperty('stdout');
        dizmo.setAttribute('settings/framecolor', '#ADC837');
        jQuery('#display_data').text('0');
        // jQuery('.t_label').hide();
        jQuery('.targetInput').hide();
        jQuery('#target_textfield').hide();
        try{
          dizmo.privateStorage.deleteProperty('drawloop');
          chart.noLoop();
        }catch (ex){
          console.error(ex);
        }
      }
    });


    //dizmoLive DD-2366
    function isDizmoSharingLive() {
      var remoteHostId = dizmo.getAttribute('connection/remoteHostId');
      var direction = dizmo.getAttribute('connection/direction');
      if(remoteHostId && direction){
        return true;
      }else {
        return false;
      }
    } //isDizmoSharingLive ends here

    dizmo.privateStorage.subscribeToProperty('maxval', function(path, newVal, oldval) {
      console.log('%c|--maxval udpated=>', 'color:orange');
      console.log('newVal', newVal);
      if(isDizmoSharingLive()){
        jQuery('#display_maxval').text(Gauge.Dizmo.load('maxval'));
        jQuery('#maximum_value_inputfield').val(Gauge.Dizmo.load('maxval'));
      }
    });

    dizmo.privateStorage.subscribeToProperty('minval', function(path, newVal, oldval) {
      console.log('%c|--minval udpated=>', 'color:orange');
      console.log('newVal', newVal);
      if(isDizmoSharingLive()){
        jQuery('#display_minval').text(Gauge.Dizmo.load('minval'));
        jQuery('#minimum_value_inputfield').val(Gauge.Dizmo.load('minval'));
      }
    });

    dizmo.privateStorage.subscribeToProperty('unit', function(path, newVal, oldval) {
      console.log('%c|--unit udpated=>', 'color:orange');
      console.log('newVal', newVal);
      if(isDizmoSharingLive()){
        jQuery('#display_unit').text(Gauge.Dizmo.load('unit'));
        jQuery('#unit_inputfield').val(Gauge.Dizmo.load('unit'));
      }
    });

    dizmo.privateStorage.subscribeToProperty('targetval', function(path, newVal, oldval) {
      console.log('%c|--targetval udpated=>', 'color:orange');
      console.log('newVal', newVal);
      if(isDizmoSharingLive()){
        jQuery('#target_textfield').val(Gauge.Dizmo.load('targetval'));
        jQuery('#target_value_inputfield').val(Gauge.Dizmo.load('targetval'));
      }
    });

    dizmo.privateStorage.subscribeToProperty('targetrange', function(path, newVal, oldval) {
      console.log('%c|--targetrange udpated=>', 'color:orange');
      console.log('newVal', newVal);
      if(isDizmoSharingLive()){
        jQuery('#target_range_inputfield').val(Gauge.Dizmo.load('targetrange'));
      }
    });
  },

  setUnit: function(unit) {
    var self = this;
    if (jQuery.type(unit) === 'string') {
      self.unit = unit;
      Gauge.Dizmo.save('unit', unit);
    }
    jQuery('#display_unit').text(Gauge.Dizmo.load('unit'));
    jQuery('#t_label').css('margin-left', '10');
    jQuery('#target_textfield').css('margin-right', '10');
    jQuery('#display_unit').show();
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

    jQuery('#display_maxval').text(Gauge.Dizmo.load('maxval'));
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

    jQuery('#display_minval').text(Gauge.Dizmo.load('minval'));
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

    jQuery('#target_textfield').val(Gauge.Dizmo.load('targetval'));
    // jQuery('.t_label').show();
    jQuery('.targetInput').show();
    jQuery('#target_textfield').show();
  },

  setRange: function(targetrange){
    var self = this;

    var int_targetrange = Math.abs(parseInt(targetrange));

    if (jQuery.type(int_targetrange) === 'number') {
      try {
        Gauge.Dizmo.save('targetrange', int_targetrange);
      } catch(ex) {
        console.error (ex);
      }
    }
  },

  syncValueText: function (value) {
    var format = function (float, ext) {
      var string = float.toString();
      var parts = string.split('.');
      if (parts.length > 1) {
        return parts[0] + '.' + parts[1].slice(0, ext);
      } else if (parts.length > 0) {
        return parts[0] + '.0';
      } else {
        return '0.0';
      }
    };

    if (jQuery.isNumeric(value)) {
      jQuery('#display_data').text(format(value, 1));
    } else {
      jQuery('#display_data').text('');
    }
    /*var nv=value;
    console.log(nv);
    jQuery('#display_data').text(nv); */
  },

  setDynamicBackgroundColor: function(value){
    var self = this;
    var frame_color, indicator_color, bar_color;
    var mincolor = '#ADC837';
    var maxcolor = '#EF3B45';

    //frame_color = Gauge.ColorMixer.mix(mincolor, maxcolor, 0, 100, value);
    //console.log('keine schlaufe mixermixer '+value);
    //var maxval = setMax();
    //var minval = setMin();

    var maxval;

    if (!Gauge.Dizmo.load('maxval')){
      maxval = 100;
    } else{
      maxval = Gauge.Dizmo.load('maxval');
    }

    var minval;

    if (!Gauge.Dizmo.load('minval')){
      minval = 0;
    } else{
      minval = Gauge.Dizmo.load('minval');
    }

    // set minimum and maximum color

    if (value >= maxval) {
      frame_color = maxcolor;
    } else if (value <= minval) {
      frame_color = mincolor;
    } else {
      frame_color = Gauge.ColorMixer.mix(mincolor, maxcolor, minval, maxval, value);
    }

    try{
      dizmo.setAttribute('settings/framecolor', frame_color);
    } catch (err){
      console.log(err);
    }

    Gauge.Dizmo.publish('stdout/framecolor', frame_color);
    console.log('frame_color ='+ frame_color);
    var target_textfield_background = Gauge.ColorMixer.lightenColor(frame_color, -60);
    jQuery('#target_textfield').css('background', Gauge.ColorMixer.lightenColor(frame_color, -60));
    console.log('target_textfield_background ='+ target_textfield_background);
  },

  setTargetRangeBackgroundColor: function(targetval, targetrange, value){
    var self = this;
    var onTargetColor = '#ADC837';
    var missedColor = '#F8AA41';
    var totalMissColor = '#EF3B45';
    var frame_color;

    if(targetval == value){
      frame_color = onTargetColor;
    } else if ((targetval+targetrange) > value && (targetval-targetrange)< value ){
      frame_color = missedColor;
    } else{
      frame_color = totalMissColor;
    }
    try{
      dizmo.setAttribute('settings/framecolor', frame_color);
    } catch (err){
      console.log(err);
    }

    Gauge.Dizmo.publish('stdout/framecolor', frame_color);
    var target_textfield_background = Gauge.ColorMixer.lightenColor(frame_color, -60);
    jQuery('#target_textfield').css('background', Gauge.ColorMixer.lightenColor(frame_color, -60));
    console.log('target_textfield_background ='+ target_textfield_background);
  },

  setMax: function(){
    var self = this;
    var maxval;

    if (!Gauge.Dizmo.load('maxval')){
      maxval = 100;
      return maxval;
    }
    else{
      maxval = Gauge.Dizmo.load('maxval');
      return maxval;
    }
  },

  setMin: function(){
    var self = this;
    var minval;

    if (!Gauge.Dizmo.load('minval')){
      minval = 0;
      return minval;
    }
    else{
      minval = Gauge.Dizmo.load('minval');
      return minval;
    }
  },

  syncingTasks: function(stdout){
    var self = this;
    self.syncValueText(stdout);
    self.setBackgroundColor(stdout);
    Gauge.Dizmo.publish('stdout', stdout);
  },

  showDialog: function(message, title, focusDivId) {
    DizmoElements('#frontInfoDialog').dnotify('info', {
      text: message,
      title: title,
      ok: function() {
        Gauge.Dizmo.showBack();
        jQuery('.'+focusDivId +' input').focus();
      } //ok function ends here
    });
  } //showDialog ends here

}
});
