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
    s.setup = function() {
        s.createCanvas(300, 160);
        s.noStroke();
    };

    s.draw = function() {
        //s.ellipse(160, 160, 80, 80);
       // star(50, 50);
        var value = dizmo.publicStorage.getProperty('stdout');
        var value_distance = (Gauge.Dizmo.load('maxval'))-(Gauge.Dizmo.load('minval'))
        var framecolor = dizmo.publicStorage.getProperty('stdout/framecolor');
        var indicatorcolor, indicator_width;
        if (value==='' || value=== undefined){
            s.noStroke();
            s.fill('#d9d9d9');
            s.rect(0, 120,300, 40);
        }else{
            indicator_width = value * 300/value_distance
            indicatorcolor = Gauge.ColorMixer.lightenColor(framecolor, 40);
            s.noStroke();
            s.fill(indicatorcolor);
            s.rect(0, 120,300, indicator_width);
        }


    };
    function indicator(value) {
        // Draw bar indicator

        var indicator_color = dizmo.publicStorage.getProperty('stdout/indicatorcolor')

        s.translate(x, y); // Sets origin to center of the star
        s.rotate(s.frameCount / 200); // Rotates the star

        var angle = (Math.PI * 2) / 5;
        var halfAngle = angle/2.0;
        s.beginShape();
        for (var a = 0; a < Math.PI * 2; a += angle) {
            var sx = s.cos(a) * 50;
            var sy = s.sin(a) * 50;
            s.vertex(sx, sy);
            sx = s.cos(a+halfAngle) * 30;
            sy = s.sin(a+halfAngle) * 30;
            s.vertex(sx, sy);
        }
        s.endShape(s.CLOSE);
    }

};

var one = new p5(chart, 'chart');

/*
var ex2 = function( s ) {

    var opacity = 200;
    var step = 3;
    var round = 0;
    // Opacity, step, and round are used to
    // make the star blink

    s.setup = function() {
        s.createCanvas(640, 480);
    }

    s.draw = function() {
        s.stroke(0, 0, 0, 0);
        s.background(30, 144, 255);

        // Increases/decreases opacity
        // appropriately
        if ( round % 2 == 0 )
            opacity += step;
        else
            opacity -= step;
        if ( opacity >= 255 || opacity <= 200 )
            round++;

        s.fill(255, opacity); // Change fill through (rgb, a)

        star(s.mouseX, s.mouseY); // Follow the mouse
    }

    function star(x, y) {
        // Modified p5 code to create
        // a 5-pointed star

        s.translate(x, y); // Sets origin to center of the star
        s.rotate(s.frameCount / 200); // Rotates the star

        var angle = (Math.PI * 2) / 5;
        var halfAngle = angle/2.0;
        s.beginShape();
        for (var a = 0; a < Math.PI * 2; a += angle) {
            var sx = s.cos(a) * 50;
            var sy = s.sin(a) * 50;
            s.vertex(sx, sy);
            sx = s.cos(a+halfAngle) * 30;
            sy = s.sin(a+halfAngle) * 30;
            s.vertex(sx, sy);
        }
        s.endShape(s.CLOSE);
    }
}

var ex2 = new p5(ex2, 'ex2');
*/
