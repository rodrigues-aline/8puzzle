/**
 * Class Breadth Search - 8 Puzzle Problem (UNIFESP - PPGCC)
 * Teacher: Fabio Faria
 * Author:  Aline Rodrigues
 * Created: 2018-09-09
 **/
 
function BreadthFirstSearch(id) {
	this.id             = id;
	this.states_visited = [];
	this.list_states    = [];
}

var breadth_search;

self.onmessage = event => {
	let data = event.data;
  	switch (data['command']) {
    	case 'init': 
		
		    // Call template Abstract Search
    		importScripts(data['path'] + '/AbstractSearch.js');
    		BreadthFirstSearch.prototype = new AbstractSearch();
			
			BreadthFirstSearch.prototype.chooseState = async function() {
				if (!this.checkStateExpected()){
					if (!this.stoped){
						let state = [];

						// Check left
						if ((this.empty[1]-1) >= 0) {
							state = this.getStateVector([this.empty[0], this.empty[1]-1]);
							if (!this.inArray(state.toString(), this.states_visited))
								this.list_states.push(state);
						}
						// Check bottom
						if ((this.empty[0]+1) <= this.lines) {
							state = this.getStateVector([this.empty[0]+1, this.empty[1]]);
							if (!this.inArray(state.toString(), this.states_visited))
								this.list_states.push(state);
						}
						// Check right
						if ((this.empty[1]+1) <= this.columns) {
							state = this.getStateVector([this.empty[0], this.empty[1]+1]);
							if (!this.inArray(state.toString(), this.states_visited))
								this.list_states.push(state);
						}
						// Check top
						if ((this.empty[0]-1) >= 0) {
							state = this.getStateVector([this.empty[0]-1, this.empty[1]]);
							if (!this.inArray(state.toString(), this.states_visited))
								this.list_states.push(state);
						}

						// Change state empty
						while (this.list_states.length > 0) {
							// Get first
							state = this.list_states.splice(0,1);
							if (!this.inArray(state[0].toString(), this.states_visited)) {
								this.changeState(state[0]);
								break;
							}
						}
						
						if (this.states_visited.length >= this.limit_states) {
							this.finishSearch(false);
							self.postMessage({ 'command'        : 'finish', 
								               'search'         : 'breadth', 
								               'success'        : false,
								               'new_state'      : state[0], 
								               'states_visited' : this.states_visited.length});
						}
						else {
							self.postMessage({ 'command'        : 'change_state', 
								               'search'         : 'breadth', 
								               'new_state'      : state[0], 
								               'states_visited' : this.states_visited.length });
							await this.sleep(this.speed);
							this.chooseState();
						}
					}
				}
				else {
					this.finishSearch(true);
					self.postMessage({ 'command'        : 'finish', 
						               'search'         : 'breadth', 
						               'success'        : true,
						               'states_visited' : this.states_visited.length});
				}
			}
    		breadth_search = new BreadthFirstSearch(data['id']);
    		breadth_search.createPuzzle(data['matrix']);
    		self.postMessage({ 'command' : 'set_puzzle'});
      		break;
      	case 'start':
      		breadth_search.stoped       = false;
      		breadth_search.speed        = data['speed'];
      		breadth_search.limit_states = data['limit_states'];
      		if (!breadth_search.finish) breadth_search.chooseState();
      		break;
    	case 'restart':
    		breadth_search.clearSearch();
			breadth_search.createPuzzle(data['matrix']);
			breadth_search.shufflePuzzles(data['shuffle']);
    		break;
    	case 'stop':
    		breadth_search.stoped = true;
    		break; 
    	case 'speed':
    		breadth_search.speed = data['speed'];
    		break;
  	}
}