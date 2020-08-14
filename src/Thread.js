class Thread {
	constructor(func) {
		this._params = [];
		this._promise = null;
		this._worker = null;
		this._threadBody = null;
		this._threadParamNames = null;
		this._completedCallbackName = null;
		this._parseUserFunction(func);
		this.running = false;
		this.thread_id = Thread.instances.length;
		Thread.instances.push(this);
	}

	_parseUserFunction(func){
		if (typeof func !== "function"){
			throw new Error("Invalid function");
		}
		var fstr = func.toString();
		this._threadBody = fstr.substring(fstr.indexOf("{") + 1, fstr.lastIndexOf("}"));
		this._threadParamNames = fstr.substring(fstr.indexOf("(") + 1, fstr.indexOf(")")).split(",").map(p => p.trim());
		this._completedCallbackName = this._threadParamNames.pop();
	}

	_generateWorker(){
		var workerStr = `var ${this._completedCallbackName} = function(){
			var args = Array.from(arguments);
			postMessage(args);
		};
		self.onmessage = function(d){
			var [${this._threadParamNames.join(", ")}] = d.data;
			${this._threadBody}
		};`;
		var blob = new Blob([workerStr], {type: 'application/javascript'});
		this._worker = new Worker(URL.createObjectURL(blob));
	}

	setParams(...params) {
		this._params = [...params];
		return this;
	}

	run() {
		this.promise = new Promise((resolve, reject) => {
			if (this._threadParamNames.length !== this._params.length){
				throw new Error("Invalid number of arguments.");
			}
			this._generateWorker();
			this._worker.onerror = e => {
				reject(e);
				
			};
			this._worker.onmessage = d => {
				this._worker.terminate();
				resolve(...d.data);
			};
			this._worker.postMessage(this._params);
			this.running = true;
		});
		return this;
	}
	
	abort(){
		_this.worker.terminate();
		this.running = false;
		return this;
	}
	
	catch(...params){
		this._promise.catch(...params);
		return this;
	}
	
	done(...params){
		this._promise.then(...params);
		return this;
	}
}

Thread.instances = [];