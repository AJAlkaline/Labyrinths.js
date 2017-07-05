
/* -----------------------------------------------
/* Author : Alex Alleavitch
/* MIT license: http://opensource.org/licenses/MIT
/* Demo / Generator : alexalleavitch.com/labyrinths.js
/* GitHub : github.com/AJAlkaline/Labyrinths.js
/* How to use? : Check the GitHub README
/* v0.1.0
/* ----------------------------------------------- */

var lJS = function(tag_id, params) {
	
	var canvas_el = document.getElementById(tag_id);

  this.lJS = {
  	fn: {},
  	canvas: canvas_el,
  	mouseX: 0,
  	mouseY: 0,
  	snakesize: 2,
  	startingsnakes: 20,
  	dieoff: false,
  	dieoffrate: 500,
  	birthrate: 1,
  	maxsnakes: 20000,
  	grid: [],
  	snakes: [],
  	snakewindows: [],
  	windowguide: [],
  	guide: {
  		canvas: null,
  		offsetX: 0,
  		offsetY: 0,
  		rendwidth: 0,
  		rendheight: 0,
  		drawFunc: null
  	},
  	resize: true,
  	bgcolor: '#fff',
  	colorwidth: 800,
  	coloroffset: 0,
  	lastframe: 0
  }

	var lJS = this.lJS;

	/* params settings */
	if(params) {
		Object.deepExtend(lJS, params);
	}

	lJS.fn.canvasInit = function() {
		var body = document.body,
    html = document.documentElement;

		var height = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );

		lJS.canvas.width = window.innerWidth;
		lJS.canvas.height = height;

		lJS.mouseX = lJS.canvas.width/2;
		lJS.mouseY = lJS.canvas.height;

		if(lJS.canvas.width < 800) {
	    lJS.colorwidth = 800;
	    lJS.coloroffset = Math.floor(800/2 - lJS.canvas.width/2);
	  }
	  else {
	  	lJS.colorwidth = lJS.canvas.width;
	  }

		if(!lJS.ctx) {
			lJS.ctx = lJS.canvas.getContext("2d");
		}

		lJS.ctx.fillStyle = lJS.bgcolor;
	  lJS.ctx.fillRect(0,0, lJS.canvas.width, lJS.canvas.height);
	  lJS.ctx.lineWidth = lJS.snakesize;

	  lJS.fn.guideInit();
	  lJS.fn.gridInit();

	}

	lJS.fn.guideInit = function() {
		if(lJS.guide.canvas != null) {
	  	lJS.guide.canvas.width = Math.floor(lJS.canvas.width/lJS.snakesize);
			lJS.guide.canvas.height =  Math.floor(lJS.canvas.height/lJS.snakesize);
	  	lJS.guide.ctx = lJS.guide.canvas.getContext("2d");
	  	lJS.guide.ctx.clearRect(0,0, lJS.guide.canvas.width, lJS.guide.canvas.height);
	  	if(lJS.guide.drawFunc != null) {
	  		lJS.guide.drawFunc(lJS.guide);
	  	}
	  }
	}

	lJS.fn.snakeWindowsInit = function() {
	  if(lJS.windowguide.length > 0) {// Check for objects defining snakewindows from the params
				for(var i=0; i<lJS.windowguide.length; i++) {
					lJS.snakewindows.push(new lJS.fn.snakeWindow(lJS.windowguide.width, lJS.windowguide.height, 
																lJS.windowguide.mousefollow, lJS.windowguide.circle, lJS.windowguide.blurry));
				}
		}
		else { // default
			lJS.snakewindows.push(new lJS.fn.snakeWindow(250,250, true, true, true));
			lJS.snakewindows.push(new lJS.fn.snakeWindow(500,500, false, true, true));
			lJS.snakewindows.push(new lJS.fn.snakeWindow(500,500, false, true, true));
			lJS.snakewindows[1].x = Math.floor(lJS.canvas.width/2 - lJS.snakewindows[1].width/2);
			lJS.snakewindows[1].y = Math.floor(- lJS.snakewindows[1].width/2);
			lJS.snakewindows[2].x = Math.floor(lJS.canvas.width/2 - lJS.snakewindows[2].width/2);
			lJS.snakewindows[2].y = Math.floor(lJS.canvas.height - lJS.snakewindows[2].width/2);
		}
	}

	/* The grid is a 2D array [x][y] that keeps track of what spots are okay to move into.

			Its "resolution" is determined by the size of the snakes, so if the snakes are size 2,
			then each position on the grid actually represents 4 pixels on the canvas, etc.

			A value of -1 indicates an empty space, -2 indicates an obstacle drawn on the guidecanvas,
			if a snake is occupying that space its value will be the snake's id number */
	lJS.fn.gridInit = function() {
		for(var i=0; i<lJS.canvas.width/lJS.snakesize; i++) {
			lJS.grid[i]= [];
			for(var j=0; j<lJS.canvas.height/lJS.snakesize; j++) {
				if(lJS.fn.checkGuide(i,j)) {
					lJS.grid[i][j] = -2;
				}
				else {
					lJS.grid[i][j] = -1;
				}
			}
		}
	}

	/* If labyrinthsJS was passed a guide canvas as a param, it will line up the guide
		 canvas with the grid based on the offsets you give it and anywhere it finds a black
		 pixel it will mark that spot "forbidden" (-2)

		 IMPORTANT: it's assumed that the guide canvas has the resolution of the grid,
			NOT of the canvas the snakes are drawn onto */
	lJS.fn.checkGuide = function(x,y) {
		if(lJS.guide.canvas != null) {
			if(lJS.guide.offsetX <= x && x <= lJS.guide.offsetX + lJS.guide.rendwidth &&
				lJS.guide.offsetY <= y && y <= lJS.guide.offsetY + lJS.guide.rendheight) {
					var imgdata = lJS.guide.ctx.getImageData(x,y,1,1);
	        if(imgdata.data[0] + imgdata.data[1] + imgdata.data[2] == 0 
	        	&& imgdata.data[3] == 255) {
	      		return true;
        }
			}
		}
		return false;
	}
   
	/* Might not need this */ 
	lJS.fn.guideUpdate = function() {
    for(var i=0;i<lJS.grid.length;i++) {
      for(var j=0;j<lJS.grid[i].length;j++) {
      	if(lJS.fn.checkGuide(i,j)) {
        	lJS.grid[i][j] = -2;
        }
      }
    }
  }

	lJS.fn.snake = function(id, position) {
		this.id = id;
		this.points = [];
		this.points.push(position);
    lJS.grid[this.points[0].x][this.points[0].y] = this.id;
		this.deathCount = 1000;
		this.vel = Math.floor(Math.random()*4);
		this.rcolormod = 1 - 0.25*Math.random();
		this.gcolormod = 1 - 0.25*Math.random();
		this.bcolormod = 1 - 0.25*Math.random();
    this.colordefined = false;

    if(lJS.guide.canvas != null && 
    	lJS.guide.offsetX <= this.points[0].x && 
    	this.points[0].x <= lJS.guide.offsetX + lJS.guide.rendwidth &&
    	lJS.guide.offsetY <= this.points[0].y && 
    	this.points[0].y <= lJS.guide.offsetY + lJS.guide.rendheight) {
    	this.imgdata = lJS.guide.ctx.getImageData(this.points[0].x,
    																			      this.points[0].y, 1, 1);
    	if(this.imgdata.data[3] == 255) {
	      this.colordefined = true;
	    }
    }
		this.getColor = function() {
			if(!this.colordefined)
				return 'rgb(' + Math.floor(255*(this.points[0].y*lJS.snakesize/(lJS.canvas.height)) 
							+ 100*this.rcolormod) + 
					', ' + Math.floor(255*(this.points[0].x*lJS.snakesize/(lJS.colorwidth-lJS.coloroffset)) 
							+ 100*this.gcolormod) +
					', ' + Math.floor(255*((lJS.colorwidth-lJS.coloroffset)/lJS.colorwidth) 
							- 255*(this.points[0].x*lJS.snakesize/(lJS.colorwidth-lJS.coloroffset)) 
							+ 100*this.bcolormod) + ')';

			else {
				return 'rgb(' + this.imgdata.data[0] + ', ' + this.imgdata.data[1] + ', '	+ this.imgdata.data[2] + ')';	
			}
		}
	}


	lJS.fn.snakeWindow = function(width, height, mousefollow, circle, blurry) {
		this.x = 0;
		this.y = 0;
		this.width = width;
		this.height = height;
		this.mousefollow = mousefollow;
		this.circle = circle; // if the window is a circle, it'll treat width as the diameter
		this.blurry = blurry; // blurry edges makes the window a little less strict
		//this.kill = false; Possible future functionality
		this.updateSnakeWindow = function() {
			if(this.mousefollow) {
				this.x = Math.floor(lJS.mouseX - this.width/2);
				if(!this.circle) {
					this.y = Math.floor(lJS.mouseY - this.height/2);
				}
				else {
					this.y = Math.floor(lJS.mouseY - this.width/2);
				}
			}
		}
	}

	
	lJS.fn.makeSnakes = function(numsnakes){

		var makeSnake = function() {
			var randwindow = Math.floor(Math.random()*lJS.snakewindows.length);
			var snakewindow = lJS.snakewindows[randwindow];

			var tpos = {x:0,y:0};
			if(!snakewindow.circle) {
				tpos = {x:Math.floor(snakewindow.x/lJS.snakesize + Math.random()*snakewindow.width/lJS.snakesize), 
				y:Math.floor(snakewindow.y/lJS.snakesize + Math.random()*snakewindow.height/lJS.snakesize)};
			}
			else {
				tpos = {x:Math.floor(snakewindow.x/lJS.snakesize + Math.random()*snakewindow.width/lJS.snakesize), 
				y:Math.floor(snakewindow.y/lJS.snakesize + Math.random()*snakewindow.width/lJS.snakesize)};
			}
			if(lJS.fn.checkPoint(tpos)) {
				lJS.snakes.push(new lJS.fn.snake(lJS.snakes.length, tpos));
				return true;
			}
			else {
				return false;
			}
		}

		for(var i=0; i<numsnakes; i++) {
			for(var l=0; l<100; l++) {
        if(makeSnake()) {
          l=100;
        }
      }
		}
	}


	lJS.fn.updateSnakes = function() {
		if(lJS.snakes.length < lJS.maxsnakes && Math.random() < lJS.birthrate) {
			lJS.fn.makeSnakes(1);
		}

		for(var i=0; i<lJS.snakes.length; i++) {
			while(lJS.snakes[i].deathCount > 0) {
				var cpoint = {};
				cpoint.x = lJS.snakes[i].points[lJS.snakes[i].points.length-1].x;
				cpoint.y = lJS.snakes[i].points[lJS.snakes[i].points.length-1].y;
				var rand = Math.random()*30;
				if(rand < 0.25) {
					cpoint.x += 1;
					lJS.snakes[i].vel = 0;
				}
				else if(rand < 0.5) {
					cpoint.x -= 1;
					lJS.snakes[i].vel = 1;
				}
				else if(rand < 0.75) {
					cpoint.y += 1;
					lJS.snakes[i].vel = 2;
				}
				else if(rand < 1) {
					cpoint.y -= 1;
					lJS.snakes[i].vel = 3;
				}
				else {
					switch(lJS.snakes[i].vel) {
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

				if(lJS.fn.checkPoint(cpoint, lJS.snakes[i])) {
					if(lJS.snakes[i].points.length < 2 ||
						(cpoint.x != lJS.snakes[i].points[lJS.snakes[i].points.length-2].x != 
						lJS.snakes[i].points[lJS.snakes[i].points.length-1].x ||
					   cpoint.y != lJS.snakes[i].points[lJS.snakes[i].points.length-2].y !=
					   lJS.snakes[i].points[lJS.snakes[i].points.length-1].y)) {
						lJS.snakes[i].points.push(cpoint);
					}
					else {
						lJS.snakes[i].points[lJS.snakes[i].points.length-1] = cpoint;
					}
					lJS.grid[cpoint.x][cpoint.y] = lJS.snakes[i].id;
					break;
				}
				else {
					lJS.snakes[i].deathCount--;
				}
			}
			/* Branching snakes */
			if (lJS.snakes[i].deathCount > 0 && lJS.snakes[i].points.length > 3 && Math.random() < 0.0025
				&& lJS.snakes.length < lJS.maxsnakes) {
				var tpos = lJS.snakes[i].points[lJS.snakes[i].points.length-1];
				lJS.snakes.push(new lJS.fn.snake(lJS.snakes[i].id, tpos));
				lJS.snakes[lJS.snakes.length-1].points.unshift(lJS.snakes[i].points[lJS.snakes[i].points.length-2]);
				lJS.snakes[lJS.snakes.length-1].points.unshift(lJS.snakes[i].points[lJS.snakes[i].points.length-3]);
			}
			/* Die and have baby */
			if (lJS.snakes[i].deathCount < 1 && lJS.snakes[i].deathCount > -1 && (!lJS.dieoff || lJS.snakes.length < lJS.maxsnakes)) {
				if(Math.random()< lJS.birthrate) {
					lJS.fn.makeSnakes(1);
				}
				lJS.snakes[i].deathCount--;
			}
			/* Hang around for a bit after dead */
			if (lJS.snakes[i].deathCount < 0 && lJS.snakes[i].deathCount >= -lJS.dieoffrate*lJS.snakes[i].points.length*.1) {
				lJS.snakes[i].deathCount--;
			}
			/* Start to disappear */
			if (lJS.dieoff && 
				lJS.snakes[i].deathCount < -lJS.dieoffrate*lJS.snakes[i].points.length*.1 && lJS.snakes[i].points.length > 0) {
				var rpos = lJS.snakes[i].points.shift();
				lJS.grid[rpos.x][rpos.y] = -1;
			}
			/* All gone */
			if (lJS.snakes[i].points.length < 1 && lJS.snakes[i].deathCount < 0) {
				lJS.snakes.splice(i, 1);
			}
		}

	}

	lJS.fn.checkWindow = function(point, snwindow) {
		if(snwindow.circle) {
			if(( Math.pow((point.x - (snwindow.x+snwindow.width/2)/lJS.snakesize), 2) +
				Math.pow((point.y - (snwindow.y+snwindow.width/2)/lJS.snakesize), 2)
				>= Math.pow(snwindow.width/2/lJS.snakesize, 2)) &&
				(!snwindow.blurry || Math.random() > 0.2)) { 
				return false;
			}
		}
		else {
			if(( point.x > (snwindow.x + snwindow.width)/lJS.snakesize || 
				point.y > (snwindow.y + snwindow.height)/lJS.snakesize ||
				point.x < snwindow.x/lJS.snakesize || point.y < snwindow.y/lJS.snakesize) &&
				(!snwindow.blurry || Math.random() > 0.2)) {
				return false;
			}
		}

		return true;
	}

	lJS.fn.checkPoint = function(point, sn) {
			var pointinwindow = false;
			for(var h=0; h<lJS.snakewindows.length; h++) {
				if(lJS.fn.checkWindow(point, lJS.snakewindows[h])) {
					pointinwindow = true;
				}
			}
			if(!pointinwindow) {
				return false;
			}

			// Here it checks every point both adjacent and diagonal to the passed point
			for(var k=-1; k<2; k++) {
				for(var r=-1; r<2; r++) {
					if(lJS.grid.length-1 < point.x+k || point.x+k < 0 ||
						lJS.grid[0].length-1 < point.y+r || point.y+r < 0) { // Are they in the grid?
						return false;
					}
					else if (lJS.grid[point.x+k][point.y+r] != -1) { // Are they empty?
						if(sn && lJS.grid[point.x+k][point.y+r] == sn.id) {
							var lastpoint = sn.points[sn.points.length-1];						
							var slastpoint = sn.points[sn.points.length-2];						
							if((lastpoint.x == point.x+k && lastpoint.y == point.y+r) ||
								(slastpoint != null && slastpoint.x == point.x+k && slastpoint.y == point.y+r)) {
								// If not empty, but occupied by the last two points of the same snake
								// then we let it slide
							}
							else return false;
						}
						else return false;
					}
				}
			}
			return true;
		}


	lJS.fn.drawSnakes = function() {
		if(lJS.dieoff) { // We only need to clear the canvas each frame if snakes are dying
			lJS.ctx.clearRect(0,0, lJS.canvas.width, lJS.canvas.height);
		}
		for(var i=0; i<lJS.snakes.length; i++) {
			if(lJS.snakes[i].points.length > 0 && (lJS.dieoff || lJS.snakes[i].deathCount > -1)) {
				lJS.ctx.beginPath();
				lJS.ctx.strokeStyle = lJS.snakes[i].getColor();
			//	if(lJS.dieoff) {
					lJS.ctx.moveTo(lJS.snakes[i].points[0].x*lJS.snakesize, lJS.snakes[i].points[0].y*lJS.snakesize);
					for(var j=1; j<lJS.snakes[i].points.length; j++) {
						lJS.ctx.lineTo(lJS.snakes[i].points[j].x*lJS.snakesize, lJS.snakes[i].points[j].y*lJS.snakesize);
					}
				//}
				/*
				else {
					lJS.ctx.moveTo(lJS.snakes[i].points[lJS.snakes[i].points.length-2].x*lJS.snakesize, 
												 lJS.snakes[i].points[lJS.snakes[i].points.length-2].y*lJS.snakesize);
					lJS.ctx.lineTo(lJS.snakes[i].points[lJS.snakes[i].points.length-1].x*lJS.snakesize, 
												 lJS.snakes[i].points[lJS.snakes[i].points.length-1].y*lJS.snakesize);
				}*/

				lJS.ctx.stroke();
			}
		}
	}

	lJS.fn.updateSnakeWindows = function() {
		for(var h=0; h<lJS.snakewindows.length;h++) {
			lJS.snakewindows[h].updateSnakeWindow();
		}
	}

	lJS.fn.newFrame = function(timestamp) {
		lJS.fn.updateSnakes();

		if(lJS.lastframe != 0 && timestamp - lJS.lastframe > 1000/32) {
			lJS.fn.updateSnakes();
		}

		lJS.lastframe = timestamp;

		lJS.fn.drawSnakes();
		lJS.fn.updateSnakeWindows();

		lJS.requestid = window.requestAnimFrame(lJS.fn.newFrame);
	}


	lJS.fn.listenersInit = function() {
		var trackTouch = function(e) {
			lJS.mouseX = e.touches[0].clientX;
			lJS.mouseY = e.touches[0].clientY;
		}

		window.addEventListener('mousemove', function(e){
			lJS.mouseX = e.clientX;
			lJS.mouseY = e.clientY;
		});
		window.addEventListener('touchstart', trackTouch);
		window.addEventListener('touchmove', trackTouch);

		if(lJS.resize) {
	  	var actualResizeHandler = function() {
		  	console.log("resizeInit");
		  	lJS.snakes = [];
		    lJS.fn.canvasInit();
		    lJS.fn.snakeWindowsInit();
		    lJS.fn.updateSnakeWindows();
		    lJS.fn.makeSnakes(lJS.startingsnakes);
		    lJS.requestid = window.requestAnimFrame(lJS.fn.newFrame);
		  }

		  var resizeTimeout;
		  var resizeThrottler = function() {

		  	var body = document.body,
		    html = document.documentElement;

				var height = Math.max( body.scrollHeight, body.offsetHeight, 
		                       html.clientHeight, html.scrollHeight, html.offsetHeight );

		  	if(lJS.canvas.width != window.innerWidth || lJS.canvas.height != height) {

				  	if(lJS.requestid != null) {
				  		lJS.ctx.clearRect(0,0, lJS.canvas.width, lJS.canvas.height);
				  		window.cancelRequestAnimFrame(lJS.requestid);
				  		lJS.requestid = null;
				  	}
				    // wait until the user has stopped resizing to reinit
				    if(resizeTimeout) {
				    	clearTimeout(resizeTimeout);
				    	resizeTimeout = null;
				    }
				    if(!resizeTimeout) {
				      resizeTimeout = setTimeout(function() {
				        resizeTimeout = null;
				        actualResizeHandler();
				     
				       // The actualResizeHandler will execute at a rate of 15fps
				       }, 1000 / 5);
				    }
		  	}
		  }

		  window.addEventListener("resize", resizeThrottler, false);
	  }
	}

	lJS.fn.start = function() {
		lJS.fn.listenersInit();
		lJS.fn.canvasInit();
		lJS.fn.snakeWindowsInit();

    lJS.fn.updateSnakeWindows();
    lJS.fn.makeSnakes(lJS.startingsnakes);

    lJS.requestid = window.requestAnimFrame(lJS.fn.newFrame);
  }

  lJS.fn.start();
}

/* --- Global Functions - Vendor --- */

Object.deepExtend = function(destination, source) {
  for (var property in source) {
    if (source[property] && source[property].constructor &&
     source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

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


/* --- labyrinths.js - start --- */

window.lJSDom = [];

window.labyrinthsJS = function(tag_id, params) {
	/* if not string, assume params object passed first*/
	if(typeof(tag_id) != 'string') {
		params = tag_id;
		tag_id = 'labyrinths';
	}

	/* default id */
	if(!tag_id) {
		tag_id = 'labyrinths';
	}

	lJSDom.push(new lJS(tag_id, params));
}