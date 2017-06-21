
// Converts a #ffffff hex string into an [r,g,b] array
var h2r = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
};

// Inverse of the above
var r2h = function(rgb) {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
};

// Interpolates two [r,g,b] colors and returns an [r,g,b] of the result
// Taken from the awesome ROT.js roguelike dev library at
// https://github.com/ondras/rot.js
var _interpolateColor = function(color1, color2, factor) {
  if (arguments.length < 3) { factor = 0.5; }
  var result = color1.slice();
  for (var i=0;i<3;i++) {
    result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
  }
  return result;
};

var rgb2hsl = function(color) {
  var r = color[0]/255;
  var g = color[1]/255;
  var b = color[2]/255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
};

var hsl2rgb = function(color) {
  var l = color[2];

  if (color[1] == 0) {
    l = Math.round(l*255);
    return [l, l, l];
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var s = color[1];
    var q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
    var p = 2 * l - q;
    var r = hue2rgb(p, q, color[0] + 1/3);
    var g = hue2rgb(p, q, color[0]);
    var b = hue2rgb(p, q, color[0] - 1/3);
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
  }
};

var _interpolateHSL = function(color1, color2, factor) {
  if (arguments.length < 3) { factor = 0.5; }
  var hsl1 = rgb2hsl(color1);
  var hsl2 = rgb2hsl(color2);
  for (var i=0;i<3;i++) {
    hsl1[i] += factor*(hsl2[i]-hsl1[i]);
  }
  return hsl2rgb(hsl1);
};


/* -----------------------------------------------
/* Author : Vincent Garreau  - vincentgarreau.com
/* MIT license: http://opensource.org/licenses/MIT
/* Demo / Generator : vincentgarreau.com/particles.js
/* GitHub : github.com/VincentGarreau/particles.js
/* How to use? : Check the GitHub README
/* v2.0.0
/* ----------------------------------------------- */

var canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#000000";
ctx.strokeStyle = "#000000";

var mouseX = canvas.width/2;
var mouseY = canvas.height/2;
//ctx.fillRect(0,0,150,75);

var snakesize = 3;
var startingsnakes = 50;
var dieoff = true;
var dieoffrate = 50;
var maxsnakes = 5000;
var topsnakes = 0;

ctx.lineWidth = snakesize;

var grid = new Array();

for(i=0; i<canvas.width/snakesize; i++) {
	grid[i]= new Array();
	for(j=0; j<canvas.height/snakesize; j++) {
		grid[i][j] = -1;
	}
}

var snakes = [];

var rcolorbase = Math.random();
var gcolorbase = Math.random();
var bcolorbase = Math.random();

snake = function(id, position) {
	topsnakes = snakes.length;
	this.id = id;
	this.points = [];
	this.points.push(position);
	grid[this.points[0].x][this.points[0].y] = this.id;
	this.deathCount = 1000;
	this.vel = Math.floor(Math.random()*4);
	//this.rcolormod = 1 - 2*Math.random();
	//this.gcolormod = 1 - 2*Math.random();
	//this.bcolormod = 1 - 2*Math.random();
	this.getColor = function() {
	 return 'rgb(' + Math.floor(rcolorbase*255*(this.points[0].x*snakesize/canvas.width)) + 
			', ' + Math.floor(gcolorbase*255*(this.points[0].y*snakesize/canvas.height)) +
			', ' + Math.floor(bcolorbase*255*(this.points.length/200)) + ')';
	}
}


snakeWindow = function(width, height, mousefollow, circle, blurry, keepalive) {
	this.x = 0;
	this.y = 0;
	this.width = width;
	this.height = height;
	this.mousefollow = mousefollow;
	this.circle = circle; // if the window is a circle, it'll treat width as the diameter
	this.blurry = blurry; // blurry edges makes the window a little less strict
	this.keepalive = keepalive; // prevents snakes in window from dying
	this.updateSnakeWindow = function() {
		if(this.mousefollow) {
			this.x = Math.floor(mouseX - this.width/2);
			if(!circle) {
				this.y = Math.floor(mouseY - this.height/2);
			}
			else {
				this.y = Math.floor(mouseY - this.width/2);
			}
		}
	}
}

var snakewindow = new snakeWindow(Math.floor(canvas.width/3), Math.floor(canvas.height/3), true, true, true, false);

