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

/* Draw the speedometer

 */

var chart = function( s ) {
    var bar_w, barcolor, maxval, minval, target_diff_w;
    var canv_w = 300;
    var canv_h = 80;
    var bar_h = 70;
    var value =  dizmo.publicStorage.getProperty('stdout');
    var framecolor = '#456789';//dizmo.publicStorage.getProperty('stdout/framecolor');

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
    var targetaccuracy_diff = (targetval-((targetaccuracy*targetval)/100) * canv_w/(maxval-minval));
    console.log('targetaccuracy_diff='+targetaccuracy_diff)
    if (targetaccuracy_diff + target_w >= canv_w){
        checkonconsole= target_w+targetaccuracy_diff;

        console.log('target_w+targetaccuracy_diff)='+checkonconsole);
        target_diff_w = canv_w -target_w +targetaccuracy_diff - 1;
        console.log('target_diff_w ='+ target_diff_w)
    } else{
        target_diff_w = 2 *  targetaccuracy_diff;
    }



    if (value === undefined){
        barcolor =  '#d9d9d9';
        bar_w  = canv_w;
    }else{
        bar_w = value * canv_w/(maxval-minval);
        if(typeof(targetval) ===  'number' && typeof(targetaccuracy) === 'number'){
            if(targetval === value){
                barcolor = '#91A63B';
            } else if ((targetval+targetaccuracy) > value && (targetval-targetaccuracy)< value ){
                barcolor = '#E7A035';
            } else{
                barcolor = (Gauge.ColorMixer.lightenColor(framecolor, 40));
            }

        }
    }

    s.setup = function() {
        s.createCanvas(canv_w, canv_h);
    };

    s.draw = function() {

        s.noStroke();
        s.fill(barcolor);
        s.rect(0, 9,bar_w, bar_h);

        s.stroke('#fff');
        s.noFill();
        s.rect(target_w-targetaccuracy_diff, 9, target_diff_w, bar_h);
        //console.log(target_w) ;
        //console.log(target_w-targetaccuracy_diff) ;
        //console.log(2*targetaccuracy_diff) ;

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

