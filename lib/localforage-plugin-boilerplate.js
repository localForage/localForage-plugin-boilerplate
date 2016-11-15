import localforage from 'localforage';
// // you can access the serializer and thedrivers by:
// import { getSerializerPromise, getDriverPromise } from './utils';

// getSerializerPromise();
// getDriverPromise(localforage.WEBSQL);

function handleMethodCall(localforageInstance, methodName, args) {
    return localforageInstance.ready()
        .then(function () {
            console.log('Invoking ' + methodName + ' with arguments: ', args);
            var promise = localforageInstance._baseMethods[methodName].apply(localforageInstance, args);
            promise.then(function(result) {
                console.log('Invoking ' + methodName + ' resolved with: ', result);
            }, function(err) {
                console.log('Invoking ' + methodName + ' rejected with: ', err);
            });
            return promise;
        });
}

// wraps the localForage methods of the WrappedLibraryMethods array and
// allows you to execute code before & after their invocation
function wireUpMethods(localforageInstance) {
    var WrappedLibraryMethods = [
        'clear',
        'getItem',
        'iterate',
        'key',
        'keys',
        'length',
        'removeItem',
        'setItem'
    ];

    function wireUpMethod(localforageInstance, methodName) {
        localforageInstance._baseMethods = localforageInstance._baseMethods || {};
        localforageInstance._baseMethods[methodName] = localforageInstance[methodName];
        localforageInstance[methodName] = function () {
            return handleMethodCall(this, methodName, arguments);
        };
    }

    for (var i = 0, len = WrappedLibraryMethods.length; i < len; i++) {
        var methodName = WrappedLibraryMethods[i];
        wireUpMethod(localforageInstance, methodName);
    }
}

// place your plugin initialization logic here
// useful in case that you need to preserve a state
function setup(localforageInstance) {
    if (!localforageInstance._pluginPrivateVariables) {
        localforageInstance._pluginPrivateVariables = {
            listOfImportantThings: [],
            callCount: 0
        };

        // in case you need to observe the invocation of some methods
        wireUpMethods(localforageInstance);
    }
}

// this will be available as `localforage.pluginMethod('test');`
export function localforagePluginBoilerplate(/*option*/) {
    var localforageInstance = this;
    
    // this will initialize your plugin lazily
    // after the first invocation of your method
    setup(localforageInstance);

    console.log('Hello world from the plugin method!');
    return Promise.resolve('Hello world result!');
}

// add your plugin method to every localForage instance
export function extendPrototype(localforage) {
    var localforagePrototype = Object.getPrototypeOf(localforage);
    if (localforagePrototype) {
        localforagePrototype.pluginMethod = localforagePluginBoilerplate;
    }
}

export var extendPrototypeResult = extendPrototype(localforage);