makeSnakes = function(numsnakes){
	for(i=0; i<numsnakes; i++) {
		if(!snakewindow.circle) {
			var tpos = {x:Math.floor(snakewindow.x/snakesize + Math.random()*snakewindow.width/snakesize), 
			y:Math.floor(snakewindow.y/snakesize + Math.random()*snakewindow.height/snakesize)};
		}
		else {
			var tpos = {x:Math.floor(snakewindow.x/snakesize + Math.random()*snakewindow.width/snakesize), 
			y:Math.floor(snakewindow.y/snakesize + Math.random()*snakewindow.width/snakesize)};
		}
		if(checkPoint(tpos, -1)) {
			console.log(tpos);
			snakes.push(new snake(snakes.length, tpos));
		}
	}
}

updateSnakes = function() {
	if(snakes.length < maxsnakes) {
		makeSnakes(1);
	}

	for(i=0; i<snakes.length; i++) {
		while(snakes[i].deathCount > 0) {
			var cpoint = {};
			cpoint.x = snakes[i].points[snakes[i].points.length-1].x;
			cpoint.y = snakes[i].points[snakes[i].points.length-1].y;
			var rand = Math.random()*30;
			if(rand < 0.25) {
				cpoint.x += 1;
				snakes[i].vel = 0;
			}
			else if(rand < 0.5) {
				cpoint.x -= 1;
				snakes[i].vel = 1;
			}
			else if(rand < 0.75) {
				cpoint.y += 1;
				snakes[i].vel = 2;
			}
			else if(rand < 1) {
				cpoint.y -= 1;
				snakes[i].vel = 3;
			}
			else {
				switch(snakes[i].vel) {
					case 0: cpoint.x += 1;
					break;
					case 1: cpoint.x -= 1;
					break;
					case 2: cpoint.y += 1;
					break;
					case 3: cpoint.y -= 1;
					break;
				}
			}
			/*
			else if(rand < 29) {
				if(mouseX > cpoint.x) {
					cpoint.x += 1;
				}
				else if(mouseX < cpoint.x) {
					cpoint.x -= 1;
				}
			}
			else {
				if(mouseY > cpoint.y) {
					cpoint.y += 1;
				}
				else if(mouseY < cpoint.y) {
					cpoint.y -= 1;
				}
			}*/

			if(checkPoint(cpoint, snakes[i])) {
				if(snakes[i].points.length < 2 ||
					(cpoint.x != snakes[i].points[snakes[i].points.length-2].x != 
					snakes[i].points[snakes[i].points.length-1].x ||
				   cpoint.y != snakes[i].points[snakes[i].points.length-2].y !=
				   snakes[i].points[snakes[i].points.length-1].y)) {
					snakes[i].points.push(cpoint);
				}
				else {
					snakes[i].points[snakes[i].points.length-1] = cpoint;
				}
				grid[cpoint.x][cpoint.y] = snakes[i].id;
				break;
			}
			else {
				snakes[i].deathCount--;
			}
		}
		/* Branching snakes */
		if (snakes[i].deathCount > 0 && snakes[i].points.length > 3 && Math.random() < 0.0025
			&& snakes.length < maxsnakes) {
			var tpos = snakes[i].points[snakes[i].points.length-1];
			snakes.push(new snake(snakes[i].id, tpos));
			snakes[snakes.length-1].points.unshift(snakes[i].points[snakes[i].points.length-2]);
			snakes[snakes.length-1].points.unshift(snakes[i].points[snakes[i].points.length-3]);
		}
		/* Die and have baby */
		if (snakes[i].deathCount < 1 && snakes[i].deathCount > -1 && (!dieoff || snakes.length < maxsnakes)) {
			for(l=0; l<50; l++) {
				if(!snakewindow.circle) {
					var tpos = {x:Math.floor(snakewindow.x/snakesize + Math.random()*snakewindow.width/snakesize), 
					y:Math.floor(snakewindow.y/snakesize + Math.random()*snakewindow.height/snakesize)};
				}
				else {
					var tpos = {x:Math.floor(snakewindow.x/snakesize + Math.random()*snakewindow.width/snakesize), 
					y:Math.floor(snakewindow.y/snakesize + Math.random()*snakewindow.width/snakesize)};
				}
				if(checkPoint(tpos, -1)) {
					snakes.push(new snake(snakes.length, tpos));
					l=50;
				}
			}
			snakes[i].deathCount--;
		}
		/* Hang around for a bit after dead */
		if ((!snakewindow.keepalive || !checkPoint(snakes[i].points[snakes[i].points.length-1], snakes[i], true)) && 
			snakes[i].deathCount < 0 && snakes[i].deathCount >= -dieoffrate*snakes[i].points.length*.1) {
			snakes[i].deathCount--;
		}
		/* Start to disappear */
		if (dieoff && 
			(!snakewindow.keepalive || !checkPoint(snakes[i].points[snakes[i].points.length-1], snakes[i], true)) && 
			snakes[i].deathCount < -dieoffrate*snakes[i].points.length*.1 && snakes[i].points.length > 0) {
			var rpos = snakes[i].points.shift();
			grid[rpos.x][rpos.y] = -1;
		}
		/* All gone */
		if (snakes[i].points.length < 1 && snakes[i].deathCount < 0) {
			snakes.splice(i, 1);
		}
	}

}

