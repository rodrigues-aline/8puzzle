 
/**
 * Execute Searches in 8 Puzzle Problem (UNIFESP - PPGCC)
 * Teacher: Fabio Faria
 * Author:  Aline Rodrigues
 * Created: 2018-09-09
 **/

var search;

/**
 * Manage Searches view HTML
 **/

function initSearch(){
 	search = new Puzzle();
}

function startMany(count){
	$('#result_search').html('');
	search.count = count;
	search.start_many = true;
	$('#start').attr('disabled', true);
	$('#start_many').attr('disabled', true);
	$('#stop').attr('disabled', false);
	$('#restart').attr('disabled', true);
	$('#states_limit').attr('disabled', true);
	search.restartSearchs();
}

function start(){
	if (!search.stoped)
		search.restartSearchs();
	else{
		search.stoped = false;
		search.startSearchs();
	}
	if (!search.start_many){
		$('#table_result').hide();
		$('#restart').attr('disabled', true);
	}
	$('#start').attr('disabled', true);
	$('#stop').attr('disabled', false);
	$('#states_limit').attr('disabled', true);
}

function stop(){
	search.stoped = true;
	search.stopSearchs();
	$('#stop').attr('disabled', true);
	$('#start').attr('disabled', false);
	if (!search.start_many){
		$('#restart').attr('disabled', false);
	}
	$('#states_limit').attr('disabled', false);
}

function restart(){
	search.stopSearchs();
	search.restartSearchs();
	$('#start').attr('disabled', true);
	$('#stop').attr('disabled', false);
	$('#restart').attr('disabled', true);
	$('#states_limit').attr('disabled', true);
}

