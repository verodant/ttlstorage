export class Ttlstorage {
    constructor() {
        this.async = false;
    }

    _set(name, value = undefined, ttl = null) {
        const model = {
            n: name,
            v: value,
            ttl,
            r: Date.now()
        };

        if (this.async) {
            return new Promise(success => {
                localStorage.setItem(name, JSON.stringify(model));
                success(value);
            });
        }

        localStorage.setItem(name, JSON.stringify(model));
        return value;
    }

    _checkTtl(value) {
        const testTtlPased = !!value.ttl && (Date.now() - value.r > value.ttl);
        if (testTtlPased) this.remove(value.n);
        return testTtlPased;
    }

    _get(name, deff = null) {
        const value = JSON.parse(localStorage.getItem(name));
        if (!value) return deff;
        if (this._checkTtl(value)) return deff;
        return value.v;
    }

    get(name, deff) {
        return (this.async) ?
            new Promise(success => { success(this._get(...arguments)) })
            : this._get(...arguments);
    }

    set(name, value = undefined, ttl = null) {
        return (this.async) ?
            new Promise(success => success(this._set(...arguments)))
            : this._set(...arguments);
    }

    remove(name) {
        localStorage.removeItem(name);
    }


}