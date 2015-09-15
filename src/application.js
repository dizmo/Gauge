//= require Main

/*
 Generally you do not need to edit this file. You can start writing
 your code in the provided "Main" class.
 */

// Needed for the dizmo menu to work
function showBack() {
    dizmo.showBack();
}

// Needed for the dizmo menu to work
function showFront() {
    dizmo.showFront();
}

// Helper object to attach all the events to
var events = {};

// As soon as the dom is loaded, and the dizmo is ready, instantiate the main class
window.document.addEventListener('dizmoready', function() {
    new Gauge.Main();

});

/* Draw the bar speedometer

*/


var chart = function( s ) {
    var bar_w, barcolor, maxval, minval, val, fcolor,
        range_w, targetrange_diff, targetrange_start, targetrange_w;

    var canv_w = 300;
    var canv_h = 80;
    var bar_h = 70;

    s.setup = function() {
        s.createCanvas(canv_w, canv_h);
        //img = s.loadImage("assets/shadow.jpg");
    };

    s.draw = function() {
        // img.position(0, 0);

        if (!Gauge.Dizmo.load('maxval')){
            maxval = 100;
        }else{
            maxval = Gauge.Dizmo.load('maxval');
        }

        if (!Gauge.Dizmo.load('minval')){
            minval = 0;
        }else{
            minval = Gauge.Dizmo.load('minval');
        }

        if (!dizmo.publicStorage.getProperty('stdout')){
            fcolor = '#ADC837';
        }  else{
            fcolor = dizmo.publicStorage.getProperty('stdout/framecolor');
        }

        val =  dizmo.publicStorage.getProperty('stdout');

        var targetval =  Gauge.Dizmo.load('targetval');
        var targetrange =  Gauge.Dizmo.load('targetrange');
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
};

var chart = new p5(chart, 'chart');