function changeSpeed(){
	search.changeSpeed($('#speed').val());
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



/**
 * Class manage searches
 **/
function Puzzle(){
	this.matrix     = [3,3];
	this.shuffle    = []; // Define inicial state to start searchs
	this.stoped     = false;
	this.start_many = false;
	this.result     = [];
	this.count      = 0;
	
	// Manage time
	this.hours    = 0;
	this.minutes  = 0;
	this.secounds = 0;

	// Set threads to run searches
	this.path     = 'file://'+window.location.pathname.replace('8puzzle.html', '');
	this.threads_search = [ {'search'   : new Worker(URL.createObjectURL(new Blob(['importScripts("'+this.path+'/DepthFirstSearch.js")'], {type: 'text/javascript'}))),
	                         'id'       : 'depth',
	                         'time'     : '00:00:00',
	                         'finished' : false,
	                         'success'  : false,
	                         'states_visited' : 0},

	                         {'search'   : new Worker(URL.createObjectURL(new Blob(['importScripts("'+this.path+'/BreadthFirstSearch.js")'], {type: 'text/javascript'}))),
	                         'id'        : 'breadth',
	                         'time'      : '00:00:00',
	                         'finished'  : false,
	                         'success'   : false,
	                         'states_visited' : 0},

	                         {'search'   : new Worker(URL.createObjectURL(new Blob(['importScripts("'+this.path+'/GreedySearch.js")'], {type: 'text/javascript'}))),
	                         'id'        : 'greedy1',
	                         'heuristic' : 1,
	                         'time'      : '00:00:00',
	                         'finished'  : false,
	                         'success'   : false,
	                         'states_visited' : 0},

	                         {'search'   : new Worker(URL.createObjectURL(new Blob(['importScripts("'+this.path+'/GreedySearch.js")'], {type: 'text/javascript'}))),
	                         'id'        : 'greedy2',
	                         'heuristic' : 2,
	                         'time'      : '00:00:00',
	                         'finished'  : false,
	                         'success'   : false,
	                         'states_visited' : 0},

	                         {'search'   : new Worker(URL.createObjectURL(new Blob(['importScripts("'+this.path+'/GreedySearch.js")'], {type: 'text/javascript'}))),
	                         'id'        : 'greedy3',
	                         'heuristic' : 3,
	                         'time'      : '00:00:00',
	                         'finished'  : false,
	                         'success'   : false,
	                         'states_visited' : 0}];

	for (var s in this.threads_search){
		this.result.push([]);

		// Set events threads searches
		this.threads_search[s]['search'].onmessage = function(event) {
			var data = event.data
			switch (data['command']) {
				case 'set_puzzle':
					search.createPuzzle();
					break;
    			case 'change_state':
    				search.setPuzzle(data['search'], data['new_state'], data['states_visited'])
    				break;
    			case 'finish':
    				search.setPuzzleFinished(data);
    				break;
    		} 
    	};

    	this.threads_search[s]['search'].onerror = function(e) {
        	console.error(`Error: Line ${e.lineno} in ${e.filename}: ${e.message}`);
    	};

    	// Initialize searches
    	this.threads_search[s]['search'].postMessage({'command'   : 'init', 
    		                                          'matrix'    : this.matrix, 
    		                                          'id'        : this.threads_search[s]['id'], 
    		                                          'heuristic' : this.threads_search[s]['heuristic'], 
    		                                          'path'      : this.path });
	}
}

Puzzle.prototype.setTime = function(obj_in) {
	setInterval(function(){
		
		// Count time
		if (obj_in.secounds == 59){
			obj_in.secounds = 0;
			if (obj_in.minutes == 59){
				obj_in.minutes = 0;
				obj_in.hours += 1;	
			}
			else obj_in.minutes += 1;
		}
		else obj_in.secounds += 1;
		
		// Flag all searches finished
		var all_finished = true;
		
		// Update searches run time
		for (var s in obj_in.threads_search){
			if (!obj_in.threads_search[s]['finished']){
				all_finished = false;
				obj_in.threads_search[s]['time'] = ((obj_in.hours < 10)    ? '0' + obj_in.hours    : obj_in.hours)   + ':' +
					                               ((obj_in.minutes < 10)  ? '0' + obj_in.minutes  : obj_in.minutes) + ':' +
					                               ((obj_in.secounds < 10) ? '0' + obj_in.secounds : obj_in.secounds);
				$('#time_'+obj_in.threads_search[s]['id']).html('Time: '+obj_in.threads_search[s]['time']);
			}
		}
		
		if (all_finished){
			// Run once
			if (!obj_in.start_many){
				$('#start').attr('disabled', false);
				$('#stop').attr('disabled', true);
				$('#restart').attr('disabled', true);
				$('#states_limit').attr('disabled', false);
				obj_in.stopSearchs();
			}
			// Run many times
			else{
				$('#table_result').show();
				var html = ''
				for (var s in obj_in.threads_search){
					obj_in.result[s].push({'time': obj_in.threads_search[s]['time'], 'states': obj_in.threads_search[s]['states_visited'], 'status': obj_in.threads_search[s]['success']});
					html += '<td style="padding: .50rem;font-size: 12px;">\
					            '+((obj_in.threads_search[s]['success'])?'<div class="success"></div>&nbsp;':'<div class="fail"></div>&nbsp;')+'\
						        Time: '+obj_in.threads_search[s]['time']+'\
						        States: '+obj_in.threads_search[s]['states_visited']+'\
						     </td>';
				}
				$('#result_search').append('<tr><th scope="row" style="padding: .50rem;font-size: 12px;">'+(100-(obj_in.count-1))+'</th>'+html+'</tr>');
				if (obj_in.count > 1){
					obj_in.count -= 1;
					obj_in.stopSearchs();
					obj_in.restartSearchs();
				}
				else{
					$('#start').attr('disabled', false);
					$('#stop').attr('disabled', true);
				    $('#restart').attr('disabled', true);
				    $('#states_limit').attr('disabled', false);
				    $('#start_many').attr('disabled', false);
				    obj_in.start_many = false;
					obj_in.stopSearchs();
				}
			}
		}
	}, 1000);	
}

Puzzle.prototype.createPuzzle = function() {
	var position = 0;
	for (var i=0;i<this.matrix[0];i++){
		for(var x=0;x<this.matrix[1];x++){
			$('#'+i+'_'+x+'_'+this.id).attr('src', 'img/cat_'+position+'.png');
			position += 1;
		}
	}
}

Puzzle.prototype.shufflePuzzles = function() {
	this.shuffle = Array.apply(null, {length: (this.matrix[0]*this.matrix[1])}).map(Number.call, Number);
	this.shuffle = this.shuffle.sort(function() {return .5 - Math.random();});
}

Puzzle.prototype.startSearchs = function() {
	// Start searches in threads
	for (var s in this.threads_search){
		if (!this.threads_search[s]['finished']){
			// Send command to thread
			this.threads_search[s]['search'].postMessage({'command'      : 'start', 
			                                              'speed'        : $('#speed').val(), 
			                                              'limit_states' : $('#states_limit').val()});
		}
	}
	this.setTime(this);
}

Puzzle.prototype.stopSearchs = function() {
	var id = window.setTimeout(function() {}, 0);
	while (id--) {
	    window.clearTimeout(id);
	}
	for (var s in this.threads_search){
		// Send command to thread
		this.threads_search[s]['search'].postMessage({'command' : 'stop'});
	}	
}

Puzzle.prototype.restartSearchs = async function() {
	this.hours    = 0;
	this.minutes  = 0;
	this.secounds = 0;
	
	this.stopSearchs();
	this.shufflePuzzles();
	await sleep(250);

	for (var s in this.threads_search){
		this.threads_search[s]['finished']       = false;
		this.threads_search[s]['success']        = false;
		this.threads_search[s]['states_visited'] = 0;
		this.threads_search[s]['time']           = '00:00:00';
		
		$('#time_'   + this.threads_search[s]['id']).html('Time: 00:00:00');
		$('#status_' + this.threads_search[s]['id']).html('Status: -');
		
		this.setPuzzle(this.threads_search[s]['id'], this.shuffle, 0);
		
		// Send command to thread
		this.threads_search[s]['search'].postMessage({'command' : 'restart', 
			                                          'matrix'  : this.matrix, 
			                                          'shuffle' : this.shuffle });
	}
	await sleep(1000);
	this.startSearchs();
}

Puzzle.prototype.changeSpeed = function(speed) {
	for (var s in this.threads_search){
		// Send command to thread
		this.threads_search[s]['search'].postMessage({'command' : 'speed', 
			                                          'speed'   :  speed });
	}
}

Puzzle.prototype.setPuzzle = function(search, new_state, states_visited) {
	var s = 0
	for (var line=0;line<this.matrix[0];line++){
		for(var column=0;column<this.matrix[1];column++){
			if (new_state[s] == 0){
				$('#'+line+'_'+column+'_'+search).attr('src', 'img/empty.png');
			}
			else{
				$('#'+line+'_'+column+'_'+search).attr('src', 'img/cat_'+new_state[s]+'.png');
			}
			s += 1;
		}
	}
	$('#states_'+search).html('Visited States: '+states_visited);
}

Puzzle.prototype.setPuzzleFinished = function(search){
	for (var s in this.threads_search){
		if (this.threads_search[s]['id'] == search['search']){
			this.threads_search[s]['finished']       = true;
			this.threads_search[s]['success']        = search['success'];
			this.threads_search[s]['states_visited'] = search['states_visited'];

			if (search['new_state'] != undefined){
				this.setPuzzle(search['search'], search['new_state'], search['states_visited']);
			}

			if (search['success']){
				$('#status_'+search['search']).html('Status: <span style="color:green;"><b>SUCCESS!</b></span>');
			}
			else{
				$('#status_'+search['search']).html('Status: <span style="color:red;"><b>FAILED!</b></span>');
			}
			break;
		}
	}
}
