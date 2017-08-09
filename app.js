var params = {
	bgcolor: '#FFF',
	guide: {
		canvas: null,
		offsetX: 0,
		offsetY: 0,
		rendwidth: 800,
		rendheight: 400,
		drawFunc: function(guide) { 
			guide.ctx.font = '900 100px Impact';
	    guide.ctx.strokeStyle = 'rgb(0,0,0)';

	    //guide.ctx.fillStyle = '#efefef';
	    guide.ctx.lineWidth = 6;
	    
	    guide.ctx.strokeText('LABYRINTHS', Math.floor(guide.canvas.width/2 - 
	    		Math.min(guide.ctx.measureText('LABYRINTHS').width/2, guide.canvas.width/2-2)), 
	    		120, guide.canvas.width-4);
	   /*guide.ctx.fillText('Alex', Math.floor(guide.canvas.width/2 - 
	    		Math.min(guide.ctx.measureText('Alex').width/2, guide.canvas.width/2-2)), 
	   			46, guide.canvas.width-4);*/
	    

	    guide.offsetX = Math.floor(guide.canvas.width/2 - 500/2);
		}
	}
};

window.labyrinthsJS('labyrinths', params);