class Thread {
	constructor(func) {
		this._params = [];
		this._promise = null;
		this._worker = null;
		this._threadBody = null;
		this._threadParamNames = null;
		this._parseUserFunction(func);
		this.running = false;
		this.thread_id = Thread.instances.length;
		this.onmessage = ()=>{};
		Thread.instances.push(this);
	}

	_parseUserFunction(func){
		if (typeof func !== "function"){
			throw new Error("Invalid function");
		}
		var fstr = func.toString();
		this._threadBody = fstr.substring(fstr.indexOf("{") + 1, fstr.lastIndexOf("}"));
		this._threadParamNames = fstr.substring(fstr.indexOf("(") + 1, fstr.indexOf(")")).split(",").map(p => p.trim()).filter(p=>!!p);
	}

	_generateWorker(){
		var workerStr = `class ThreadMain{
			constructor(){
				this.running = false;
				this.onmessage = () => {};
			}

			run(...params){
				this.running = true;
				var [${this._threadParamNames.join(", ")}] = params;
				${this._threadBody}
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
				if(d.data.isdone){
					this._worker.terminate();
					resolve(...d.data.params);
				}else{
					this.onmessage(...d.data.params);
				}
			};
			this._worker.postMessage(this._params);
			this.running = true;
		});
		return this;
	}
	
	postmessage(...params){
		this._worker.postMessage(params);
		return this;
	}
	
	abort(){
		this._worker.terminate();
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