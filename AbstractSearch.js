/**
 * Template class search - 8 Puzzle Problem (UNIFESP - PPGCC)
 * Teacher: Fabio Faria
 * Author:  Aline Rodrigues
 * Created: 2018-09-09
 **/

function AbstractSearch(){
	this.puzzle         = [];
	this.empty          = [0, 0]; // Current possition puzzle empty
	this.id             = '';     // Id search
	this.list_states    = [];     // States needs to be visit
	this.lines          = 0;      // Lines puzzle
	this.columns        = 0;      // Columns puzzle
	this.time           = '00:00:00';
	this.states_visited = [];
	this.limit_states   = 5000; // Limit states will be visit
	this.finished       = false;
	this.success        = false
	this.speed          = 500;
	this.stoped         = false;
}

/**
* Public methods
**/

AbstractSearch.prototype.createPuzzle = function(matrix) {
	this.puzzle  = [];
	position     = 0;
	this.lines   = matrix[0]-1;
	this.columns = matrix[1]-1;
	
	for (var i=0;i<=this.lines;i++){
		this.puzzle.push([]);
		for(var x=0;x<=this.columns;x++){
			this.puzzle[i].push({'current': position, 'expect': position});
			position += 1;
		}
	}
}

AbstractSearch.prototype.shufflePuzzles = function(suffle){
	var s = 0;
	for (var line in this.puzzle){
		for (var column in this.puzzle[line]){
			this.puzzle[line][column]['current'] = suffle[s];
			if (suffle[s] == 0){
				this.empty = [parseInt(line), parseInt(column)];
			}
			s += 1;
		}
	}
}

AbstractSearch.prototype.checkStateExpected = function(){
	for (var line in this.puzzle){
		for (var column in this.puzzle[line]){
			if (this.puzzle[line][column]['current'] != this.puzzle[line][column]['expect'])
				return false;
		}
	}
	return true;
}

AbstractSearch.prototype.getStateVector= function(new_empty){
	var state = [];
	for (var line in this.puzzle){
		for (var column in this.puzzle[line]){
			if (line == this.empty[0] && column == this.empty[1])
				state.push(this.puzzle[new_empty[0]][new_empty[1]]['current']);
			else if (line == new_empty[0] && column == new_empty[1])
				state.push(this.puzzle[this.empty[0]][this.empty[1]]['current']);
			else
				state.push(this.puzzle[line][column]['current'])
		}
	}
	return state;
}

AbstractSearch.prototype.clearSearch = function(){
	this.puzzle      = [];
	this.finished    = false;
	this.empty       = [0,0]; // Current possition puzzle empty
	this.list_states = [];    // States needs to be visit
	this.time        = '00:00:00';
	this.states_visited = [];
	this.stoped = false;
}

AbstractSearch.prototype.changeState = function(new_state){
	s = 0
	for (var line=0;line<=this.lines;line++){
		for (var column=0;column<=this.columns;column++){
			this.puzzle[line][column]['current'] = new_state[s];
			if (new_state[s] == 0){
				this.empty = [parseInt(line), parseInt(column)];
			}
			s += 1;
		}
	}
	this.states_visited.push(new_state.toString());
}

AbstractSearch.prototype.finishSearch = function(success){
	this.finished = true;
	this.success = success;
}

AbstractSearch.prototype.inArray = function(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++){
        if (haystack[i] == needle) return true;
    }
    return false;
}

AbstractSearch.prototype.sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
* Abstract method to choose state should be visited
**/
AbstractSearch.prototype.chooseState = async function() {}
