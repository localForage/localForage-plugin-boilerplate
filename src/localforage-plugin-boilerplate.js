(function() {
    'use strict';

    // Promises!
    var Promise = (typeof module !== 'undefined' && module.exports) ?
                  require('promise') : this.Promise;

    var globalObject = this;
    var serializer = null;

    var ModuleType = {
        DEFINE: 1,
        EXPORT: 2,
        WINDOW: 3
    };

    // Attaching to window (i.e. no module loader) is the assumed,
    // simple default.
    var moduleType = ModuleType.WINDOW;

    // Find out what kind of module setup we have; if none, we'll just attach
    // localForage to the main window.
    if (typeof define === 'function' && define.amd) {
        moduleType = ModuleType.DEFINE;
    } else if (typeof module !== 'undefined' && module.exports) {
        moduleType = ModuleType.EXPORT;
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
    function localforagePluginName(option) {
        var localforageInstance = this;
        
        // this will initialize your plugin lazily
        // after the first invocation of your method
        setup(localforageInstance);

        console.log('Hello world from the plugin method!');
        return Promise.resolve('Hello world result!');
    }

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


    // add your plugin method to every localForage instance
    function extendPrototype(localforage) {
        var localforagePrototype = Object.getPrototypeOf(localforage);
        if (localforagePrototype) {
            localforagePrototype.pluginMethod = localforagePluginName;
        }
    }

    extendPrototype(localforage);

    if (moduleType === ModuleType.DEFINE) {
        define('localforagePluginName', function() {
            return localforagePluginName;
        });
    } else if (moduleType === ModuleType.EXPORT) {
        module.exports = localforagePluginName;
    } else {
        this.localforagePluginName = localforagePluginName;
    }
}).call(window);
