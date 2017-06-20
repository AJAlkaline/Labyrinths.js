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
ctx.lineWidth = 2;

var mouseX = 0;
var mouseY = 0;
//ctx.fillRect(0,0,150,75);

var grid = new Array();

for(i=0; i<canvas.width; i++) {
	grid[i]= new Array();
	for(j=0; j<canvas.height; j++) {
		grid[i][j] = -1;
	}
}

var snakes = [];

var rcolorbase = Math.random();
var gcolorbase = Math.random();
var bcolorbase = Math.random();

snake = function(id, position) {
	this.id = id;
	this.points = [];
	this.points.push(position);
	grid[this.points[0].x][this.points[0].y] = this.id;
	this.deathCount = 5000;
	this.vel = Math.floor(Math.random()*4);
	this.rcolormod = 0.75 - 1.5*Math.random();
	this.gcolormod = 0.75 - 1.5*Math.random();
	this.bcolormod = 0.75 - 1.5*Math.random();
	this.getColor = function() {
	 return 'rgb(' + Math.floor(rcolorbase*255 + this.rcolormod*this.points.length/2) + 
			', ' + Math.floor(gcolorbase*255 + this.gcolormod*this.points.length/2) +
			', ' + Math.floor(bcolorbase*255 + this.bcolormod*this.points.length/2) + ')';
	}
}

makeSnakes = function(){
	for(i=0; i<100; i++) {
		var tpos = {x:Math.floor(Math.random()*canvas.width), y:Math.floor(Math.random()*canvas.height)};
		if(checkPoint(tpos, -1)) {
			snakes.push(new snake(snakes.length, tpos));
		}
	}
}

updateSnakes = function() {
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
				snakes[i].points.push(cpoint);
				grid[cpoint.x][cpoint.y] = snakes[i].id;
				break;
			}
			else {
				snakes[i].deathCount--;
			}
		}
		/* Branching snakes */
		if (snakes[i].deathCount > 0 && snakes[i].points.length > 3 && Math.random() < 0.0025
			&& snakes.length < 2000) {
			var tpos = snakes[i].points[snakes[i].points.length-1];
			snakes.push(new snake(snakes[i].id, tpos));
			snakes[snakes.length-1].points.unshift(snakes[i].points[snakes[i].points.length-2]);
			snakes[snakes.length-1].points.unshift(snakes[i].points[snakes[i].points.length-3]);
		}
		/* Die and have baby */
		if (snakes[i].deathCount < 1 && snakes[i].deathCount > -2 && snakes.length < 2000) {
			for(l=0; l<100; l++) {
				var tpos = {x:Math.floor(Math.random()*canvas.width), y:Math.floor(Math.random()*canvas.height)};
				if(checkPoint(tpos, -1)) {
					snakes.push(new snake(snakes.length, tpos));
					l=100;
				}
			}
			snakes[i].deathCount--;
		}
		/* Hang around for a bit after dead */
		if (snakes[i].deathCount < 0 && snakes[i].deathCount >= -800) {
			snakes[i].deathCount--;
		}
		/* Start to disappear */
		if (snakes[i].deathCount < -800 && snakes[i].points.length > 0) {
			var rpos = snakes[i].points.shift();
			grid[rpos.x][rpos.y] = -1;
		}
		/* All gone */
		if (snakes[i].points.length < 1 && snakes[i].deathCount < 0) {
			snakes.splice(i, 1);
		}
	}

}

checkPoint = function(point, sn) {
		if(point.x > canvas.width || point.y > canvas.height ||
			point.x < 0 || point.y < 0) {
			return false;
		}

		for(k=-1; k<2; k++) {
			for(r=-1; r<2; r++) {
				if(grid.length-1 < point.x+k || point.x+k < 0 ||
					grid[0].length-1 < point.y+r || point.y+r < 0) {
					return false;
				}
				else if (grid[point.x+k][point.y+r] &&
					grid[point.x+k][point.y+r] > -1) {
					if (sn != -1 && grid[point.x+k][point.y+r] == sn.id) {
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
	ctx.clearRect(0,0, canvas.width, canvas.height);
	for(i=0; i<snakes.length; i++) {
		if(snakes[i].points.length > 1) {
			ctx.beginPath();
			ctx.strokeStyle = snakes[i].getColor();
			ctx.moveTo(snakes[i].points[0].x*2, snakes[i].points[0].y*2);
		
			for(j=1; j<snakes[i].points.length; j++) {
				ctx.lineTo(snakes[i].points[j].x*2, snakes[i].points[j].y*2);
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
	console.log(snakes.length);
	window.requestAnimFrame(newFrame);
}

makeSnakes();

//setInterval(newFrame, 1000 / 60);

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

window.requestAnimFrame(newFrame);

window.addEventListener('mousemove', function(e){

	mouseX = e.clientX;
	mouseY = e.clientY;

})