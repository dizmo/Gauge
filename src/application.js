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

var fcolor
var subscriptionFrameColor = dizmo.publicStorage.subscribeToProperty('stdout/framecolor', function(path, val, oldVal) {
 var stdout = val;
 if (stdout ===undefined){
     fcolor = '#ededed';
 }  else{
     fcolor = dizmo.publicStorage.getProperty('stdout/framecolor');
 }
 });

// As soon as the dom is loaded, and the dizmo is ready, instantiate the main class
window.document.addEventListener('dizmoready', function() {
    new Gauge.Main();

});

/* Draw the speedometer

 */

var chart = function( s ) {
    var bar_w, barcolor, maxval, minval,
        target_diff_w, value, targetaccuracy_diff;

    var canv_w = 300;
    var canv_h = 80;
    var bar_h = 70;

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
    checkonconsole= target_w+target_w;

    if (targetaccuracy === undefined){
        targetaccuracy_diff = 0;
    }  else{
        targetaccuracy_diff = (targetval-((targetaccuracy*targetval)/100) * canv_w/(maxval-minval));
    }
    console.log('targetaccuracy_diff='+targetaccuracy_diff)
    if (targetaccuracy_diff + target_w >= canv_w){
        checkonconsole= target_w+targetaccuracy_diff;

        console.log('target_w+targetaccuracy_diff)='+checkonconsole);
        target_diff_w = canv_w -target_w +targetaccuracy_diff - 1;
        console.log('target_diff_w ='+ target_diff_w)
    } else{
        target_diff_w = 2 *  targetaccuracy_diff;
    }

    if (fcolor ===undefined){
        fcolor = '#ededed';
    }  else{
        fcolor = dizmo.publicStorage.getProperty('stdout/framecolor');
    }

/*    subscriptionValue = dizmo.publicStorage.subscribeToProperty('stdout', function(path, val, oldVal) {
        value = val;
        if (value !==undefined){
            framecolor = dizmo.publicStorage.getProperty('stdout/framecolor');
        }  else{
            framecolor = '#ededed';
        }
    });*/


    if (value === undefined){
        bar_w  = canv_w;
    }else{
        bar_w = value * canv_w/(maxval-minval);
        if(typeof(targetval) ===  'number' && typeof(targetaccuracy) === 'number'){
            if(targetval === value){
                barcolor = '#91A63B';
            } else if ((targetval+targetaccuracy) > value && (targetval-targetaccuracy)< value ){
                barcolor = '#E7A035';
            } else{
                barcolor = (Gauge.ColorMixer.lightenColor(fcolor, 40));
            }

        }
    }


    s.setup = function() {
        s.createCanvas(canv_w, canv_h);
        //img = s.loadImage("assets/shadow.jpg");
    };

    s.draw = function() {
       // img.position(0, 0);
        s.background(fcolor);
        s.noStroke();
        s.fill(255,255,255, 35)
        s.rect(0, 9,canv_w, bar_h);

        s.noStroke();
        s.fill(255, 255, 255, 128);
        s.rect(0, 9,bar_w, bar_h);

        s.stroke('#fff');
        s.noFill();
        s.rect(target_w-targetaccuracy_diff, 9, target_diff_w, bar_h);

        /*if (value !=='' || value !== undefined){
            s.noStroke();
            s.fill(barcolor);
            s.rect(0, 10,bar_w, bar_h);
        }

        if (typeof(targetval) ===  'number' && typeof(targetaccuracy) === 'number'){
            s.Stroke(0,0,0,0);
            //s.fill(barcolor);
            s.rect(90, 10,bar_w-30, bar_h);
        }*/

    };
};

var chart = new p5(chart, 'chart');