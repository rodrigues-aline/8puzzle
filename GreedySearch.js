/**
 * Class Greedy Search - 8 Puzzle Problem (UNIFESP - PPGCC)
 * Teacher: Fabio Faria
 * Author:  Aline Rodrigues
 * Created: 2018-09-09
 **/

function GreedySearch(id, heuristic) {
	this.id             = id;
	this.heuristic      = heuristic;
	this.states_visited = [];
	this.list_states    = [];
	this.pos_expected   = [[0,0], [0,1], [0,2], [1,0], [1,1], [1,2], [2,0], [2,1], [2,2]];
}

var greedy_search;

self.onmessage = event => {
	let data = event.data;
  	switch (data['command']) {
    	case 'init': 
			// Call template Abstract Search
    		importScripts(data['path'] + '/AbstractSearch.js');
    		GreedySearch.prototype = new AbstractSearch();

			// H1
    		GreedySearch.prototype.processHeuristic1 = function(state) {
				let shuffe = 0
				for (let s in state) {
					if (s != state[s]) shuffe += 1;
				}
				return shuffe;
			}

			// H2
			GreedySearch.prototype.processHeuristic2 = function(state) {
				let distance = 0;
				let s = 0;
				for (let line=0; line<=this.lines; line++) {
					for (let column=0; column<=this.columns; column++) {
						if (state[s] > 0) {
							distance += (Math.abs(this.pos_expected[state[s]][0]-line) + Math.abs(this.pos_expected[state[s]][1]-column));
						}
						s += 1;
					}
				}
				return distance;
			}

			GreedySearch.prototype.processHeuristics = function(state) {
				if (this.heuristic == 1)      return this.processHeuristic1(state);
				else if (this.heuristic == 2) return this.processHeuristic2(state);
				else if (this.heuristic == 3) return this.processHeuristic3(state);
			}

			GreedySearch.prototype.chooseState = async function() {
				if (!this.checkStateExpected()) {
					if (!this.stoped) {
						let state = [];

						// Check left
						if ((this.empty[1]-1) >= 0) {
							state = this.getStateVector([this.empty[0], this.empty[1]-1]);
							if (!this.inArray(state.toString(), this.states_visited))
								this.list_states.push([this.processHeuristics(state), state]);
						}
						// Check bottom
						if ((this.empty[0]+1) <= this.lines) {
							state = this.getStateVector([this.empty[0]+1, this.empty[1]]);
							if (!this.inArray(state.toString(), this.states_visited))
								this.list_states.push([this.processHeuristics(state), state]);
						}
						// Check right
						if ((this.empty[1]+1) <= this.columns) {
							state = this.getStateVector([this.empty[0], this.empty[1]+1]);
							if (!this.inArray(state.toString(), this.states_visited))
								this.list_states.push([this.processHeuristics(state), state]);
						}
						// Check top
						if ((this.empty[0]-1) >= 0) {
							state = this.getStateVector([this.empty[0]-1, this.empty[1]]);
							if (!this.inArray(state.toString(), this.states_visited))
								this.list_states.push([this.processHeuristics(state), state]);
						}
						
						// Sort best heuristics
						this.list_states.sort((a, b) => a[0] - b[0]);

						// Change state empty
						while (this.list_states.length > 0) {
							// Get first
							state = this.list_states.splice(0,1);
							if (!this.inArray(state[0][1].toString(), this.states_visited)) {
								this.changeState(state[0][1]);
								break;
							}
						}
						
						if (this.states_visited.length >= this.limit_states) {
							this.finishSearch(false);
							self.postMessage({ 'command'        : 'finish', 
								               'search'         : this.id, 
								               'success'        : false,
								               'new_state'      : state[0][1], 
								               'states_visited' : this.states_visited.length});
						}
						else {
							self.postMessage({ 'command'        : 'change_state', 
								               'search'         : this.id, 
								               'new_state'      : state[0][1], 
								               'states_visited' : this.states_visited.length });
							await this.sleep(this.speed);
							this.chooseState();
						}
					}
				}
				else {
					this.finishSearch(true);
					self.postMessage({ 'command'        : 'finish', 
						               'search'         : this.id, 
						               'success'        : true,
						               'states_visited' : this.states_visited.length});
				}
			}
    		greedy_search = new GreedySearch(data['id'], data['heuristic']);
    		greedy_search.createPuzzle(data['matrix']);
    		self.postMessage({ 'command' : 'set_puzzle'});
      		break;
      	case 'start':
      		greedy_search.stoped       = false;
      		greedy_search.speed        = data['speed'];
      		greedy_search.limit_states = data['limit_states'];
      		if (!greedy_search.finish) greedy_search.chooseState();
      		break;
    	case 'restart':
    		greedy_search.clearSearch();
			greedy_search.createPuzzle(data['matrix']);
			greedy_search.shufflePuzzles(data['shuffle']);
    		break;
    	case 'stop':
    		greedy_search.stoped = true;
    		break; 
    	case 'speed':
    		greedy_search.speed = data['speed'];
    		break;
  	}
}