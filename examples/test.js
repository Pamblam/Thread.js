
class ThreadMain{
	constructor(){
		this.running = false;
		this.onmessage = () => {};
	}
	
	run(...params){
		this.running = true;
		// body of thread here
	}
	
	done(...params){
		self.postMessage({isdone: true, params: [...params]});
		this.running = false;
	}
	
	postmessage(...params){
		self.postMessage({isdone: false, params: [...params]});
	}
}

var thread = new ThreadMain();

self.onmessage = function(d){
	if(!thread.running){
		thread.run(...d.data);
	}else{
		thread.onmessage(...d.data);
	}
};
