class Thread {
	constructor(func) {
		this.params = [];
		this.func = func;
		this.promise = null;
		this.worker = null;
	}

	setParams(...params) {
		this.params = [...params];
		return this;
	}

	run() {
		this.promise = new Promise((resolve, reject) => {
			var args = Array.from(arguments);
			var func = args.pop();
			if (typeof func !== "function"){
				throw new Error("Invalid function");
			}
			
			var fstr = func.toString();
			var mainBody = fstr.substring(fstr.indexOf("{") + 1, fstr.lastIndexOf("}"));
			var paramNames = fstr.substring(fstr.indexOf("(") + 1, fstr.indexOf(")")).split(",").map(p => p.trim());
			var doneFunct = paramNames.pop();
			if (paramNames.length !== args.length)
				throw new Error("Invalid number of arguments.");
			var workerStr = `var ${doneFunct} = function(){
				  var args = Array.from(arguments);
				  postMessage(args);
			  };
			  self.onmessage = function(d){
				  var [${paramNames.join(", ")}] = d.data;
				  ${mainBody}
			  };`;
			var blob = new Blob([workerStr], {
				type: 'application/javascript'
			});
			this.worker = new Worker(URL.createObjectURL(blob));
			this.worker.onerror = reject;
			this.worker.onmessage = (d) => {
				resolve(...d.data);
				worker.terminate();
			};
			this.worker.postMessage(args);
		});
		return this;
	}
	
	abort(){
		worker.terminate();
		return this;
	}
	
	catch(...params){
		this.promise.catch(...params);
		return this;
	}
	
	done(...params){
		this.promise.then(...params);
		return this;
	}
}