window.showBack = function () {
  dizmo.showBack();
};
window.showFront = function () {
  dizmo.showFront();
};

// window.i18n(function (err, t) {
//   var cell = document.getElementsByClassName('table-cell')[0];
//   cell.textContent = t('greeting');
//   var done = document.getElementById('done');
//   done.textContent = t('done');
// });

document.addEventListener('dizmoready', function () {
  dizmo.canDock(true);
  dizmo.setAttribute('settings/usercontrols/allowresize', false);
  dizmo.setAttribute('settings/framecolor', '#ADC837');

  var chart = function( s ) {
    var bar_w, barcolor, maxval, minval, val, fcolor,range_w, targetrange_diff, targetrange_start, targetrange_w;
    var events = {};

    var canv_w = 300;
    var canv_h = 80;
    var bar_h = 70;

    s.setup = function() {
      s.createCanvas(canv_w, canv_h);
      //img = s.loadImage("assets/shadow.jpg");
    };

    s.draw = function() {
      // img.position(0, 0);

      if (!dizmo.privateStorage.getProperty('maxval')){
        maxval = 100;
      }else{
        maxval = dizmo.privateStorage.getProperty('maxval');
      }

      if (!dizmo.privateStorage.getProperty('minval')){
        minval = 0;
      }else{
        minval = dizmo.privateStorage.getProperty('minval');
      }

      if (!dizmo.publicStorage.getProperty('stdout')){
        fcolor = '#ADC837';
      }  else{
        fcolor = dizmo.publicStorage.getProperty('stdout/framecolor');
      }

      val =  dizmo.publicStorage.getProperty('stdout');

      var targetval =  dizmo.privateStorage.getProperty('targetval');
      var targetrange =  dizmo.privateStorage.getProperty('targetrange');
      //console.log('targetrange='+targetrange);
      var target_w = targetval * canv_w/(maxval-minval);

      bar_w = val * canv_w/(maxval-minval);
      //console.log('bar_w='+ bar_w);

      if (!targetrange){
        range_w = 0;
      }  else{
        targetrange_start = (targetval - targetrange) * canv_w/(maxval-minval);
        //console.log('targetval, targetrange = '+(targetval) +' '+targetrange);
        //console.log('targetrange_diff = '+(targetrange_diff));
        range_w = 2* targetrange * canv_w/(maxval-minval);
      }


      if ((range_w/2) + target_w < canv_w){
        targetrange_w = range_w;
      } else{
        //targetrange_w = (targetval+(2*targetrange)-maxval)* canv_w/(maxval-minval);
        targetrange_w = canv_w -target_w + (range_w/2) - 1;
      }

      s.background(fcolor);
      s.noStroke();
      s.fill(255,255,255, 32);
      s.rect(0, 9,canv_w, bar_h);

      s.noStroke();
      s.fill(255, 255, 255, 127);
      s.rect(0, 9,bar_w, bar_h);

      if (val){
        if (typeof(targetval) ===  'number' && typeof(targetrange) === 'number'){
          s.stroke('#fff');
          s.noFill();
          s.rect(targetrange_start, 9, targetrange_w, bar_h);
        }
      }

    };
    if (!dizmo.privateStorage.getProperty('drawloop'))  {
      s.noLoop();
    }
  };

  var chart = new p5(chart, 'chart');


  function mix(mincolor, maxcolor, minval, maxval, value) {
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
  }

  function lightenColor(color, amount){
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

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);

  }

  dizmo.onShowBack(function() {
    dizmo.setSize(320,330);
    jQuery("#front").hide();
    jQuery("#back").show();
    // jQuery(events).trigger('dizmo.turned', ['back']);
    dizmo.showBack();
    DizmoElements('.accuracy-select').dselectbox('update');
  });

  dizmo.onShowFront(function() {
    dizmo.setSize(320,250);
    jQuery("#back").hide();
    jQuery("#front").show();
    dizmo.showFront();
    // jQuery(events).trigger('dizmo.turned', ['front']);
  });

  // Subscribe to height changes of the dizmo
  dizmo.subscribeToAttribute('geometry/height', function(path, val, oldVal) {
    dizmo.setSize(dizmo.getWidth(), dizmo.getHeight());
    // jQuery(events).trigger('dizmo.resized', [dizmo.getWidth(), dizmo.getHeight()]);
  });

  // Subscribe to width changes of the dizmo
  dizmo.subscribeToAttribute('geometry/width', function(path, val, oldVal) {
    dizmo.setSize(dizmo.getWidth(), dizmo.getHeight());
    // jQuery(events).trigger('dizmo.resized', [dizmo.getWidth(), dizmo.getHeight()]);
  });

  // Subscribe to displayMode changes
  viewer.subscribeToAttribute('settings/displaymode', function(path, val, oldVal) {
    if (val === 'presentation') {
      dizmo.setAttribute('state/framehidden', true);
    } else {
      dizmo.setAttribute('state/framehidden', false);
    }

    jQuery(events).trigger('dizmo.onmodechanged', [val]);
  });

  if (!dizmo.privateStorage.getProperty('unit')){
    jQuery('#display_unit').hide();
  } else{
    jQuery('#display_unit').text(dizmo.privateStorage.getProperty('unit'));
  }

  if (!dizmo.privateStorage.getProperty('maxval')){
    jQuery('#display_maxval').text(100);
  }else{
    jQuery('#display_maxval').text(dizmo.privateStorage.getProperty('maxval'));
    jQuery('#maximum_value_inputfield').val(dizmo.privateStorage.getProperty('maxval'));
  }

  if (!dizmo.privateStorage.getProperty('minval')){
    jQuery('#display_minval').text(0);
  }else{
    jQuery('#display_minval').text(dizmo.privateStorage.getProperty('minval'));
    jQuery('#minimum_value_inputfield').val(dizmo.privateStorage.getProperty('minval'));
  }

  jQuery('#target_value_inputfield').val(dizmo.privateStorage.getProperty('targetval'));
  jQuery('#target_textfield').val(dizmo.privateStorage.getProperty('targetval'));
  jQuery('#target_range_inputfield').val(dizmo.privateStorage.getProperty('targetrange'));

  if (!dizmo.privateStorage.getProperty('targetval')) {
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
  jQuery('#unit_inputfield').val(dizmo.privateStorage.getProperty('unit'));


jQuery('.done-btn').on('click', function() {
  var unitval = jQuery('.unit input').val();
  if (unitval !== '') {
    setUnit(unitval);
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
      setMaxval(maxval);
    }else{
      showDialog('Max value can not be less then min val','Error!','maximum_value');
    }
  }  else {
    dizmo.privateStorage.deleteProperty("maxval");
    jQuery('#maximum_value_inputfield').val("");
  }

  if (minval !== '') {
    if(parseInt(jQuery('.maximum_value input').val()) > parseInt(minval)){
      setMinval(minval);
    }else{
      showDialog('Min value can not be greater then max val','Error!','minimum_value');
    }
  }  else {
    dizmo.privateStorage.deleteProperty("minval");
    jQuery('#minimum_value_inputfield').val("");
  }

  var targetval = jQuery('.target_value input').val();
  if (targetval !== '') {
    if(parseInt(targetval) > parseInt(minval) && parseInt(targetval) < parseInt(maxval)){
      setTargetval(targetval);
    }else{
      showDialog('Target val should be in between max val and min val','Error!','target_value');
    }
  }  else {
    dizmo.privateStorage.deleteProperty("targetval");
    jQuery('#target_value_inputfield').val("");
  }

  //var targetaccuracy = DizmoElements('.accuracy-select').val();
  var targetrange = jQuery('.target_range input').val();
  if (targetrange !== '') {
    if(parseInt(targetrange) <= parseInt(targetval)){
      setRange(targetrange);
    }else{
      showDialog('Target range should be less then target val','Error!','target_range');
    }
  }else {
    dizmo.privateStorage.deleteProperty("targetrange");
    jQuery('#target_range_inputfield').val("");
  }

  // not the docked storage yet
  /*if (dizmo.publicStorage.getProperty('stdout') !== null){
  self.setBackgroundColor(dizmo.publicStorage.getProperty('stdout'));
}*/
dizmo.showFront();
});

// When docked, read the 'stdout' of the other docked dizmo, update the value,
// set the framecolor and write into the 'stdout' node of the own publicStorage.
dizmo.onDock(function(dockedDizmo) {
  var stdout = dockedDizmo.publicStorage.getProperty('stdout');
  //console.log(stdout);
  //self.syncingTasks(stdout);
  syncValueText(stdout);
  var range= dizmo.privateStorage.getProperty('targetrange') ;
  var t_val= dizmo.privateStorage.getProperty('targetval') ;
  dizmo.privateStorage.setProperty('drawloop', 'loop');
  chart.loop();

  if (typeof(t_val)==='number'){
    if  (range===0) {
      //console.log('dyn');
      setDynamicBackgroundColor(stdout);
    }  else {
      //console.log('stat');
      setTargetRangeBackgroundColor(t_val, range, stdout);
    }
  }else {
    //console.log('dyn') ;
    setDynamicBackgroundColor(stdout);
  }

  // Gauge.Dizmo.publish('stdout', stdout);


  if(stdout){
    dizmo.publicStorage.setProperty('stdout', stdout);
  }

  if (!dizmo.privateStorage.getProperty('targetval')){
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

  var subscriptionId = dockedDizmo.publicStorage.subscribeToProperty( 'stdout', function(path, val, oldVal) {
    var stdout = val;
    //self.syncingTasks(stdout);
    syncValueText(stdout);
    var range= dizmo.privateStorage.getProperty('targetrange') ;
    var t_val= dizmo.privateStorage.getProperty('targetval') ;

    if (typeof(t_val)==='number'){
      if  (range===0) {
        //console.log('dyn');
        setDynamicBackgroundColor(stdout);
      }  else {
        //console.log('stat');
        setTargetRangeBackgroundColor(t_val, range, stdout);
      }
    }else {
      //console.log('dyn') ;
      setDynamicBackgroundColor(stdout);
    }
    // Gauge.Dizmo.publish('stdout', stdout);
    dizmo.publicStorage.setProperty('stdout', stdout);
    if (!dizmo.privateStorage.getProperty('targetval')){
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
  if (subscriptionId !== undefined) {
    dizmo.publicStorage.unsubscribeProperty(subscriptionId);
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
  if(isDizmoSharingLive()){
    jQuery('#display_maxval').text(dizmo.privateStorage.getProperty('maxval'));
    jQuery('#maximum_value_inputfield').val(dizmo.privateStorage.getProperty('maxval'));
  }
});

dizmo.privateStorage.subscribeToProperty('minval', function(path, newVal, oldval) {
  if(isDizmoSharingLive()){
    jQuery('#display_minval').text(dizmo.privateStorage.getProperty('minval'));
    jQuery('#minimum_value_inputfield').val(dizmo.privateStorage.getProperty('minval'));
  }
});

dizmo.privateStorage.subscribeToProperty('unit', function(path, newVal, oldval) {
  if(isDizmoSharingLive()){
    jQuery('#display_unit').text(dizmo.privateStorage.getProperty('unit'));
    jQuery('#unit_inputfield').val(dizmo.privateStorage.getProperty('unit'));
  }
});

dizmo.privateStorage.subscribeToProperty('targetval', function(path, newVal, oldval) {
  if(isDizmoSharingLive()){
    jQuery('#target_textfield').val(dizmo.privateStorage.getProperty('targetval'));
    jQuery('#target_value_inputfield').val(dizmo.privateStorage.getProperty('targetval'));
  }
});

dizmo.privateStorage.subscribeToProperty('targetrange', function(path, newVal, oldval) {
  if(isDizmoSharingLive()){
    jQuery('#target_range_inputfield').val(dizmo.privateStorage.getProperty('targetrange'));
  }
});


function setUnit(unit) {
  // var self = this;
  if (jQuery.type(unit) === 'string') {
    // self.unit = unit;
    dizmo.privateStorage.setProperty('unit', unit);
  }
  jQuery('#display_unit').text(dizmo.privateStorage.getProperty('unit'));
  jQuery('#t_label').css('margin-left', '10');
  jQuery('#target_textfield').css('margin-right', '10');
  jQuery('#display_unit').show();
}

function setMaxval(maxval){
  // var self = this;
  var int_maxval = parseInt(maxval);
  if (jQuery.type(int_maxval) === 'number') {
    try {
      dizmo.privateStorage.setProperty('maxval', int_maxval);
    } catch(ex) {
      console.error (ex);
    }
  }

  jQuery('#display_maxval').text(dizmo.privateStorage.getProperty('maxval'));
}

function setMinval(minval){
  // var self = this;
  var int_minval = parseInt(minval);

  if (jQuery.type(int_minval) === 'number') {
    try {
      dizmo.privateStorage.setProperty('minval', int_minval);
    } catch(ex) {
      console.error (ex);
    }
  }

  jQuery('#display_minval').text(dizmo.privateStorage.getProperty('minval'));
}

function setTargetval(targetval){
  // var self = this;
  var int_targetval = parseInt(targetval);

  if (jQuery.type(int_targetval) === 'number') {
    try {
      dizmo.privateStorage.setProperty('targetval', int_targetval);
    } catch(ex) {
      console.error (ex);
    }
  }

  jQuery('#target_textfield').val(dizmo.privateStorage.getProperty('targetval'));
  // jQuery('.t_label').show();
  jQuery('.targetInput').show();
  jQuery('#target_textfield').show();
}

function setRange(targetrange){
  // var self = this;

  var int_targetrange = Math.abs(parseInt(targetrange));

  if (jQuery.type(int_targetrange) === 'number') {
    try {
      dizmo.privateStorage.setProperty('targetrange', int_targetrange);
    } catch(ex) {
      console.error (ex);
    }
  }
}

function syncValueText(value) {
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
}

function setDynamicBackgroundColor(value){
  // var self = this;
  var frame_color, indicator_color, bar_color;
  var mincolor = '#ADC837';
  var maxcolor = '#EF3B45';

  //frame_color = Gauge.ColorMixer.mix(mincolor, maxcolor, 0, 100, value);
  //console.log('keine schlaufe mixermixer '+value);
  //var maxval = setMax();
  //var minval = setMin();

  var maxval;

  if (!dizmo.privateStorage.getProperty('maxval')){
    maxval = 100;
  } else{
    maxval = dizmo.privateStorage.getProperty('maxval');
  }

  var minval;

  if (!dizmo.privateStorage.getProperty('minval')){
    minval = 0;
  } else{
    minval = dizmo.privateStorage.getProperty('minval');
  }

  // set minimum and maximum color

  if (value >= maxval) {
    frame_color = maxcolor;
  } else if (value <= minval) {
    frame_color = mincolor;
  } else {
    frame_color = mix(mincolor, maxcolor, minval, maxval, value);
  }

  try{
    dizmo.setAttribute('settings/framecolor', frame_color);
  } catch (err){
    console.log(err);
  }
  dizmo.publicStorage.setProperty('stdout/framecolor', frame_color);

  // Gauge.Dizmo.publish('stdout/framecolor', frame_color);
  // console.log('frame_color ='+ frame_color);
  var target_textfield_background = lightenColor(frame_color, -60);
  jQuery('#target_textfield').css('background',lightenColor(frame_color, -60));
  // console.log('target_textfield_background ='+ target_textfield_background);
}

function setTargetRangeBackgroundColor(targetval, targetrange, value){
  // var self = this;
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

  // Gauge.Dizmo.publish('stdout/framecolor', frame_color);
  dizmo.publicStorage.setProperty('stdout/framecolor', frame_color);
  var target_textfield_background = lightenColor(frame_color, -60);
  jQuery('#target_textfield').css('background',lightenColor(frame_color, -60));
  // console.log('target_textfield_background ='+ target_textfield_background);
}

function setMax(){
  // var self = this;
  var maxval;

  if (!dizmo.privateStorage.getProperty('maxval')){
    maxval = 100;
    return maxval;
  }
  else{
    maxval = dizmo.privateStorage.getProperty('maxval');
    return maxval;
  }
}

function setMin(){
  // var self = this;
  var minval;

  if (!dizmo.privateStorage.getProperty('minval')){
    minval = 0;
    return minval;
  }
  else{
    minval = dizmo.privateStorage.getProperty('minval');
    return minval;
  }
}

function syncingTasks(stdout){
  // var self = this;
  syncValueText(stdout);
  setBackgroundColor(stdout);
  // Gauge.Dizmo.publish('stdout', stdout);
  dizmo.publicStorage.setProperty('stdout', stdout);
}

function showDialog(message, title, focusDivId) {
  DizmoElements('#frontInfoDialog').dnotify('info', {
    text: message,
    title: title,
    ok: function() {
      dizmo.showBack();
      jQuery('.'+focusDivId +' input').focus();
    } //ok function ends here
  });
} //showDialog ends here

//
// document.getElementById('done').onclick = function () {
//   dizmo.showFront();
// };
});