checkPoint = function(point, sn, keepalive) {
		if(snakewindow.circle) {
			if(( Math.pow((point.x - (snakewindow.x+snakewindow.width/2)/snakesize), 2) +
				Math.pow((point.y - (snakewindow.y+snakewindow.width/2)/snakesize), 2)
				>= Math.pow(snakewindow.width/2/snakesize, 2)) &&
				(keepalive || !snakewindow.blurry || Math.random() > 0.25)) {
				return false;
			}
		}
		else {
			if(( point.x > (snakewindow.x + snakewindow.width)/snakesize || 
				point.y > (snakewindow.y + snakewindow.height)/snakesize ||
				point.x < snakewindow.x/snakesize || point.y < snakewindow.y/snakesize) &&
				(keepalive || !snakewindow.blurry || Math.random() > 0.25)) {
				return false;
			}
		}

		for(k=-1; k<2; k++) {
			for(r=-1; r<2; r++) {
				if(grid.length-1 < point.x+k || point.x+k < 0 ||
					grid[0].length-1 < point.y+r || point.y+r < 0) {
					return false;
				}
				else if (
					grid[point.x+k][point.y+r] > -1) {
					if (sn.id != -1 && grid[point.x+k][point.y+r] == sn.id) {
						var lastpoint = sn.points[sn.points.length-1];
						var slastpoint = sn.points[sn.points.length-2];
						if((lastpoint.x == point.x+k && lastpoint.y == point.y+r) ||
							(slastpoint != null && slastpoint.x == point.x+k && slastpoint.y == point.y+r)) {

						}
						else return false;
					}
					else return false;
				}
			}
		}

/*
		for(k=0; k<snakes.length; k++) {
			for(j=0; j<snakes[k].points.length; j++) {
				if(Math.abs(snakes[k].points[j].y - point.y) < 2 &&
				   Math.abs(snakes[k].points[j].x - point.x) < 2) {
				   	if(k != sn || snakes[k].points.length - j > 2) {
						return false;
					}
				}
			}
		}
		*/

		return true;
	}


drawSnakes = function() {
	if(dieoff) {
		ctx.clearRect(0,0, canvas.width, canvas.height);
	}
	for(i=0; i<snakes.length; i++) {
		if(snakes[i].points.length > 0 && (dieoff || snakes[i].deathCount > -1)) {
			ctx.beginPath();
			ctx.strokeStyle = snakes[i].getColor();
			ctx.moveTo(snakes[i].points[0].x*snakesize, snakes[i].points[0].y*snakesize);
		
			for(j=1; j<snakes[i].points.length; j++) {
				if(j == snakes[i].points.length-1 || 
					(snakes[i].points[j-1].x != snakes[i].points[j+1].x &&
					snakes[i].points[j-1].y != snakes[i].points[j+1].y))
				ctx.lineTo(snakes[i].points[j].x*snakesize, snakes[i].points[j].y*snakesize);
			}

			/*ctx.moveTo(snakes[i].points[snakes[i].points.length-2].x*5, 
						snakes[i].points[snakes[i].points.length-2].y*5);
			ctx.lineTo(snakes[i].points[snakes[i].points.length-1].x*5, 
						snakes[i].points[snakes[i].points.length-1].y*5);*/
			ctx.stroke();
		}
	}
}

newFrame = function() {
	updateSnakes();
	drawSnakes();
	snakewindow.updateSnakeWindow();
	console.log(snakes.length);
	window.requestAnimFrame(newFrame);
}

window.addEventListener('mousemove', function(e){

	mouseX = e.clientX;
	mouseY = e.clientY;

})

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
      window.setTimeout(callback, 1000 / 60);
    };
})();

window.cancelRequestAnimFrame = ( function() {
  return window.cancelAnimationFrame         ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame    ||
    window.oCancelRequestAnimationFrame      ||
    window.msCancelRequestAnimationFrame     ||
    clearTimeout
} )();

snakewindow.updateSnakeWindow();
makeSnakes(startingsnakes);

window.requestAnimFrame(newFrame);

