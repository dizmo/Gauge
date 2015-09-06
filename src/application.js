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
/*var val, fcolor;

var  subscriptionValue = dizmo.publicStorage.subscribeToProperty('stdout', function(path, val, oldVal) {
    val = val;
    console.log(val);
    if (val ===undefined){
        fcolor = '#ededed';
    }  else{
        fcolor = dizmo.publicStorage.getProperty('stdout/framecolor');
    }
});*/

// As soon as the dom is loaded, and the dizmo is ready, instantiate the main class
window.document.addEventListener('dizmoready', function() {
    new Gauge.Main();

});

/* Draw the bar speedometer

 */

var chart = function( s ) {
    var bar_w, barcolor, maxval, minval, val, fcolor,
        target_diff_w, targetaccuracy_diff;

    var canv_w = 300;
    var canv_h = 80;
    var bar_h = 70;

    s.setup = function() {
        s.createCanvas(canv_w, canv_h);
        //img = s.loadImage("assets/shadow.jpg");
    };

    s.draw = function() {
        // img.position(0, 0);

        if (Gauge.Dizmo.load('maxval')=== undefined){
            maxval = 100;
        }else{
            maxval = Gauge.Dizmo.load('maxval');
        }

        if (Gauge.Dizmo.load('minval')=== undefined){
            minval = 0;
        }else{
            minval = Gauge.Dizmo.load('minval');
        }

        var targetval =  Gauge.Dizmo.load('targetval');
        var targetaccuracy =  Gauge.Dizmo.load('targetaccuracy');
        var target_w = targetval * canv_w/(maxval-minval);

        if (targetaccuracy === undefined){
            targetaccuracy_diff = 0;
        }  else{
            targetaccuracy_diff = (targetval-((targetaccuracy*targetval)/100) * canv_w/(maxval-minval));
        }
        console.log('targetaccuracy_diff='+targetaccuracy_diff);
        if (targetaccuracy_diff + target_w >= canv_w){
            target_diff_w = canv_w -target_w +targetaccuracy_diff - 1;
            console.log('target_diff_w ='+ target_diff_w);
        } else{
            target_diff_w = 2 *  targetaccuracy_diff;
        }

        if (dizmo.publicStorage.getProperty('stdout') ===undefined){
            fcolor = '#ededed';
        }  else{
            fcolor = dizmo.publicStorage.getProperty('stdout/framecolor');
        }

        val =  dizmo.publicStorage.getProperty('stdout');

        bar_w = val * canv_w/(maxval-minval);
        console.log('bar_w='+ bar_w);

        s.background(fcolor);
        s.noStroke();
        s.fill(255,255,255, 32);
        s.rect(0, 9,canv_w, bar_h);

        s.noStroke();
        s.fill(255, 255, 255, 127);
        s.rect(0, 9,bar_w, bar_h);

        if (typeof(targetval) ===  'number' && typeof(targetaccuracy) === 'number'){
            s.stroke('#fff');
            s.noFill();
            s.rect(target_w-targetaccuracy_diff, 9, target_diff_w, bar_h);
        }

    };
};

var chart = new p5(chart, 'chart');