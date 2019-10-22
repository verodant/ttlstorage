/**
 * @author Verodant (AAC)
 * Clase de storage que permite tener caducidad en el guardado y poder poner valores por defecto
 * 
 */
export class TTLStorage {
    /**
     * 
     * @param {Boolean} async Alterna entre asincrono o no, devolviendo promesas en el caso de async = true
     */
    constructor(async = true) {
        this.async = async;
    }

    /**
     * guarda en el storage un valor
     * @private
     * @param {String} key Clave con la que guardar el valor
     * @param {*} value Valor a guardar y recuperar
     * @param {number} ttl Tiempo en milisegundos hasta su caducidad
     */
    _set(key, value = undefined, ttl = null) {
        const model = {
            k: key,
            v: value,
            ttl,
            r: Date.now()
        };

        if (this.async) {
            return new Promise(success => {
                localStorage.setItem(key, JSON.stringify(model));
                success(value);
            });
        }

        localStorage.setItem(key, JSON.stringify(model));
        return value;
    }

    /**
     * clase para ver si un dato ha caducado y si es asi lo borra del storage
     * @private
     * @param {*} model modelo para comprobar ttl
     */
    _checkTtl(model) {
        const testTtlPased = !!model.ttl && (Date.now() - model.r > model.ttl);
        if (testTtlPased) this.remove(model.k);
        return testTtlPased;
    }

    /**
     * recupera un valor del storage
     * @private
     * @param {*} key 
     * @param {*} deff 
     */
    _get(key, deff = null) {
        const modelStored = JSON.parse(localStorage.getItem(key));
        if (!modelStored || this._checkTtl(modelStored)) return deff;
        return modelStored.v;
    }

    /**
     * Recupera un valor del storage y si ha caducado o no existe devuelve el valor por defecto
     * @param {String} key clave por la que recuperaremos el valor guardado
     * @param {*} deff Valor por defecto si no esta almacenado o a caducado
     */
    get(key, deff) {
        return (this.async) ?
            new Promise(success => { success(this._get(...arguments)) })
            : this._get(...arguments);
    }

    /**
     * Guarda un valor en el storage
     * @param {String} key Clave para guardar y recuperar
     * @param {*} value Valor a guardar
     * @param {*} ttl timepo de caducidad el valor
     */
    set(key, value = undefined, ttl = null) {
        return (this.async) ?
            new Promise(success => success(this._set(...arguments)))
            : this._set(...arguments);
    }

    /**
     * Elimina un valor del storage
     * @param {String} key Clave a borrar
     */
    remove(key) {
        return (this.async) ?
            new Promise(success => success(localStorage.removeItem(key)))
            : localStorage.removeItem(key);
    }
}