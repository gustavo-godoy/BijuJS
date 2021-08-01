"use strict"

let callHandler = {
    caller: function(service) {
        return function _caller(...args){

            // Checking argument size
            if (args.length < 1) {
                throw "Exception: At least one argument (callback) expected."
            }

            let callback = args.pop()

            if ( !(callback instanceof Function) ){
                throw "Exception: Last argument must be a callback function"
            }

            // Aux functions for JSON.stringify
            function stringifyReplacer(key, value) {
                if (value == null || value == ""){
                    return undefined;
                }
                return value;
            }

            let response = fetch(`/run/${service}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({'args': args}, stringifyReplacer)
            }).then(response => response.json()).then(callback)

            return null;
        }
    }
}

let proxyHandler = {
    get: function (target, property) {
        return target.caller(property);
    }
}

let BijuJS = new Proxy(callHandler, proxyHandler);
