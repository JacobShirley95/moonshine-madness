export default class DeferredPromise {
    constructor(other) {
        this.promise = new Promise(function(resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this));

        this.other = other;
    }

    start() {
        if (!this.actualPromise)
            this.actualPromise = new Promise((resolve, err) => {
                this.other(this.resolve, this.reject);
            });

        return this;
    }

    then(func) {
        return this.promise.then(func);
    }

    catch(func) {
        return this.promise.catch(func);
    }
}
