/**
 * Class Depth Search - 8 Puzzle Problem (UNIFESP - PPGCC)
 * Teacher: Fabio Faria
 * Author:  Aline Rodrigues
 * Created: 2018-09-09
 **/

function DepthFirstSearch(id){
	AbstractSearch.call(this);
	this.id             = id;
	this.states_visited = [];
	this.list_states    = [];
}

var depth_search;

self.onmessage = event => {
	var data = event.data;
  	switch (data['command']) {
    	case 'init': 
		
			// Call template Abstract Search
    		importScripts(data['path']+'/AbstractSearch.js');
    		DepthFirstSearch.prototype = new AbstractSearch();
    		
			/**
			 * Depth Search - Choose states availables (random) 
			 **/
			DepthFirstSearch.prototype.chooseState = async function() {
				if (!this.checkStateExpected()){
					if (!this.stoped){
						var state = [];
						var state_available = [];

						// Check left
						if ((this.empty[1]-1) >= 0){
							state = this.getStateVector([this.empty[0], this.empty[1]-1]);
							if (!this.inArray(state.toString(), this.states_visited))
								state_available.push(state);
						}
						// Check bottom
						if ((this.empty[0]+1) <= this.lines){
							state = this.getStateVector([this.empty[0]+1, this.empty[1]]);
							if (!this.inArray(state.toString(), this.states_visited))
								state_available.push(state);
						}
						// Check right
						if ((this.empty[1]+1) <= this.columns){
							state = this.getStateVector([this.empty[0], this.empty[1]+1]);
							if (!this.inArray(state.toString(), this.states_visited))
								state_available.push(state);
						}
						// Check top
						if ((this.empty[0]-1) >= 0){
							state = this.getStateVector([this.empty[0]-1, this.empty[1]]);
							if (!this.inArray(state.toString(), this.states_visited))
								state_available.push(state);
						}

						state = [];
						new_state = Math.floor((Math.random() * state_available.length-1) + 0);
						for (var x=0;x<state_available.length;x++){
							if (x == new_state)
								state = state_available[x];
							else
								this.list_states.push(state_available[x]);
						}

						// Change state empty
						if (state.length > 0){
							this.changeState(state);
						}
						else{
							while(this.list_states.length > 0){
								// Get last
								state = this.list_states.pop();
								if (!this.inArray(state.toString(), this.states_visited)){
									this.changeState(state);
									break;
								}
							}
						}

						if (this.states_visited.length >= this.limit_states){
							this.finishSearch(false);
							self.postMessage({ 'command'        : 'finish', 
								               'search'         : 'depth', 
								               'success'        : false,
								               'new_state'      : state, 
								               'states_visited' : this.states_visited.length});
						}
						else{
							self.postMessage({ 'command'        : 'change_state', 
								               'search'         : 'depth', 
								               'new_state'      : state, 
								               'states_visited' : this.states_visited.length });
							await this.sleep(this.speed);
							this.chooseState();
						}
					}
				}
				else {
					this.finishSearch(true);
					self.postMessage({ 'command'        : 'finish', 
						               'search'         : 'depth', 
						               'success'        : true,
						               'states_visited' : this.states_visited.length});
				}
			}
    		depth_search = new DepthFirstSearch(data['id']);
    		depth_search.createPuzzle(data['matrix']);
    		self.postMessage({ 'command' : 'set_puzzle'}); 
      		break;
      	case 'start':
      		depth_search.stoped       = false;
      		depth_search.speed        = data['speed'];
      		depth_search.limit_states = data['limit_states'];
      		if (!depth_search.finish) depth_search.chooseState();
      		break;
    	case 'restart':
    		depth_search.clearSearch();
			depth_search.createPuzzle(data['matrix']);
			depth_search.shufflePuzzles(data['shuffle']);
    		break;
    	case 'stop':
    		depth_search.stoped = true;
    		break; 
    	case 'speed':
    		depth_search.speed = data['speed'];
    		break;
  	}
}