
/**++++++++SandBox++++++++*/
var doric = (function (exports) {
    'use strict';

    /*
     * Copyright [2019] [Doric.Pub]
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    let __uniqueId__ = 0;
    function uniqueId(prefix) {
        return `__${prefix}_${__uniqueId__++}__`;
    }

    function toString(message) {
        if (message instanceof Function) {
            return message.toString();
        }
        else if (message instanceof Object) {
            try {
                return JSON.stringify(message);
            }
            catch (e) {
                return message.toString();
            }
        }
        else if (message === undefined) {
            return "undefined";
        }
        else {
            return message.toString();
        }
    }
    function loge(...message) {
        let out = "";
        for (let i = 0; i < arguments.length; i++) {
            if (i > 0) {
                out += ',';
            }
            out += toString(arguments[i]);
        }
        nativeLog('e', out);
    }

    /*! *****************************************************************************
    Copyright (C) Microsoft. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    var Reflect$1;
    (function (Reflect) {
        // Metadata Proposal
        // https://rbuckton.github.io/reflect-metadata/
        (function (factory) {
            var root = typeof global === "object" ? global :
                typeof self === "object" ? self :
                    typeof this === "object" ? this :
                        Function("return this;")();
            var exporter = makeExporter(Reflect);
            if (typeof root.Reflect === "undefined") {
                root.Reflect = Reflect;
            }
            else {
                exporter = makeExporter(root.Reflect, exporter);
            }
            factory(exporter);
            function makeExporter(target, previous) {
                return function (key, value) {
                    if (typeof target[key] !== "function") {
                        Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                    }
                    if (previous)
                        previous(key, value);
                };
            }
        })(function (exporter) {
            var hasOwn = Object.prototype.hasOwnProperty;
            // feature test for Symbol support
            var supportsSymbol = typeof Symbol === "function";
            var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
            var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
            var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
            var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
            var downLevel = !supportsCreate && !supportsProto;
            var HashMap = {
                // create an object in dictionary mode (a.k.a. "slow" mode in v8)
                create: supportsCreate
                    ? function () { return MakeDictionary(Object.create(null)); }
                    : supportsProto
                        ? function () { return MakeDictionary({ __proto__: null }); }
                        : function () { return MakeDictionary({}); },
                has: downLevel
                    ? function (map, key) { return hasOwn.call(map, key); }
                    : function (map, key) { return key in map; },
                get: downLevel
                    ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
                    : function (map, key) { return map[key]; },
            };
            // Load global or shim versions of Map, Set, and WeakMap
            var functionPrototype = Object.getPrototypeOf(Function);
            var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
            var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
            var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
            var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
            // [[Metadata]] internal slot
            // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
            var Metadata = new _WeakMap();
            /**
             * Applies a set of decorators to a property of a target object.
             * @param decorators An array of decorators.
             * @param target The target object.
             * @param propertyKey (Optional) The property key to decorate.
             * @param attributes (Optional) The property descriptor for the target key.
             * @remarks Decorators are applied in reverse order.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     Example = Reflect.decorate(decoratorsArray, Example);
             *
             *     // property (on constructor)
             *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
             *
             *     // property (on prototype)
             *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
             *
             *     // method (on constructor)
             *     Object.defineProperty(Example, "staticMethod",
             *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
             *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
             *
             *     // method (on prototype)
             *     Object.defineProperty(Example.prototype, "method",
             *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
             *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
             *
             */
            function decorate(decorators, target, propertyKey, attributes) {
                if (!IsUndefined(propertyKey)) {
                    if (!IsArray(decorators))
                        throw new TypeError();
                    if (!IsObject(target))
                        throw new TypeError();
                    if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                        throw new TypeError();
                    if (IsNull(attributes))
                        attributes = undefined;
                    propertyKey = ToPropertyKey(propertyKey);
                    return DecorateProperty(decorators, target, propertyKey, attributes);
                }
                else {
                    if (!IsArray(decorators))
                        throw new TypeError();
                    if (!IsConstructor(target))
                        throw new TypeError();
                    return DecorateConstructor(decorators, target);
                }
            }
            exporter("decorate", decorate);
            // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
            // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
            /**
             * A default metadata decorator factory that can be used on a class, class member, or parameter.
             * @param metadataKey The key for the metadata entry.
             * @param metadataValue The value for the metadata entry.
             * @returns A decorator function.
             * @remarks
             * If `metadataKey` is already defined for the target and target key, the
             * metadataValue for that key will be overwritten.
             * @example
             *
             *     // constructor
             *     @Reflect.metadata(key, value)
             *     class Example {
             *     }
             *
             *     // property (on constructor, TypeScript only)
             *     class Example {
             *         @Reflect.metadata(key, value)
             *         static staticProperty;
             *     }
             *
             *     // property (on prototype, TypeScript only)
             *     class Example {
             *         @Reflect.metadata(key, value)
             *         property;
             *     }
             *
             *     // method (on constructor)
             *     class Example {
             *         @Reflect.metadata(key, value)
             *         static staticMethod() { }
             *     }
             *
             *     // method (on prototype)
             *     class Example {
             *         @Reflect.metadata(key, value)
             *         method() { }
             *     }
             *
             */
            function metadata(metadataKey, metadataValue) {
                function decorator(target, propertyKey) {
                    if (!IsObject(target))
                        throw new TypeError();
                    if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                        throw new TypeError();
                    OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
                }
                return decorator;
            }
            exporter("metadata", metadata);
            /**
             * Define a unique metadata entry on the target.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param metadataValue A value that contains attached metadata.
             * @param target The target object on which to define metadata.
             * @param propertyKey (Optional) The property key for the target.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     Reflect.defineMetadata("custom:annotation", options, Example);
             *
             *     // property (on constructor)
             *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
             *
             *     // property (on prototype)
             *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
             *
             *     // method (on constructor)
             *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
             *
             *     // method (on prototype)
             *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
             *
             *     // decorator factory as metadata-producing annotation.
             *     function MyAnnotation(options): Decorator {
             *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
             *     }
             *
             */
            function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey))
                    propertyKey = ToPropertyKey(propertyKey);
                return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            }
            exporter("defineMetadata", defineMetadata);
            /**
             * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.hasMetadata("custom:annotation", Example);
             *
             *     // property (on constructor)
             *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
             *
             */
            function hasMetadata(metadataKey, target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey))
                    propertyKey = ToPropertyKey(propertyKey);
                return OrdinaryHasMetadata(metadataKey, target, propertyKey);
            }
            exporter("hasMetadata", hasMetadata);
            /**
             * Gets a value indicating whether the target object has the provided metadata key defined.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
             *
             *     // property (on constructor)
             *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
             *
             */
            function hasOwnMetadata(metadataKey, target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey))
                    propertyKey = ToPropertyKey(propertyKey);
                return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
            }
            exporter("hasOwnMetadata", hasOwnMetadata);
            /**
             * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.getMetadata("custom:annotation", Example);
             *
             *     // property (on constructor)
             *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
             *
             */
            function getMetadata(metadataKey, target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey))
                    propertyKey = ToPropertyKey(propertyKey);
                return OrdinaryGetMetadata(metadataKey, target, propertyKey);
            }
            exporter("getMetadata", getMetadata);
            /**
             * Gets the metadata value for the provided metadata key on the target object.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.getOwnMetadata("custom:annotation", Example);
             *
             *     // property (on constructor)
             *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
             *
             */
            function getOwnMetadata(metadataKey, target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey))
                    propertyKey = ToPropertyKey(propertyKey);
                return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
            }
            exporter("getOwnMetadata", getOwnMetadata);
            /**
             * Gets the metadata keys defined on the target object or its prototype chain.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns An array of unique metadata keys.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.getMetadataKeys(Example);
             *
             *     // property (on constructor)
             *     result = Reflect.getMetadataKeys(Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.getMetadataKeys(Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.getMetadataKeys(Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.getMetadataKeys(Example.prototype, "method");
             *
             */
            function getMetadataKeys(target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey))
                    propertyKey = ToPropertyKey(propertyKey);
                return OrdinaryMetadataKeys(target, propertyKey);
            }
            exporter("getMetadataKeys", getMetadataKeys);
            /**
             * Gets the unique metadata keys defined on the target object.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns An array of unique metadata keys.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.getOwnMetadataKeys(Example);
             *
             *     // property (on constructor)
             *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
             *
             */
            function getOwnMetadataKeys(target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey))
                    propertyKey = ToPropertyKey(propertyKey);
                return OrdinaryOwnMetadataKeys(target, propertyKey);
            }
            exporter("getOwnMetadataKeys", getOwnMetadataKeys);
            /**
             * Deletes the metadata entry from the target object with the provided key.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns `true` if the metadata entry was found and deleted; otherwise, false.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.deleteMetadata("custom:annotation", Example);
             *
             *     // property (on constructor)
             *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
             *
             */
            function deleteMetadata(metadataKey, target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey))
                    propertyKey = ToPropertyKey(propertyKey);
                var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return false;
                if (!metadataMap.delete(metadataKey))
                    return false;
                if (metadataMap.size > 0)
                    return true;
                var targetMetadata = Metadata.get(target);
                targetMetadata.delete(propertyKey);
                if (targetMetadata.size > 0)
                    return true;
                Metadata.delete(target);
                return true;
            }
            exporter("deleteMetadata", deleteMetadata);
            function DecorateConstructor(decorators, target) {
                for (var i = decorators.length - 1; i >= 0; --i) {
                    var decorator = decorators[i];
                    var decorated = decorator(target);
                    if (!IsUndefined(decorated) && !IsNull(decorated)) {
                        if (!IsConstructor(decorated))
                            throw new TypeError();
                        target = decorated;
                    }
                }
                return target;
            }
            function DecorateProperty(decorators, target, propertyKey, descriptor) {
                for (var i = decorators.length - 1; i >= 0; --i) {
                    var decorator = decorators[i];
                    var decorated = decorator(target, propertyKey, descriptor);
                    if (!IsUndefined(decorated) && !IsNull(decorated)) {
                        if (!IsObject(decorated))
                            throw new TypeError();
                        descriptor = decorated;
                    }
                }
                return descriptor;
            }
            function GetOrCreateMetadataMap(O, P, Create) {
                var targetMetadata = Metadata.get(O);
                if (IsUndefined(targetMetadata)) {
                    if (!Create)
                        return undefined;
                    targetMetadata = new _Map();
                    Metadata.set(O, targetMetadata);
                }
                var metadataMap = targetMetadata.get(P);
                if (IsUndefined(metadataMap)) {
                    if (!Create)
                        return undefined;
                    metadataMap = new _Map();
                    targetMetadata.set(P, metadataMap);
                }
                return metadataMap;
            }
            // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
            function OrdinaryHasMetadata(MetadataKey, O, P) {
                var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
                if (hasOwn)
                    return true;
                var parent = OrdinaryGetPrototypeOf(O);
                if (!IsNull(parent))
                    return OrdinaryHasMetadata(MetadataKey, parent, P);
                return false;
            }
            // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
            function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return false;
                return ToBoolean(metadataMap.has(MetadataKey));
            }
            // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
            function OrdinaryGetMetadata(MetadataKey, O, P) {
                var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
                if (hasOwn)
                    return OrdinaryGetOwnMetadata(MetadataKey, O, P);
                var parent = OrdinaryGetPrototypeOf(O);
                if (!IsNull(parent))
                    return OrdinaryGetMetadata(MetadataKey, parent, P);
                return undefined;
            }
            // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
            function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return undefined;
                return metadataMap.get(MetadataKey);
            }
            // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
            function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
                metadataMap.set(MetadataKey, MetadataValue);
            }
            // 3.1.6.1 OrdinaryMetadataKeys(O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
            function OrdinaryMetadataKeys(O, P) {
                var ownKeys = OrdinaryOwnMetadataKeys(O, P);
                var parent = OrdinaryGetPrototypeOf(O);
                if (parent === null)
                    return ownKeys;
                var parentKeys = OrdinaryMetadataKeys(parent, P);
                if (parentKeys.length <= 0)
                    return ownKeys;
                if (ownKeys.length <= 0)
                    return parentKeys;
                var set = new _Set();
                var keys = [];
                for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                    var key = ownKeys_1[_i];
                    var hasKey = set.has(key);
                    if (!hasKey) {
                        set.add(key);
                        keys.push(key);
                    }
                }
                for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                    var key = parentKeys_1[_a];
                    var hasKey = set.has(key);
                    if (!hasKey) {
                        set.add(key);
                        keys.push(key);
                    }
                }
                return keys;
            }
            // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
            function OrdinaryOwnMetadataKeys(O, P) {
                var keys = [];
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return keys;
                var keysObj = metadataMap.keys();
                var iterator = GetIterator(keysObj);
                var k = 0;
                while (true) {
                    var next = IteratorStep(iterator);
                    if (!next) {
                        keys.length = k;
                        return keys;
                    }
                    var nextValue = IteratorValue(next);
                    try {
                        keys[k] = nextValue;
                    }
                    catch (e) {
                        try {
                            IteratorClose(iterator);
                        }
                        finally {
                            throw e;
                        }
                    }
                    k++;
                }
            }
            // 6 ECMAScript Data Typ0es and Values
            // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
            function Type(x) {
                if (x === null)
                    return 1 /* Null */;
                switch (typeof x) {
                    case "undefined": return 0 /* Undefined */;
                    case "boolean": return 2 /* Boolean */;
                    case "string": return 3 /* String */;
                    case "symbol": return 4 /* Symbol */;
                    case "number": return 5 /* Number */;
                    case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
                    default: return 6 /* Object */;
                }
            }
            // 6.1.1 The Undefined Type
            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
            function IsUndefined(x) {
                return x === undefined;
            }
            // 6.1.2 The Null Type
            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
            function IsNull(x) {
                return x === null;
            }
            // 6.1.5 The Symbol Type
            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
            function IsSymbol(x) {
                return typeof x === "symbol";
            }
            // 6.1.7 The Object Type
            // https://tc39.github.io/ecma262/#sec-object-type
            function IsObject(x) {
                return typeof x === "object" ? x !== null : typeof x === "function";
            }
            // 7.1 Type Conversion
            // https://tc39.github.io/ecma262/#sec-type-conversion
            // 7.1.1 ToPrimitive(input [, PreferredType])
            // https://tc39.github.io/ecma262/#sec-toprimitive
            function ToPrimitive(input, PreferredType) {
                switch (Type(input)) {
                    case 0 /* Undefined */: return input;
                    case 1 /* Null */: return input;
                    case 2 /* Boolean */: return input;
                    case 3 /* String */: return input;
                    case 4 /* Symbol */: return input;
                    case 5 /* Number */: return input;
                }
                var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
                var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
                if (exoticToPrim !== undefined) {
                    var result = exoticToPrim.call(input, hint);
                    if (IsObject(result))
                        throw new TypeError();
                    return result;
                }
                return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
            }
            // 7.1.1.1 OrdinaryToPrimitive(O, hint)
            // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
            function OrdinaryToPrimitive(O, hint) {
                if (hint === "string") {
                    var toString_1 = O.toString;
                    if (IsCallable(toString_1)) {
                        var result = toString_1.call(O);
                        if (!IsObject(result))
                            return result;
                    }
                    var valueOf = O.valueOf;
                    if (IsCallable(valueOf)) {
                        var result = valueOf.call(O);
                        if (!IsObject(result))
                            return result;
                    }
                }
                else {
                    var valueOf = O.valueOf;
                    if (IsCallable(valueOf)) {
                        var result = valueOf.call(O);
                        if (!IsObject(result))
                            return result;
                    }
                    var toString_2 = O.toString;
                    if (IsCallable(toString_2)) {
                        var result = toString_2.call(O);
                        if (!IsObject(result))
                            return result;
                    }
                }
                throw new TypeError();
            }
            // 7.1.2 ToBoolean(argument)
            // https://tc39.github.io/ecma262/2016/#sec-toboolean
            function ToBoolean(argument) {
                return !!argument;
            }
            // 7.1.12 ToString(argument)
            // https://tc39.github.io/ecma262/#sec-tostring
            function ToString(argument) {
                return "" + argument;
            }
            // 7.1.14 ToPropertyKey(argument)
            // https://tc39.github.io/ecma262/#sec-topropertykey
            function ToPropertyKey(argument) {
                var key = ToPrimitive(argument, 3 /* String */);
                if (IsSymbol(key))
                    return key;
                return ToString(key);
            }
            // 7.2 Testing and Comparison Operations
            // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
            // 7.2.2 IsArray(argument)
            // https://tc39.github.io/ecma262/#sec-isarray
            function IsArray(argument) {
                return Array.isArray
                    ? Array.isArray(argument)
                    : argument instanceof Object
                        ? argument instanceof Array
                        : Object.prototype.toString.call(argument) === "[object Array]";
            }
            // 7.2.3 IsCallable(argument)
            // https://tc39.github.io/ecma262/#sec-iscallable
            function IsCallable(argument) {
                // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
                return typeof argument === "function";
            }
            // 7.2.4 IsConstructor(argument)
            // https://tc39.github.io/ecma262/#sec-isconstructor
            function IsConstructor(argument) {
                // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
                return typeof argument === "function";
            }
            // 7.2.7 IsPropertyKey(argument)
            // https://tc39.github.io/ecma262/#sec-ispropertykey
            function IsPropertyKey(argument) {
                switch (Type(argument)) {
                    case 3 /* String */: return true;
                    case 4 /* Symbol */: return true;
                    default: return false;
                }
            }
            // 7.3 Operations on Objects
            // https://tc39.github.io/ecma262/#sec-operations-on-objects
            // 7.3.9 GetMethod(V, P)
            // https://tc39.github.io/ecma262/#sec-getmethod
            function GetMethod(V, P) {
                var func = V[P];
                if (func === undefined || func === null)
                    return undefined;
                if (!IsCallable(func))
                    throw new TypeError();
                return func;
            }
            // 7.4 Operations on Iterator Objects
            // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
            function GetIterator(obj) {
                var method = GetMethod(obj, iteratorSymbol);
                if (!IsCallable(method))
                    throw new TypeError(); // from Call
                var iterator = method.call(obj);
                if (!IsObject(iterator))
                    throw new TypeError();
                return iterator;
            }
            // 7.4.4 IteratorValue(iterResult)
            // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
            function IteratorValue(iterResult) {
                return iterResult.value;
            }
            // 7.4.5 IteratorStep(iterator)
            // https://tc39.github.io/ecma262/#sec-iteratorstep
            function IteratorStep(iterator) {
                var result = iterator.next();
                return result.done ? false : result;
            }
            // 7.4.6 IteratorClose(iterator, completion)
            // https://tc39.github.io/ecma262/#sec-iteratorclose
            function IteratorClose(iterator) {
                var f = iterator["return"];
                if (f)
                    f.call(iterator);
            }
            // 9.1 Ordinary Object Internal Methods and Internal Slots
            // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
            // 9.1.1.1 OrdinaryGetPrototypeOf(O)
            // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
            function OrdinaryGetPrototypeOf(O) {
                var proto = Object.getPrototypeOf(O);
                if (typeof O !== "function" || O === functionPrototype)
                    return proto;
                // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
                // Try to determine the superclass constructor. Compatible implementations
                // must either set __proto__ on a subclass constructor to the superclass constructor,
                // or ensure each class has a valid `constructor` property on its prototype that
                // points back to the constructor.
                // If this is not the same as Function.[[Prototype]], then this is definately inherited.
                // This is the case when in ES6 or when using __proto__ in a compatible browser.
                if (proto !== functionPrototype)
                    return proto;
                // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
                var prototype = O.prototype;
                var prototypeProto = prototype && Object.getPrototypeOf(prototype);
                if (prototypeProto == null || prototypeProto === Object.prototype)
                    return proto;
                // If the constructor was not a function, then we cannot determine the heritage.
                var constructor = prototypeProto.constructor;
                if (typeof constructor !== "function")
                    return proto;
                // If we have some kind of self-reference, then we cannot determine the heritage.
                if (constructor === O)
                    return proto;
                // we have a pretty good guess at the heritage.
                return constructor;
            }
            // naive Map shim
            function CreateMapPolyfill() {
                var cacheSentinel = {};
                var arraySentinel = [];
                var MapIterator = /** @class */ (function () {
                    function MapIterator(keys, values, selector) {
                        this._index = 0;
                        this._keys = keys;
                        this._values = values;
                        this._selector = selector;
                    }
                    MapIterator.prototype["@@iterator"] = function () { return this; };
                    MapIterator.prototype[iteratorSymbol] = function () { return this; };
                    MapIterator.prototype.next = function () {
                        var index = this._index;
                        if (index >= 0 && index < this._keys.length) {
                            var result = this._selector(this._keys[index], this._values[index]);
                            if (index + 1 >= this._keys.length) {
                                this._index = -1;
                                this._keys = arraySentinel;
                                this._values = arraySentinel;
                            }
                            else {
                                this._index++;
                            }
                            return { value: result, done: false };
                        }
                        return { value: undefined, done: true };
                    };
                    MapIterator.prototype.throw = function (error) {
                        if (this._index >= 0) {
                            this._index = -1;
                            this._keys = arraySentinel;
                            this._values = arraySentinel;
                        }
                        throw error;
                    };
                    MapIterator.prototype.return = function (value) {
                        if (this._index >= 0) {
                            this._index = -1;
                            this._keys = arraySentinel;
                            this._values = arraySentinel;
                        }
                        return { value: value, done: true };
                    };
                    return MapIterator;
                }());
                return /** @class */ (function () {
                    function Map() {
                        this._keys = [];
                        this._values = [];
                        this._cacheKey = cacheSentinel;
                        this._cacheIndex = -2;
                    }
                    Object.defineProperty(Map.prototype, "size", {
                        get: function () { return this._keys.length; },
                        enumerable: true,
                        configurable: true
                    });
                    Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
                    Map.prototype.get = function (key) {
                        var index = this._find(key, /*insert*/ false);
                        return index >= 0 ? this._values[index] : undefined;
                    };
                    Map.prototype.set = function (key, value) {
                        var index = this._find(key, /*insert*/ true);
                        this._values[index] = value;
                        return this;
                    };
                    Map.prototype.delete = function (key) {
                        var index = this._find(key, /*insert*/ false);
                        if (index >= 0) {
                            var size = this._keys.length;
                            for (var i = index + 1; i < size; i++) {
                                this._keys[i - 1] = this._keys[i];
                                this._values[i - 1] = this._values[i];
                            }
                            this._keys.length--;
                            this._values.length--;
                            if (key === this._cacheKey) {
                                this._cacheKey = cacheSentinel;
                                this._cacheIndex = -2;
                            }
                            return true;
                        }
                        return false;
                    };
                    Map.prototype.clear = function () {
                        this._keys.length = 0;
                        this._values.length = 0;
                        this._cacheKey = cacheSentinel;
                        this._cacheIndex = -2;
                    };
                    Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
                    Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
                    Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
                    Map.prototype["@@iterator"] = function () { return this.entries(); };
                    Map.prototype[iteratorSymbol] = function () { return this.entries(); };
                    Map.prototype._find = function (key, insert) {
                        if (this._cacheKey !== key) {
                            this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
                        }
                        if (this._cacheIndex < 0 && insert) {
                            this._cacheIndex = this._keys.length;
                            this._keys.push(key);
                            this._values.push(undefined);
                        }
                        return this._cacheIndex;
                    };
                    return Map;
                }());
                function getKey(key, _) {
                    return key;
                }
                function getValue(_, value) {
                    return value;
                }
                function getEntry(key, value) {
                    return [key, value];
                }
            }
            // naive Set shim
            function CreateSetPolyfill() {
                return /** @class */ (function () {
                    function Set() {
                        this._map = new _Map();
                    }
                    Object.defineProperty(Set.prototype, "size", {
                        get: function () { return this._map.size; },
                        enumerable: true,
                        configurable: true
                    });
                    Set.prototype.has = function (value) { return this._map.has(value); };
                    Set.prototype.add = function (value) { return this._map.set(value, value), this; };
                    Set.prototype.delete = function (value) { return this._map.delete(value); };
                    Set.prototype.clear = function () { this._map.clear(); };
                    Set.prototype.keys = function () { return this._map.keys(); };
                    Set.prototype.values = function () { return this._map.values(); };
                    Set.prototype.entries = function () { return this._map.entries(); };
                    Set.prototype["@@iterator"] = function () { return this.keys(); };
                    Set.prototype[iteratorSymbol] = function () { return this.keys(); };
                    return Set;
                }());
            }
            // naive WeakMap shim
            function CreateWeakMapPolyfill() {
                var UUID_SIZE = 16;
                var keys = HashMap.create();
                var rootKey = CreateUniqueKey();
                return /** @class */ (function () {
                    function WeakMap() {
                        this._key = CreateUniqueKey();
                    }
                    WeakMap.prototype.has = function (target) {
                        var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                        return table !== undefined ? HashMap.has(table, this._key) : false;
                    };
                    WeakMap.prototype.get = function (target) {
                        var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                        return table !== undefined ? HashMap.get(table, this._key) : undefined;
                    };
                    WeakMap.prototype.set = function (target, value) {
                        var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                        table[this._key] = value;
                        return this;
                    };
                    WeakMap.prototype.delete = function (target) {
                        var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                        return table !== undefined ? delete table[this._key] : false;
                    };
                    WeakMap.prototype.clear = function () {
                        // NOTE: not a real clear, just makes the previous data unreachable
                        this._key = CreateUniqueKey();
                    };
                    return WeakMap;
                }());
                function CreateUniqueKey() {
                    var key;
                    do
                        key = "@@WeakMap@@" + CreateUUID();
                    while (HashMap.has(keys, key));
                    keys[key] = true;
                    return key;
                }
                function GetOrCreateWeakMapTable(target, create) {
                    if (!hasOwn.call(target, rootKey)) {
                        if (!create)
                            return undefined;
                        Object.defineProperty(target, rootKey, { value: HashMap.create() });
                    }
                    return target[rootKey];
                }
                function FillRandomBytes(buffer, size) {
                    for (var i = 0; i < size; ++i)
                        buffer[i] = Math.random() * 0xff | 0;
                    return buffer;
                }
                function GenRandomBytes(size) {
                    if (typeof Uint8Array === "function") {
                        if (typeof crypto !== "undefined")
                            return crypto.getRandomValues(new Uint8Array(size));
                        if (typeof msCrypto !== "undefined")
                            return msCrypto.getRandomValues(new Uint8Array(size));
                        return FillRandomBytes(new Uint8Array(size), size);
                    }
                    return FillRandomBytes(new Array(size), size);
                }
                function CreateUUID() {
                    var data = GenRandomBytes(UUID_SIZE);
                    // mark as random - RFC 4122 § 4.4
                    data[6] = data[6] & 0x4f | 0x40;
                    data[8] = data[8] & 0xbf | 0x80;
                    var result = "";
                    for (var offset = 0; offset < UUID_SIZE; ++offset) {
                        var byte = data[offset];
                        if (offset === 4 || offset === 6 || offset === 8)
                            result += "-";
                        if (byte < 16)
                            result += "0";
                        result += byte.toString(16).toLowerCase();
                    }
                    return result;
                }
            }
            // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
            function MakeDictionary(obj) {
                obj.__ = undefined;
                delete obj.__;
                return obj;
            }
        });
    })(Reflect$1 || (Reflect$1 = {}));

    /*
     * Copyright [2019] [Doric.Pub]
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function hookBeforeNativeCall(context) {
        if (context) {
            Reflect.defineMetadata('__doric_context__', context, global$1);
            context.hookBeforeNativeCall();
        }
    }
    function hookAfterNativeCall(context) {
        if (context) {
            context.hookAfterNativeCall();
        }
    }
    function getContext() {
        return Reflect.getMetadata('__doric_context__', global$1);
    }
    function setContext(context) {
        Reflect.defineMetadata('__doric_context__', context, global$1);
    }
    function jsCallResolve(contextId, callbackId, args) {
        const context = gContexts.get(contextId);
        if (context === undefined) {
            loge(`Cannot find context for context id:${contextId}`);
            return;
        }
        const callback = context.callbacks.get(callbackId);
        if (callback === undefined) {
            loge(`Cannot find call for context id:${contextId},callback id:${callbackId}`);
            return;
        }
        const argumentsList = [];
        for (let i = 2; i < arguments.length; i++) {
            argumentsList.push(arguments[i]);
        }
        hookBeforeNativeCall(context);
        Reflect.apply(callback.resolve, context, argumentsList);
        hookAfterNativeCall(context);
    }
    function jsCallReject(contextId, callbackId, args) {
        const context = gContexts.get(contextId);
        if (context === undefined) {
            loge(`Cannot find context for context id:${contextId}`);
            return;
        }
        const callback = context.callbacks.get(callbackId);
        if (callback === undefined) {
            loge(`Cannot find call for context id:${contextId},callback id:${callbackId}`);
            return;
        }
        const argumentsList = [];
        for (let i = 2; i < arguments.length; i++) {
            argumentsList.push(arguments[i]);
        }
        hookBeforeNativeCall(context);
        Reflect.apply(callback.reject, context.entity, argumentsList);
        hookAfterNativeCall(context);
    }
    class Context {
        constructor(id) {
            this.callbacks = new Map;
            this.id = id;
            return new Proxy(this, {
                get: (target, p) => {
                    if (Reflect.has(target, p)) {
                        return Reflect.get(target, p);
                    }
                    else {
                        const namespace = p;
                        return new Proxy({}, {
                            get: (target, p) => {
                                if (Reflect.has(target, p)) {
                                    return Reflect.get(target, p);
                                }
                                else {
                                    const context = this;
                                    return function () {
                                        const args = [];
                                        args.push(namespace);
                                        args.push(p);
                                        for (let arg of arguments) {
                                            args.push(arg);
                                        }
                                        return Reflect.apply(context.callNative, context, args);
                                    };
                                }
                            }
                        });
                    }
                }
            });
        }
        hookBeforeNativeCall() {
            if (this.entity && Reflect.has(this.entity, 'hookBeforeNativeCall')) {
                Reflect.apply(Reflect.get(this.entity, 'hookBeforeNativeCall'), this.entity, []);
            }
        }
        hookAfterNativeCall() {
            if (this.entity && Reflect.has(this.entity, 'hookAfterNativeCall')) {
                Reflect.apply(Reflect.get(this.entity, 'hookAfterNativeCall'), this.entity, []);
            }
        }
        callNative(namespace, method, args) {
            const callbackId = uniqueId('callback');
            nativeBridge(this.id, namespace, method, callbackId, args);
            return new Promise((resolve, reject) => {
                this.callbacks.set(callbackId, {
                    resolve,
                    reject,
                });
            });
        }
        register(instance) {
            this.entity = instance;
        }
        function2Id(func) {
            const functionId = uniqueId('function');
            this.callbacks.set(functionId, {
                resolve: func,
                reject: () => { loge("This should not be called"); }
            });
            return functionId;
        }
        removeFuncById(funcId) {
            this.callbacks.delete(funcId);
        }
    }
    const gContexts = new Map;
    const gModules = new Map;
    function jsObtainContext(id) {
        if (gContexts.has(id)) {
            const context = gContexts.get(id);
            setContext(context);
            return context;
        }
        else {
            const context = new Context(id);
            gContexts.set(id, context);
            setContext(context);
            return context;
        }
    }
    function jsReleaseContext(id) {
        const context = gContexts.get(id);
        const args = arguments;
        if (context) {
            timerInfos.forEach((v, k) => {
                if (v.context === context) {
                    if (global$1.nativeClearTimer === undefined) {
                        return Reflect.apply(_clearTimeout, undefined, args);
                    }
                    timerInfos.delete(k);
                    nativeClearTimer(k);
                }
            });
        }
        gContexts.delete(id);
    }
    function __require__(name) {
        if (gModules.has(name)) {
            return gModules.get(name);
        }
        else {
            if (nativeRequire(name)) {
                return gModules.get(name);
            }
            else {
                return undefined;
            }
        }
    }
    function jsRegisterModule(name, moduleObject) {
        gModules.set(name, moduleObject);
    }
    function jsCallEntityMethod(contextId, methodName, args) {
        const context = gContexts.get(contextId);
        if (context === undefined) {
            loge(`Cannot find context for context id:${contextId}`);
            return;
        }
        if (context.entity === undefined) {
            loge(`Cannot find holder for context id:${contextId}`);
            return;
        }
        if (Reflect.has(context.entity, methodName)) {
            const argumentsList = [];
            for (let i = 2; i < arguments.length; i++) {
                argumentsList.push(arguments[i]);
            }
            hookBeforeNativeCall(context);
            const ret = Reflect.apply(Reflect.get(context.entity, methodName), context.entity, argumentsList);
            hookAfterNativeCall(context);
            return ret;
        }
        else {
            loge(`Cannot find method for context id:${contextId},method name is:${methodName}`);
        }
    }
    function jsObtainEntry(contextId) {
        const context = jsObtainContext(contextId);
        return (constructor) => {
            const ret = class extends constructor {
                constructor() {
                    super(...arguments);
                    this.context = context;
                }
            };
            if (context) {
                context.register(new ret);
            }
            return ret;
        };
    }
    const global$1 = Function('return this')();
    let __timerId__ = 0;
    const timerInfos = new Map;
    const _setTimeout = global$1.setTimeout;
    const _setInterval = global$1.setInterval;
    const _clearTimeout = global$1.clearTimeout;
    const _clearInterval = global$1.clearInterval;
    const doricSetTimeout = function (handler, timeout, ...args) {
        if (global$1.nativeSetTimer === undefined) {
            return Reflect.apply(_setTimeout, undefined, arguments);
        }
        const id = __timerId__++;
        timerInfos.set(id, {
            callback: () => {
                Reflect.apply(handler, undefined, args);
                timerInfos.delete(id);
            },
            context: getContext(),
        });
        nativeSetTimer(id, timeout || 0, false);
        return id;
    };
    const doricSetInterval = function (handler, timeout, ...args) {
        if (global$1.nativeSetTimer === undefined) {
            return Reflect.apply(_setInterval, undefined, arguments);
        }
        const id = __timerId__++;
        timerInfos.set(id, {
            callback: () => {
                Reflect.apply(handler, undefined, args);
            },
            context: getContext(),
        });
        nativeSetTimer(id, timeout || 0, true);
        return id;
    };
    const doricClearTimeout = function (timerId) {
        if (global$1.nativeClearTimer === undefined) {
            return Reflect.apply(_clearTimeout, undefined, arguments);
        }
        timerInfos.delete(timerId);
        nativeClearTimer(timerId);
    };
    const doricClearInterval = function (timerId) {
        if (global$1.nativeClearTimer === undefined) {
            return Reflect.apply(_clearInterval, undefined, arguments);
        }
        timerInfos.delete(timerId);
        nativeClearTimer(timerId);
    };
    if (!global$1.setTimeout) {
        global$1.setTimeout = doricSetTimeout;
    }
    else {
        global$1.doricSetTimeout = doricSetTimeout;
    }
    if (!global$1.setInterval) {
        global$1.setInterval = doricSetInterval;
    }
    else {
        global$1.doricSetInterval = doricSetInterval;
    }
    if (!global$1.clearTimeout) {
        global$1.clearTimeout = doricClearTimeout;
    }
    else {
        global$1.doricClearTimeout = doricClearTimeout;
    }
    if (!global$1.clearInterval) {
        global$1.clearInterval = doricClearInterval;
    }
    else {
        global$1.doricClearInterval = doricClearInterval;
    }
    function jsCallbackTimer(timerId) {
        const timerInfo = timerInfos.get(timerId);
        if (timerInfo === undefined) {
            return;
        }
        if (timerInfo.callback instanceof Function) {
            hookBeforeNativeCall(timerInfo.context);
            Reflect.apply(timerInfo.callback, timerInfo.context, []);
            hookAfterNativeCall(timerInfo.context);
        }
    }

    exports.Context = Context;
    exports.__require__ = __require__;
    exports.jsCallEntityMethod = jsCallEntityMethod;
    exports.jsCallReject = jsCallReject;
    exports.jsCallResolve = jsCallResolve;
    exports.jsCallbackTimer = jsCallbackTimer;
    exports.jsObtainContext = jsObtainContext;
    exports.jsObtainEntry = jsObtainEntry;
    exports.jsRegisterModule = jsRegisterModule;
    exports.jsReleaseContext = jsReleaseContext;

    return exports;

}({}));

/**--------SandBox--------*/

/**++++++++Lib++++++++*/
Reflect.apply(doric.jsRegisterModule,this,["doric",Reflect.apply(function(__module){(function(module,exports,require){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function obj2Model(obj) {
    if (obj instanceof Array) {
        return obj.map(e => obj2Model(e));
    }
    else if (obj instanceof Object) {
        if (Reflect.has(obj, 'toModel') && Reflect.get(obj, 'toModel') instanceof Function) {
            obj = Reflect.apply(Reflect.get(obj, 'toModel'), obj, []);
            return obj;
        }
        else {
            for (let key in obj) {
                const val = Reflect.get(obj, key);
                Reflect.set(obj, key, obj2Model(val));
            }
            return obj;
        }
    }
    else {
        return obj;
    }
}
class Mutable {
    constructor(v) {
        this.binders = new Set;
        this.get = () => {
            return this.val;
        };
        this.set = (v) => {
            this.val = v;
            this.binders.forEach(e => {
                Reflect.apply(e, undefined, [this.val]);
            });
        };
        this.val = v;
    }
    bind(binder) {
        this.binders.add(binder);
        Reflect.apply(binder, undefined, [this.val]);
    }
    static of(v) {
        return new Mutable(v);
    }
}

/*
 * Copyright [2019] [Doric.Pub]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let __uniqueId__ = 0;
function uniqueId(prefix) {
    return `__${prefix}_${__uniqueId__++}__`;
}

function toString(message) {
    if (message instanceof Function) {
        return message.toString();
    }
    else if (message instanceof Object) {
        try {
            return JSON.stringify(message);
        }
        catch (e) {
            return message.toString();
        }
    }
    else if (message === undefined) {
        return "undefined";
    }
    else {
        return message.toString();
    }
}
function log(...args) {
    let out = "";
    for (let i = 0; i < arguments.length; i++) {
        if (i > 0) {
            out += ',';
        }
        out += toString(arguments[i]);
    }
    nativeLog('d', out);
}
function loge(...message) {
    let out = "";
    for (let i = 0; i < arguments.length; i++) {
        if (i > 0) {
            out += ',';
        }
        out += toString(arguments[i]);
    }
    nativeLog('e', out);
}
function logw(...message) {
    let out = "";
    for (let i = 0; i < arguments.length; i++) {
        if (i > 0) {
            out += ',';
        }
        out += toString(arguments[i]);
    }
    nativeLog('w', out);
}

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function Property(target, propKey) {
    Reflect.defineMetadata(propKey, true, target);
}
class View {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;
        this.viewId = uniqueId('ViewId');
        this.callbacks = new Map;
        /** Anchor end*/
        this.__dirty_props__ = {};
        this.nativeViewModel = {
            id: this.viewId,
            type: this.constructor.name,
            props: this.__dirty_props__,
        };
        return new Proxy(this, {
            get: (target, p, receiver) => {
                return Reflect.get(target, p, receiver);
            },
            set: (target, p, v, receiver) => {
                const oldV = Reflect.get(target, p, receiver);
                const ret = Reflect.set(target, p, v, receiver);
                if (Reflect.getMetadata(p, target) && oldV !== v) {
                    receiver.onPropertyChanged(p.toString(), oldV, v);
                }
                return ret;
            }
        });
    }
    callback2Id(f) {
        const id = uniqueId('Function');
        this.callbacks.set(id, f);
        return id;
    }
    id2Callback(id) {
        let f = this.callbacks.get(id);
        if (f === undefined) {
            f = Reflect.get(this, id);
        }
        return f;
    }
    /** Anchor start*/
    get left() {
        return this.x;
    }
    set left(v) {
        this.x = v;
    }
    get right() {
        return this.x + this.width;
    }
    set right(v) {
        this.x = v - this.width;
    }
    get top() {
        return this.y;
    }
    set top(v) {
        this.y = v;
    }
    get bottom() {
        return this.y + this.height;
    }
    set bottom(v) {
        this.y = v - this.height;
    }
    get centerX() {
        return this.x + this.width / 2;
    }
    get centerY() {
        return this.y + this.height / 2;
    }
    set centerX(v) {
        this.x = v - this.width / 2;
    }
    set centerY(v) {
        this.y = v - this.height / 2;
    }
    get dirtyProps() {
        return this.__dirty_props__;
    }
    onPropertyChanged(propKey, oldV, newV) {
        if (newV instanceof Function) {
            newV = this.callback2Id(newV);
        }
        else {
            newV = obj2Model(newV);
        }
        this.__dirty_props__[propKey] = newV;
    }
    clean() {
        for (const key in this.__dirty_props__) {
            if (Reflect.has(this.__dirty_props__, key)) {
                Reflect.deleteProperty(this.__dirty_props__, key);
            }
        }
    }
    isDirty() {
        return Reflect.ownKeys(this.__dirty_props__).length !== 0;
    }
    responseCallback(id, ...args) {
        const f = this.id2Callback(id);
        if (f instanceof Function) {
            const argumentsList = [];
            for (let i = 1; i < arguments.length; i++) {
                argumentsList.push(arguments[i]);
            }
            return Reflect.apply(f, this, argumentsList);
        }
        else {
            loge(`Cannot find callback:${id} for ${JSON.stringify(this.toModel())}`);
        }
    }
    toModel() {
        return this.nativeViewModel;
    }
    let(block) {
        block(this);
    }
    also(block) {
        block(this);
        return this;
    }
    apply(config) {
        for (let key in config) {
            Reflect.set(this, key, Reflect.get(config, key, config), this);
        }
        return this;
    }
    in(group) {
        group.addChild(this);
        return this;
    }
    nativeChannel(context, name) {
        let thisView = this;
        return function (args = undefined) {
            const viewIds = [];
            while (thisView != undefined) {
                viewIds.push(thisView.viewId);
                thisView = thisView.superview;
            }
            const params = {
                viewIds: viewIds.reverse(),
                name,
                args,
            };
            return context.callNative('shader', 'command', params);
        };
    }
    getWidth(context) {
        return this.nativeChannel(context, 'getWidth')();
    }
    getHeight(context) {
        return this.nativeChannel(context, 'getHeight')();
    }
    getX(context) {
        return this.nativeChannel(context, 'getX')();
    }
    getY(context) {
        return this.nativeChannel(context, 'getY')();
    }
    getLocationOnScreen(context) {
        return this.nativeChannel(context, "getLocationOnScreen")();
    }
    doAnimation(context, animation) {
        return this.nativeChannel(context, "doAnimation")(animation.toModel()).then((args) => {
            for (let key in args) {
                Reflect.set(this, key, Reflect.get(args, key, args), this);
                Reflect.deleteProperty(this.__dirty_props__, key);
            }
        });
    }
}
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "width", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "height", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "x", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "y", void 0);
__decorate([
    Property,
    __metadata("design:type", Object)
], View.prototype, "backgroundColor", void 0);
__decorate([
    Property,
    __metadata("design:type", Object)
], View.prototype, "corners", void 0);
__decorate([
    Property,
    __metadata("design:type", Object)
], View.prototype, "border", void 0);
__decorate([
    Property,
    __metadata("design:type", Object)
], View.prototype, "shadow", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "alpha", void 0);
__decorate([
    Property,
    __metadata("design:type", Boolean)
], View.prototype, "hidden", void 0);
__decorate([
    Property,
    __metadata("design:type", Object)
], View.prototype, "padding", void 0);
__decorate([
    Property,
    __metadata("design:type", Object)
], View.prototype, "layoutConfig", void 0);
__decorate([
    Property,
    __metadata("design:type", Function)
], View.prototype, "onClick", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "translationX", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "translationY", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "scaleX", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "scaleY", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "pivotX", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "pivotY", void 0);
__decorate([
    Property,
    __metadata("design:type", Number)
], View.prototype, "rotation", void 0);
__decorate([
    Property,
    __metadata("design:type", Object)
], View.prototype, "flexConfig", void 0);
class Superview extends View {
    subviewById(id) {
        for (let v of this.allSubviews()) {
            if (v.viewId === id) {
                return v;
            }
        }
    }
    isDirty() {
        if (super.isDirty()) {
            return true;
        }
        else {
            for (const v of this.allSubviews()) {
                if (v.isDirty()) {
                    return true;
                }
            }
        }
        return false;
    }
    clean() {
        for (let v of this.allSubviews()) {
            v.clean();
        }
        super.clean();
    }
    toModel() {
        const subviews = [];
        for (let v of this.allSubviews()) {
            if (v != undefined) {
                v.superview = this;
                if (v.isDirty()) {
                    subviews.push(v.toModel());
                }
            }
        }
        this.dirtyProps.subviews = subviews;
        return super.toModel();
    }
}
class Group extends Superview {
    constructor() {
        super(...arguments);
        this.children = new Proxy([], {
            set: (target, index, value) => {
                const ret = Reflect.set(target, index, value);
                // Let getDirty return true
                this.dirtyProps.children = this.children.map(e => e.viewId);
                return ret;
            }
        });
    }
    allSubviews() {
        return this.children;
    }
    addChild(view) {
        this.children.push(view);
    }
}

const SPECIFIED = 1;
const START = 1 << 1;
const END = 1 << 2;
const SHIFT_X = 0;
const SHIFT_Y = 4;
const LEFT = (START | SPECIFIED) << SHIFT_X;
const RIGHT = (END | SPECIFIED) << SHIFT_X;
const TOP = (START | SPECIFIED) << SHIFT_Y;
const BOTTOM = (END | SPECIFIED) << SHIFT_Y;
const CENTER_X = SPECIFIED << SHIFT_X;
const CENTER_Y = SPECIFIED << SHIFT_Y;
const CENTER = CENTER_X | CENTER_Y;
class Gravity {
    constructor() {
        this.val = 0;
    }
    left() {
        const val = this.val | LEFT;
        const ret = new Gravity;
        ret.val = val;
        return ret;
    }
    right() {
        const val = this.val | RIGHT;
        const ret = new Gravity;
        ret.val = val;
        return ret;
    }
    top() {
        const val = this.val | TOP;
        const ret = new Gravity;
        ret.val = val;
        return ret;
    }
    bottom() {
        const val = this.val | BOTTOM;
        const ret = new Gravity;
        ret.val = val;
        return ret;
    }
    center() {
        const val = this.val | CENTER;
        const ret = new Gravity;
        ret.val = val;
        return ret;
    }
    centerX() {
        const val = this.val | CENTER_X;
        const ret = new Gravity;
        ret.val = val;
        return ret;
    }
    centerY() {
        const val = this.val | CENTER_Y;
        const ret = new Gravity;
        ret.val = val;
        return ret;
    }
    toModel() {
        return this.val;
    }
}
Gravity.origin = new Gravity;
Gravity.Center = Gravity.origin.center();
Gravity.CenterX = Gravity.origin.centerX();
Gravity.CenterY = Gravity.origin.centerY();
Gravity.Left = Gravity.origin.left();
Gravity.Right = Gravity.origin.right();
Gravity.Top = Gravity.origin.top();
Gravity.Bottom = Gravity.origin.bottom();
function gravity() {
    return new Gravity;
}

(function (LayoutSpec) {
    /**
     * Depends on what's been set on width or height.
    */
    LayoutSpec[LayoutSpec["JUST"] = 0] = "JUST";
    /**
     * Depends on it's content.
     */
    LayoutSpec[LayoutSpec["FIT"] = 1] = "FIT";
    /**
     * Extend as much as parent let it take.
     */
    LayoutSpec[LayoutSpec["MOST"] = 2] = "MOST";
})(exports.LayoutSpec || (exports.LayoutSpec = {}));
class LayoutConfigImpl {
    fit() {
        this.widthSpec = exports.LayoutSpec.FIT;
        this.heightSpec = exports.LayoutSpec.FIT;
        return this;
    }
    most() {
        this.widthSpec = exports.LayoutSpec.MOST;
        this.heightSpec = exports.LayoutSpec.MOST;
        return this;
    }
    just() {
        this.widthSpec = exports.LayoutSpec.JUST;
        this.heightSpec = exports.LayoutSpec.JUST;
        return this;
    }
    configWidth(w) {
        this.widthSpec = w;
        return this;
    }
    configHeight(h) {
        this.heightSpec = h;
        return this;
    }
    configMargin(m) {
        this.margin = m;
        return this;
    }
    configAlignment(a) {
        this.alignment = a;
        return this;
    }
    configWeight(w) {
        this.weight = w;
        return this;
    }
    configMaxWidth(v) {
        this.maxWidth = v;
        return this;
    }
    configMaxHeight(v) {
        this.maxHeight = v;
        return this;
    }
    configMinWidth(v) {
        this.minWidth = v;
        return this;
    }
    configMinHeight(v) {
        this.minHeight = v;
        return this;
    }
    toModel() {
        return {
            widthSpec: this.widthSpec,
            heightSpec: this.heightSpec,
            margin: this.margin,
            alignment: this.alignment ? this.alignment.toModel() : undefined,
            weight: this.weight,
        };
    }
}
function layoutConfig() {
    return new LayoutConfigImpl;
}

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$1 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class Stack extends Group {
}
class Root extends Stack {
}
class LinearLayout extends Group {
}
__decorate$1([
    Property,
    __metadata$1("design:type", Number)
], LinearLayout.prototype, "space", void 0);
__decorate$1([
    Property,
    __metadata$1("design:type", Gravity)
], LinearLayout.prototype, "gravity", void 0);
class VLayout extends LinearLayout {
}
class HLayout extends LinearLayout {
}
function stack(views, config) {
    const ret = new Stack;
    ret.layoutConfig = layoutConfig().fit();
    for (let v of views) {
        ret.addChild(v);
    }
    if (config) {
        for (let key in config) {
            Reflect.set(ret, key, Reflect.get(config, key, config), ret);
        }
    }
    return ret;
}
function hlayout(views, config) {
    const ret = new HLayout;
    ret.layoutConfig = layoutConfig().fit();
    for (let v of views) {
        ret.addChild(v);
    }
    if (config) {
        for (let key in config) {
            Reflect.set(ret, key, Reflect.get(config, key, config), ret);
        }
    }
    return ret;
}
function vlayout(views, config) {
    const ret = new VLayout;
    ret.layoutConfig = layoutConfig().fit();
    for (let v of views) {
        ret.addChild(v);
    }
    if (config) {
        for (let key in config) {
            Reflect.set(ret, key, Reflect.get(config, key, config), ret);
        }
    }
    return ret;
}
class FlexLayout extends Group {
}
function flexlayout(views, config) {
    const ret = new FlexLayout;
    ret.layoutConfig = layoutConfig().fit();
    for (let v of views) {
        ret.addChild(v);
    }
    if (config) {
        for (let key in config) {
            Reflect.set(ret, key, Reflect.get(config, key, config), ret);
        }
    }
    return ret;
}

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$2 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function NativeCall(target, propertyKey, descriptor) {
    const originVal = descriptor.value;
    descriptor.value = function () {
        const ret = Reflect.apply(originVal, this, arguments);
        return ret;
    };
    return descriptor;
}
class Panel {
    constructor() {
        this.__root__ = new Root;
        this.headviews = new Map;
        this.onRenderFinishedCallback = [];
    }
    onCreate() { }
    onDestroy() { }
    onShow() { }
    onHidden() { }
    addHeadView(type, v) {
        let map = this.headviews.get(type);
        if (map) {
            map.set(v.viewId, v);
        }
        else {
            map = new Map;
            map.set(v.viewId, v);
            this.headviews.set(type, map);
        }
    }
    allHeadViews() {
        return this.headviews.values();
    }
    removeHeadView(type, v) {
        if (this.headviews.has(type)) {
            let map = this.headviews.get(type);
            if (map) {
                if (v instanceof View) {
                    map.delete(v.viewId);
                }
                else {
                    map.delete(v);
                }
            }
        }
    }
    clearHeadViews(type) {
        if (this.headviews.has(type)) {
            this.headviews.delete(type);
        }
    }
    getRootView() {
        return this.__root__;
    }
    getInitData() {
        return this.__data__;
    }
    __init__(data) {
        if (data) {
            this.__data__ = JSON.parse(data);
        }
    }
    __onCreate__() {
        this.onCreate();
    }
    __onDestroy__() {
        this.onDestroy();
    }
    __onShow__() {
        this.onShow();
    }
    __onHidden__() {
        this.onHidden();
    }
    __build__(frame) {
        this.__root__.width = frame.width;
        this.__root__.height = frame.height;
        this.__root__.children.length = 0;
        this.build(this.__root__);
    }
    __response__(viewIds, callbackId) {
        const v = this.retrospectView(viewIds);
        if (v === undefined) {
            loge(`Cannot find view for ${viewIds}`);
        }
        else {
            const argumentsList = [callbackId];
            for (let i = 2; i < arguments.length; i++) {
                argumentsList.push(arguments[i]);
            }
            return Reflect.apply(v.responseCallback, v, argumentsList);
        }
    }
    retrospectView(ids) {
        return ids.reduce((acc, cur) => {
            if (acc === undefined) {
                if (cur === this.__root__.viewId) {
                    return this.__root__;
                }
                for (let map of this.headviews.values()) {
                    if (map.has(cur)) {
                        return map.get(cur);
                    }
                }
                return undefined;
            }
            else {
                if (Reflect.has(acc, "subviewById")) {
                    return Reflect.apply(Reflect.get(acc, "subviewById"), acc, [cur]);
                }
                return acc;
            }
        }, undefined);
    }
    nativeRender(model) {
        return this.context.callNative("shader", "render", model);
    }
    hookBeforeNativeCall() {
        if (Environment.platform !== 'web') {
            this.__root__.clean();
            for (let map of this.headviews.values()) {
                for (let v of map.values()) {
                    v.clean();
                }
            }
        }
    }
    hookAfterNativeCall() {
        const promises = [];
        if (Environment.platform !== 'web') {
            //Here insert a native call to ensure the promise is resolved done.
            nativeEmpty();
            if (this.__root__.isDirty()) {
                const model = this.__root__.toModel();
                promises.push(this.nativeRender(model));
            }
            for (let map of this.headviews.values()) {
                for (let v of map.values()) {
                    if (v.isDirty()) {
                        const model = v.toModel();
                        promises.push(this.nativeRender(model));
                    }
                }
            }
        }
        else {
            Promise.resolve().then(() => {
                if (this.__root__.isDirty()) {
                    const model = this.__root__.toModel();
                    promises.push(this.nativeRender(model));
                    this.__root__.clean();
                }
                for (let map of this.headviews.values()) {
                    for (let v of map.values()) {
                        if (v.isDirty()) {
                            const model = v.toModel();
                            promises.push(this.nativeRender(model));
                            v.clean();
                        }
                    }
                }
            });
        }
        Promise.all(promises).then(_ => {
            this.onRenderFinished();
        });
    }
    onRenderFinished() {
        this.onRenderFinishedCallback.forEach(e => {
            e();
        });
        this.onRenderFinishedCallback.length = 0;
    }
    addOnRenderFinishedCallback(cb) {
        this.onRenderFinishedCallback.push(cb);
    }
}
__decorate$2([
    NativeCall,
    __metadata$2("design:type", Function),
    __metadata$2("design:paramtypes", [String]),
    __metadata$2("design:returntype", void 0)
], Panel.prototype, "__init__", null);
__decorate$2([
    NativeCall,
    __metadata$2("design:type", Function),
    __metadata$2("design:paramtypes", []),
    __metadata$2("design:returntype", void 0)
], Panel.prototype, "__onCreate__", null);
__decorate$2([
    NativeCall,
    __metadata$2("design:type", Function),
    __metadata$2("design:paramtypes", []),
    __metadata$2("design:returntype", void 0)
], Panel.prototype, "__onDestroy__", null);
__decorate$2([
    NativeCall,
    __metadata$2("design:type", Function),
    __metadata$2("design:paramtypes", []),
    __metadata$2("design:returntype", void 0)
], Panel.prototype, "__onShow__", null);
__decorate$2([
    NativeCall,
    __metadata$2("design:type", Function),
    __metadata$2("design:paramtypes", []),
    __metadata$2("design:returntype", void 0)
], Panel.prototype, "__onHidden__", null);
__decorate$2([
    NativeCall,
    __metadata$2("design:type", Function),
    __metadata$2("design:paramtypes", [Object]),
    __metadata$2("design:returntype", void 0)
], Panel.prototype, "__build__", null);
__decorate$2([
    NativeCall,
    __metadata$2("design:type", Function),
    __metadata$2("design:paramtypes", [Array, String]),
    __metadata$2("design:returntype", void 0)
], Panel.prototype, "__response__", null);

/*
 * Copyright [2019] [Doric.Pub]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function (RepeatMode) {
    RepeatMode[RepeatMode["RESTART"] = 1] = "RESTART";
    RepeatMode[RepeatMode["REVERSE"] = 2] = "REVERSE";
})(exports.RepeatMode || (exports.RepeatMode = {}));
(function (FillMode) {
    /**
     * The receiver is removed from the presentation when the animation is completed.
     */
    FillMode[FillMode["Removed"] = 0] = "Removed";
    /**
     * The receiver remains visible in its final state when the animation is completed.
     */
    FillMode[FillMode["Forward"] = 1] = "Forward";
    /**
     * The receiver clamps values before zero to zero when the animation is completed.
     */
    FillMode[FillMode["Backward"] = 2] = "Backward";
    /**
     * The receiver clamps values at both ends of the object’s time space
     */
    FillMode[FillMode["Both"] = 3] = "Both";
})(exports.FillMode || (exports.FillMode = {}));
(function (TimingFunction) {
    /**
     * The system default timing function. Use this function to ensure that the timing of your animations matches that of most system animations.
     */
    TimingFunction[TimingFunction["Default"] = 0] = "Default";
    /**
     * Linear pacing, which causes an animation to occur evenly over its duration.
     */
    TimingFunction[TimingFunction["Linear"] = 1] = "Linear";
    /**
     * Ease-in pacing, which causes an animation to begin slowly and then speed up as it progresses.
     */
    TimingFunction[TimingFunction["EaseIn"] = 2] = "EaseIn";
    /**
     * Ease-out pacing, which causes an animation to begin quickly and then slow as it progresses.
     */
    TimingFunction[TimingFunction["EaseOut"] = 3] = "EaseOut";
    /**
     * Ease-in-ease-out pacing, which causes an animation to begin slowly, accelerate through the middle of its duration, and then slow again before completing.
     */
    TimingFunction[TimingFunction["EaseInEaseOut"] = 4] = "EaseInEaseOut";
})(exports.TimingFunction || (exports.TimingFunction = {}));
class Animation {
    constructor() {
        this.changeables = new Map;
        this.duration = 0;
        this.fillMode = exports.FillMode.Forward;
    }
    toModel() {
        const changeables = [];
        for (let e of this.changeables.values()) {
            changeables.push({
                key: e.key,
                fromValue: e.fromValue,
                toValue: e.toValue,
            });
        }
        return {
            type: this.constructor.name,
            delay: this.delay,
            duration: this.duration,
            changeables,
            repeatCount: this.repeatCount,
            repeatMode: this.repeatMode,
            fillMode: this.fillMode,
            timingFunction: this.timingFunction
        };
    }
}
class ScaleAnimation extends Animation {
    constructor() {
        super();
        this.scaleXChangeable = {
            key: "scaleX",
            fromValue: 1,
            toValue: 1,
        };
        this.scaleYChangeable = {
            key: "scaleY",
            fromValue: 1,
            toValue: 1,
        };
        this.changeables.set("scaleX", this.scaleXChangeable);
        this.changeables.set("scaleY", this.scaleYChangeable);
    }
    set fromScaleX(v) {
        this.scaleXChangeable.fromValue = v;
    }
    get fromScaleX() {
        return this.scaleXChangeable.fromValue;
    }
    set toScaleX(v) {
        this.scaleXChangeable.toValue = v;
    }
    get toScaleX() {
        return this.scaleXChangeable.toValue;
    }
    set fromScaleY(v) {
        this.scaleYChangeable.fromValue = v;
    }
    get fromScaleY() {
        return this.scaleYChangeable.fromValue;
    }
    set toScaleY(v) {
        this.scaleYChangeable.toValue = v;
    }
    get toScaleY() {
        return this.scaleYChangeable.toValue;
    }
}
class TranslationAnimation extends Animation {
    constructor() {
        super();
        this.translationXChangeable = {
            key: "translationX",
            fromValue: 1,
            toValue: 1,
        };
        this.translationYChangeable = {
            key: "translationY",
            fromValue: 1,
            toValue: 1,
        };
        this.changeables.set("translationX", this.translationXChangeable);
        this.changeables.set("translationY", this.translationYChangeable);
    }
    set fromTranslationX(v) {
        this.translationXChangeable.fromValue = v;
    }
    get fromTranslationX() {
        return this.translationXChangeable.fromValue;
    }
    set toTranslationX(v) {
        this.translationXChangeable.toValue = v;
    }
    get toTranslationX() {
        return this.translationXChangeable.toValue;
    }
    set fromTranslationY(v) {
        this.translationYChangeable.fromValue = v;
    }
    get fromTranslationY() {
        return this.translationYChangeable.fromValue;
    }
    set toTranslationY(v) {
        this.translationYChangeable.toValue = v;
    }
    get toTranslationY() {
        return this.translationYChangeable.toValue;
    }
}
class RotationAnimation extends Animation {
    constructor() {
        super();
        this.rotationChaneable = {
            key: "rotation",
            fromValue: 1,
            toValue: 1,
        };
        this.changeables.set("rotation", this.rotationChaneable);
    }
    set fromRotation(v) {
        this.rotationChaneable.fromValue = v;
    }
    get fromRotation() {
        return this.rotationChaneable.fromValue;
    }
    set toRotation(v) {
        this.rotationChaneable.toValue = v;
    }
    get toRotation() {
        return this.rotationChaneable.toValue;
    }
}
class AnimationSet {
    constructor() {
        this.animations = [];
        this._duration = 0;
    }
    addAnimation(anim) {
        this.animations.push(anim);
    }
    get duration() {
        return this._duration;
    }
    set duration(v) {
        this._duration = v;
        this.animations.forEach(e => e.duration = v);
    }
    toModel() {
        return {
            animations: this.animations.map(e => {
                return e.toModel();
            }),
            delay: this.delay,
        };
    }
}

/**
 *  Store color as format AARRGGBB or RRGGBB
 */
class Color {
    constructor(v) {
        this._value = 0;
        this._value = v | 0x0;
    }
    static parse(str) {
        if (!str.startsWith("#")) {
            throw new Error(`Parse color error with ${str}`);
        }
        const val = parseInt(str.substr(1), 16);
        if (str.length === 7) {
            return new Color(val | 0xff000000);
        }
        else if (str.length === 9) {
            return new Color(val);
        }
        else {
            throw new Error(`Parse color error with ${str}`);
        }
    }
    static safeParse(str, defVal = Color.TRANSPARENT) {
        let color = defVal;
        try {
            color = Color.parse(str);
        }
        catch (e) {
        }
        finally {
            return color;
        }
    }
    alpha(v) {
        v = v * 255;
        return new Color((this._value & 0xffffff) | ((v & 0xff) << 24));
    }
    toModel() {
        return this._value;
    }
}
Color.BLACK = new Color(0xFF000000);
Color.DKGRAY = new Color(0xFF444444);
Color.GRAY = new Color(0xFF888888);
Color.LTGRAY = new Color(0xFFCCCCCC);
Color.WHITE = new Color(0xFFFFFFFF);
Color.RED = new Color(0xFFFF0000);
Color.GREEN = new Color(0xFF00FF00);
Color.BLUE = new Color(0xFF0000FF);
Color.YELLOW = new Color(0xFFFFFF00);
Color.CYAN = new Color(0xFF00FFFF);
Color.MAGENTA = new Color(0xFFFF00FF);
Color.TRANSPARENT = new Color(0);
(function (GradientOrientation) {
    /** draw the gradient from the top to the bottom */
    GradientOrientation[GradientOrientation["TOP_BOTTOM"] = 0] = "TOP_BOTTOM";
    /** draw the gradient from the top-right to the bottom-left */
    GradientOrientation[GradientOrientation["TR_BL"] = 1] = "TR_BL";
    /** draw the gradient from the right to the left */
    GradientOrientation[GradientOrientation["RIGHT_LEFT"] = 2] = "RIGHT_LEFT";
    /** draw the gradient from the bottom-right to the top-left */
    GradientOrientation[GradientOrientation["BR_TL"] = 3] = "BR_TL";
    /** draw the gradient from the bottom to the top */
    GradientOrientation[GradientOrientation["BOTTOM_TOP"] = 4] = "BOTTOM_TOP";
    /** draw the gradient from the bottom-left to the top-right */
    GradientOrientation[GradientOrientation["BL_TR"] = 5] = "BL_TR";
    /** draw the gradient from the left to the right */
    GradientOrientation[GradientOrientation["LEFT_RIGHT"] = 6] = "LEFT_RIGHT";
    /** draw the gradient from the top-left to the bottom-right */
    GradientOrientation[GradientOrientation["TL_BR"] = 7] = "TL_BR";
})(exports.GradientOrientation || (exports.GradientOrientation = {}));

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$3 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class Text extends View {
}
__decorate$3([
    Property,
    __metadata$3("design:type", String)
], Text.prototype, "text", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", Color)
], Text.prototype, "textColor", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", Number)
], Text.prototype, "textSize", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", Number)
], Text.prototype, "maxLines", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", Gravity)
], Text.prototype, "textAlignment", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", String)
], Text.prototype, "fontStyle", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", String)
], Text.prototype, "font", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", Number)
], Text.prototype, "maxWidth", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", Number)
], Text.prototype, "maxHeight", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", Number)
], Text.prototype, "lineSpacing", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", Boolean)
], Text.prototype, "strikethrough", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", Boolean)
], Text.prototype, "underline", void 0);
__decorate$3([
    Property,
    __metadata$3("design:type", String)
], Text.prototype, "htmlText", void 0);
function text(config) {
    const ret = new Text;
    ret.layoutConfig = layoutConfig().fit();
    for (let key in config) {
        Reflect.set(ret, key, Reflect.get(config, key, config), ret);
    }
    return ret;
}

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$4 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
(function (ScaleType) {
    ScaleType[ScaleType["ScaleToFill"] = 0] = "ScaleToFill";
    ScaleType[ScaleType["ScaleAspectFit"] = 1] = "ScaleAspectFit";
    ScaleType[ScaleType["ScaleAspectFill"] = 2] = "ScaleAspectFill";
})(exports.ScaleType || (exports.ScaleType = {}));
class Image extends View {
}
__decorate$4([
    Property,
    __metadata$4("design:type", String)
], Image.prototype, "imageUrl", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", String)
], Image.prototype, "imagePath", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", String)
], Image.prototype, "imageRes", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", String)
], Image.prototype, "imageBase64", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", Number)
], Image.prototype, "scaleType", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", Boolean)
], Image.prototype, "isBlur", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", String)
], Image.prototype, "placeHolderImage", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", Color
    /**
     * Display while image is failed to load
     * It can be file name in local path
     */
    )
], Image.prototype, "placeHolderColor", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", String)
], Image.prototype, "errorImage", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", Color)
], Image.prototype, "errorColor", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", Function)
], Image.prototype, "loadCallback", void 0);
__decorate$4([
    Property,
    __metadata$4("design:type", Object)
], Image.prototype, "stretchInset", void 0);
function image(config) {
    const ret = new Image;
    ret.layoutConfig = layoutConfig().fit();
    for (let key in config) {
        Reflect.set(ret, key, Reflect.get(config, key, config), ret);
    }
    return ret;
}

/*
 * Copyright [2019] [Doric.Pub]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$5 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class ListItem extends Stack {
}
__decorate$5([
    Property,
    __metadata$5("design:type", String)
], ListItem.prototype, "identifier", void 0);
class List extends Superview {
    constructor() {
        super(...arguments);
        this.cachedViews = new Map;
        this.ignoreDirtyCallOnce = false;
        this.itemCount = 0;
        this.batchCount = 15;
    }
    allSubviews() {
        if (this.loadMoreView) {
            return [...this.cachedViews.values(), this.loadMoreView];
        }
        else {
            return this.cachedViews.values();
        }
    }
    scrollToItem(context, index, config) {
        var _a;
        const animated = (_a = config) === null || _a === void 0 ? void 0 : _a.animated;
        return this.nativeChannel(context, 'scrollToItem')({ index, animated, });
    }
    reset() {
        this.cachedViews.clear();
        this.itemCount = 0;
    }
    getItem(itemIdx) {
        let view = this.renderItem(itemIdx);
        view.superview = this;
        this.cachedViews.set(`${itemIdx}`, view);
        return view;
    }
    isDirty() {
        if (this.ignoreDirtyCallOnce) {
            this.ignoreDirtyCallOnce = false;
            //Ignore the dirty call once.
            return false;
        }
        return super.isDirty();
    }
    renderBunchedItems(start, length) {
        this.ignoreDirtyCallOnce = true;
        return new Array(Math.max(0, Math.min(length, this.itemCount - start))).fill(0).map((_, idx) => {
            const listItem = this.getItem(start + idx);
            return listItem.toModel();
        });
    }
    toModel() {
        if (this.loadMoreView) {
            this.dirtyProps['loadMoreView'] = this.loadMoreView.viewId;
        }
        return super.toModel();
    }
}
__decorate$5([
    Property,
    __metadata$5("design:type", Object)
], List.prototype, "itemCount", void 0);
__decorate$5([
    Property,
    __metadata$5("design:type", Function)
], List.prototype, "renderItem", void 0);
__decorate$5([
    Property,
    __metadata$5("design:type", Object)
], List.prototype, "batchCount", void 0);
__decorate$5([
    Property,
    __metadata$5("design:type", Function)
], List.prototype, "onLoadMore", void 0);
__decorate$5([
    Property,
    __metadata$5("design:type", Boolean)
], List.prototype, "loadMore", void 0);
__decorate$5([
    Property,
    __metadata$5("design:type", ListItem)
], List.prototype, "loadMoreView", void 0);
__decorate$5([
    Property,
    __metadata$5("design:type", Function)
], List.prototype, "onScroll", void 0);
__decorate$5([
    Property,
    __metadata$5("design:type", Function)
], List.prototype, "onScrollEnd", void 0);
__decorate$5([
    Property,
    __metadata$5("design:type", Number)
], List.prototype, "scrolledPosition", void 0);
function list(config) {
    const ret = new List;
    for (let key in config) {
        Reflect.set(ret, key, Reflect.get(config, key, config), ret);
    }
    return ret;
}
function listItem(item, config) {
    return (new ListItem).also((it) => {
        it.layoutConfig = layoutConfig().fit();
        if (item instanceof View) {
            it.addChild(item);
        }
        else {
            item.forEach(e => {
                it.addChild(e);
            });
        }
        if (config) {
            for (let key in config) {
                Reflect.set(it, key, Reflect.get(config, key, config), it);
            }
        }
    });
}

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$6 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class SlideItem extends Stack {
}
__decorate$6([
    Property,
    __metadata$6("design:type", String)
], SlideItem.prototype, "identifier", void 0);
class Slider extends Superview {
    constructor() {
        super(...arguments);
        this.cachedViews = new Map;
        this.ignoreDirtyCallOnce = false;
        this.itemCount = 0;
        this.batchCount = 3;
    }
    allSubviews() {
        return this.cachedViews.values();
    }
    getItem(itemIdx) {
        let view = this.renderPage(itemIdx);
        view.superview = this;
        this.cachedViews.set(`${itemIdx}`, view);
        return view;
    }
    isDirty() {
        if (this.ignoreDirtyCallOnce) {
            this.ignoreDirtyCallOnce = false;
            //Ignore the dirty call once.
            return false;
        }
        return super.isDirty();
    }
    renderBunchedItems(start, length) {
        this.ignoreDirtyCallOnce = true;
        return new Array(Math.min(length, this.itemCount - start)).fill(0).map((_, idx) => {
            const slideItem = this.getItem(start + idx);
            return slideItem.toModel();
        });
    }
    slidePage(context, page, smooth = false) {
        return this.nativeChannel(context, "slidePage")({ page, smooth });
    }
    getSlidedPage(context) {
        return this.nativeChannel(context, "getSlidedPage")();
    }
}
__decorate$6([
    Property,
    __metadata$6("design:type", Object)
], Slider.prototype, "itemCount", void 0);
__decorate$6([
    Property,
    __metadata$6("design:type", Function)
], Slider.prototype, "renderPage", void 0);
__decorate$6([
    Property,
    __metadata$6("design:type", Object)
], Slider.prototype, "batchCount", void 0);
__decorate$6([
    Property,
    __metadata$6("design:type", Function)
], Slider.prototype, "onPageSlided", void 0);
__decorate$6([
    Property,
    __metadata$6("design:type", Boolean)
], Slider.prototype, "loop", void 0);
function slider(config) {
    const ret = new Slider;
    for (let key in config) {
        Reflect.set(ret, key, Reflect.get(config, key, config), ret);
    }
    return ret;
}
function slideItem(item, config) {
    return (new SlideItem).also((it) => {
        it.layoutConfig = layoutConfig().most();
        if (item instanceof View) {
            it.addChild(item);
        }
        else {
            item.forEach(e => {
                it.addChild(e);
            });
        }
        if (config) {
            for (let key in config) {
                Reflect.set(it, key, Reflect.get(config, key, config), it);
            }
        }
    });
}

var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$7 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function scroller(content, config) {
    return (new Scroller).also(v => {
        v.layoutConfig = layoutConfig().fit();
        if (config) {
            for (let key in config) {
                Reflect.set(v, key, Reflect.get(config, key, config), v);
            }
        }
        v.content = content;
    });
}
class Scroller extends Superview {
    allSubviews() {
        return [this.content];
    }
    toModel() {
        this.dirtyProps.content = this.content.viewId;
        return super.toModel();
    }
    scrollTo(context, offset, animated) {
        return this.nativeChannel(context, "scrollTo")({ offset, animated });
    }
    scrollBy(context, offset, animated) {
        return this.nativeChannel(context, "scrollBy")({ offset, animated });
    }
}
__decorate$7([
    Property,
    __metadata$7("design:type", Object)
], Scroller.prototype, "contentOffset", void 0);
__decorate$7([
    Property,
    __metadata$7("design:type", Function)
], Scroller.prototype, "onScroll", void 0);
__decorate$7([
    Property,
    __metadata$7("design:type", Function)
], Scroller.prototype, "onScrollEnd", void 0);

var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$8 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class Refreshable extends Superview {
    allSubviews() {
        const ret = [this.content];
        if (this.header) {
            ret.push(this.header);
        }
        return ret;
    }
    setRefreshable(context, refreshable) {
        return this.nativeChannel(context, 'setRefreshable')(refreshable);
    }
    setRefreshing(context, refreshing) {
        return this.nativeChannel(context, 'setRefreshing')(refreshing);
    }
    isRefreshable(context) {
        return this.nativeChannel(context, 'isRefreshable')();
    }
    isRefreshing(context) {
        return this.nativeChannel(context, 'isRefreshing')();
    }
    toModel() {
        this.dirtyProps.content = this.content.viewId;
        this.dirtyProps.header = (this.header || {}).viewId;
        return super.toModel();
    }
}
__decorate$8([
    Property,
    __metadata$8("design:type", Function)
], Refreshable.prototype, "onRefresh", void 0);
function refreshable(config) {
    const ret = new Refreshable;
    ret.layoutConfig = layoutConfig().fit();
    for (let key in config) {
        Reflect.set(ret, key, Reflect.get(config, key, config), ret);
    }
    return ret;
}
function pullable(v, config) {
    Reflect.set(v, 'startAnimation', config.startAnimation);
    Reflect.set(v, 'stopAnimation', config.stopAnimation);
    Reflect.set(v, 'setPullingDistance', config.setPullingDistance);
    return v;
}

var ValueType;
(function (ValueType) {
    ValueType[ValueType["Undefined"] = 0] = "Undefined";
    ValueType[ValueType["Point"] = 1] = "Point";
    ValueType[ValueType["Percent"] = 2] = "Percent";
    ValueType[ValueType["Auto"] = 3] = "Auto";
})(ValueType || (ValueType = {}));
class FlexTypedValue {
    constructor(type) {
        this.value = 0;
        this.type = type;
    }
    static percent(v) {
        const ret = new FlexTypedValue(ValueType.Percent);
        ret.value = v;
        return ret;
    }
    static point(v) {
        const ret = new FlexTypedValue(ValueType.Point);
        ret.value = v;
        return ret;
    }
    toModel() {
        return {
            type: this.type,
            value: this.value,
        };
    }
}
FlexTypedValue.Auto = new FlexTypedValue(ValueType.Auto);
(function (FlexDirection) {
    FlexDirection[FlexDirection["COLUMN"] = 0] = "COLUMN";
    FlexDirection[FlexDirection["COLUMN_REVERSE"] = 1] = "COLUMN_REVERSE";
    FlexDirection[FlexDirection["ROW"] = 2] = "ROW";
    FlexDirection[FlexDirection["ROW_REVERSE"] = 3] = "ROW_REVERSE";
})(exports.FlexDirection || (exports.FlexDirection = {}));
(function (Align) {
    Align[Align["AUTO"] = 0] = "AUTO";
    Align[Align["FLEX_START"] = 1] = "FLEX_START";
    Align[Align["CENTER"] = 2] = "CENTER";
    Align[Align["FLEX_END"] = 3] = "FLEX_END";
    Align[Align["STRETCH"] = 4] = "STRETCH";
    Align[Align["BASELINE"] = 5] = "BASELINE";
    Align[Align["SPACE_BETWEEN"] = 6] = "SPACE_BETWEEN";
    Align[Align["SPACE_AROUND"] = 7] = "SPACE_AROUND";
})(exports.Align || (exports.Align = {}));
(function (Justify) {
    Justify[Justify["FLEX_START"] = 0] = "FLEX_START";
    Justify[Justify["CENTER"] = 1] = "CENTER";
    Justify[Justify["FLEX_END"] = 2] = "FLEX_END";
    Justify[Justify["SPACE_BETWEEN"] = 3] = "SPACE_BETWEEN";
    Justify[Justify["SPACE_AROUND"] = 4] = "SPACE_AROUND";
    Justify[Justify["SPACE_EVENLY"] = 5] = "SPACE_EVENLY";
})(exports.Justify || (exports.Justify = {}));
(function (Direction) {
    Direction[Direction["INHERIT"] = 0] = "INHERIT";
    Direction[Direction["LTR"] = 1] = "LTR";
    Direction[Direction["RTL"] = 2] = "RTL";
})(exports.Direction || (exports.Direction = {}));
(function (PositionType) {
    PositionType[PositionType["RELATIVE"] = 0] = "RELATIVE";
    PositionType[PositionType["ABSOLUTE"] = 1] = "ABSOLUTE";
})(exports.PositionType || (exports.PositionType = {}));
(function (Wrap) {
    Wrap[Wrap["NO_WRAP"] = 0] = "NO_WRAP";
    Wrap[Wrap["WRAP"] = 1] = "WRAP";
    Wrap[Wrap["WRAP_REVERSE"] = 2] = "WRAP_REVERSE";
})(exports.Wrap || (exports.Wrap = {}));
(function (OverFlow) {
    OverFlow[OverFlow["VISIBLE"] = 0] = "VISIBLE";
    OverFlow[OverFlow["HIDDEN"] = 1] = "HIDDEN";
    OverFlow[OverFlow["SCROLL"] = 2] = "SCROLL";
})(exports.OverFlow || (exports.OverFlow = {}));
(function (Display) {
    Display[Display["FLEX"] = 0] = "FLEX";
    Display[Display["NONE"] = 1] = "NONE";
})(exports.Display || (exports.Display = {}));

var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$9 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class FlowLayoutItem extends Stack {
}
__decorate$9([
    Property,
    __metadata$9("design:type", String)
], FlowLayoutItem.prototype, "identifier", void 0);
class FlowLayout extends Superview {
    constructor() {
        super(...arguments);
        this.cachedViews = new Map;
        this.ignoreDirtyCallOnce = false;
        this.columnCount = 2;
        this.itemCount = 0;
        this.batchCount = 15;
    }
    allSubviews() {
        if (this.loadMoreView) {
            return [...this.cachedViews.values(), this.loadMoreView];
        }
        else {
            return this.cachedViews.values();
        }
    }
    reset() {
        this.cachedViews.clear();
        this.itemCount = 0;
    }
    getItem(itemIdx) {
        let view = this.renderItem(itemIdx);
        view.superview = this;
        this.cachedViews.set(`${itemIdx}`, view);
        return view;
    }
    isDirty() {
        if (this.ignoreDirtyCallOnce) {
            this.ignoreDirtyCallOnce = false;
            //Ignore the dirty call once.
            return false;
        }
        return super.isDirty();
    }
    renderBunchedItems(start, length) {
        this.ignoreDirtyCallOnce = true;
        return new Array(Math.min(length, this.itemCount - start)).fill(0).map((_, idx) => {
            const listItem = this.getItem(start + idx);
            return listItem.toModel();
        });
    }
    toModel() {
        if (this.loadMoreView) {
            this.dirtyProps['loadMoreView'] = this.loadMoreView.viewId;
        }
        return super.toModel();
    }
}
__decorate$9([
    Property,
    __metadata$9("design:type", Object)
], FlowLayout.prototype, "columnCount", void 0);
__decorate$9([
    Property,
    __metadata$9("design:type", Number)
], FlowLayout.prototype, "columnSpace", void 0);
__decorate$9([
    Property,
    __metadata$9("design:type", Number)
], FlowLayout.prototype, "rowSpace", void 0);
__decorate$9([
    Property,
    __metadata$9("design:type", Object)
], FlowLayout.prototype, "itemCount", void 0);
__decorate$9([
    Property,
    __metadata$9("design:type", Function)
], FlowLayout.prototype, "renderItem", void 0);
__decorate$9([
    Property,
    __metadata$9("design:type", Object)
], FlowLayout.prototype, "batchCount", void 0);
__decorate$9([
    Property,
    __metadata$9("design:type", Function)
], FlowLayout.prototype, "onLoadMore", void 0);
__decorate$9([
    Property,
    __metadata$9("design:type", Boolean)
], FlowLayout.prototype, "loadMore", void 0);
__decorate$9([
    Property,
    __metadata$9("design:type", FlowLayoutItem)
], FlowLayout.prototype, "loadMoreView", void 0);
__decorate$9([
    Property,
    __metadata$9("design:type", Function)
], FlowLayout.prototype, "onScroll", void 0);
__decorate$9([
    Property,
    __metadata$9("design:type", Function)
], FlowLayout.prototype, "onScrollEnd", void 0);
function flowlayout(config) {
    const ret = new FlowLayout;
    for (let key in config) {
        Reflect.set(ret, key, Reflect.get(config, key, config), ret);
    }
    return ret;
}
function flowItem(item, config) {
    return (new FlowLayoutItem).also((it) => {
        it.layoutConfig = layoutConfig().fit();
        if (item instanceof View) {
            it.addChild(item);
        }
        else {
            item.forEach(e => {
                it.addChild(e);
            });
        }
        if (config) {
            for (let key in config) {
                Reflect.set(it, key, Reflect.get(config, key, config), it);
            }
        }
    });
}

var __decorate$a = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$a = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class Input extends View {
    getText(context) {
        return this.nativeChannel(context, 'getText')();
    }
    setSelection(context, start, end = start) {
        return this.nativeChannel(context, 'setSelection')({
            start,
            end,
        });
    }
    requestFocus(context) {
        return this.nativeChannel(context, 'requestFocus')();
    }
    releaseFocus(context) {
        return this.nativeChannel(context, 'releaseFocus')();
    }
}
__decorate$a([
    Property,
    __metadata$a("design:type", String)
], Input.prototype, "text", void 0);
__decorate$a([
    Property,
    __metadata$a("design:type", Color)
], Input.prototype, "textColor", void 0);
__decorate$a([
    Property,
    __metadata$a("design:type", Number)
], Input.prototype, "textSize", void 0);
__decorate$a([
    Property,
    __metadata$a("design:type", String)
], Input.prototype, "hintText", void 0);
__decorate$a([
    Property,
    __metadata$a("design:type", Color)
], Input.prototype, "hintTextColor", void 0);
__decorate$a([
    Property,
    __metadata$a("design:type", Boolean)
], Input.prototype, "multiline", void 0);
__decorate$a([
    Property,
    __metadata$a("design:type", Gravity)
], Input.prototype, "textAlignment", void 0);
__decorate$a([
    Property,
    __metadata$a("design:type", Function)
], Input.prototype, "onTextChange", void 0);
__decorate$a([
    Property,
    __metadata$a("design:type", Function)
], Input.prototype, "onFocusChange", void 0);
function input(config) {
    const ret = new Input;
    ret.layoutConfig = layoutConfig().just();
    for (let key in config) {
        Reflect.set(ret, key, Reflect.get(config, key, config), ret);
    }
    return ret;
}

var __decorate$b = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$b = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class NestedSlider extends Group {
    addSlideItem(view) {
        this.addChild(view);
    }
    slidePage(context, page, smooth = false) {
        return this.nativeChannel(context, "slidePage")({ page, smooth });
    }
    getSlidedPage(context) {
        return this.nativeChannel(context, "getSlidedPage")();
    }
}
__decorate$b([
    Property,
    __metadata$b("design:type", Function)
], NestedSlider.prototype, "onPageSlided", void 0);

var __decorate$c = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$c = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class Draggable extends Stack {
}
__decorate$c([
    Property,
    __metadata$c("design:type", Function)
], Draggable.prototype, "onDrag", void 0);
function draggable(views, config) {
    const ret = new Draggable;
    ret.layoutConfig = layoutConfig().fit();
    if (views instanceof View) {
        ret.addChild(views);
    }
    else {
        views.forEach(e => {
            ret.addChild(e);
        });
    }
    if (config) {
        for (let key in config) {
            Reflect.set(ret, key, Reflect.get(config, key, config), ret);
        }
    }
    return ret;
}

var __decorate$d = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$d = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class Switch extends View {
}
__decorate$d([
    Property,
    __metadata$d("design:type", Boolean)
], Switch.prototype, "state", void 0);
__decorate$d([
    Property,
    __metadata$d("design:type", Function)
], Switch.prototype, "onSwitch", void 0);
__decorate$d([
    Property,
    __metadata$d("design:type", Color)
], Switch.prototype, "offTintColor", void 0);
__decorate$d([
    Property,
    __metadata$d("design:type", Color)
], Switch.prototype, "onTintColor", void 0);
__decorate$d([
    Property,
    __metadata$d("design:type", Color)
], Switch.prototype, "thumbTintColor", void 0);
function switchView(config) {
    const ret = new Switch;
    ret.layoutConfig = layoutConfig().just();
    ret.width = 50;
    ret.height = 30;
    for (let key in config) {
        Reflect.set(ret, key, Reflect.get(config, key, config), ret);
    }
    return ret;
}

function modal(context) {
    return {
        toast: (msg, gravity = Gravity.Bottom) => {
            context.callNative('modal', 'toast', {
                msg,
                gravity: gravity.toModel(),
            });
        },
        alert: (arg) => {
            if (typeof arg === 'string') {
                return context.callNative('modal', 'alert', { msg: arg });
            }
            else {
                return context.callNative('modal', 'alert', arg);
            }
        },
        confirm: (arg) => {
            if (typeof arg === 'string') {
                return context.callNative('modal', 'confirm', { msg: arg });
            }
            else {
                return context.callNative('modal', 'confirm', arg);
            }
        },
        prompt: (arg) => {
            return context.callNative('modal', 'prompt', arg);
        },
    };
}

function navbar(context) {
    const entity = context.entity;
    let panel = undefined;
    if (entity instanceof Panel) {
        panel = entity;
    }
    return {
        isHidden: () => {
            return context.callNative('navbar', 'isHidden');
        },
        setHidden: (hidden) => {
            return context.callNative('navbar', 'setHidden', { hidden, });
        },
        setTitle: (title) => {
            return context.callNative('navbar', 'setTitle', { title, });
        },
        setBgColor: (color) => {
            return context.callNative('navbar', 'setBgColor', { color: color.toModel(), });
        },
        setLeft: (view) => {
            if (panel) {
                panel.clearHeadViews("navbar_left");
                panel.addHeadView("navbar_left", view);
            }
            return context.callNative('navbar', 'setLeft', view.toModel());
        },
        setRight: (view) => {
            if (panel) {
                panel.clearHeadViews("navbar_right");
                panel.addHeadView("navbar_right", view);
            }
            return context.callNative('navbar', 'setRight', view.toModel());
        }
    };
}

function navigator(context) {
    const moduleName = "navigator";
    return {
        push: (source, config) => {
            if (config && config.extra) {
                config.extra = JSON.stringify(config.extra);
            }
            return context.callNative(moduleName, 'push', {
                source, config
            });
        },
        pop: (animated = true) => {
            return context.callNative(moduleName, 'pop', { animated });
        },
        openUrl: (url) => {
            return context.callNative(moduleName, "openUrl", url);
        },
    };
}

function transformRequest(request) {
    let url = request.url || "";
    if (request.params !== undefined) {
        const queryStrings = [];
        for (let key in request.params) {
            queryStrings.push(`${key}=${encodeURIComponent(request.params[key])}`);
        }
        request.url = `${request.url}${url.indexOf('?') >= 0 ? '&' : '?'}${queryStrings.join('&')}`;
    }
    if (typeof request.data === 'object') {
        request.data = JSON.stringify(request.data);
    }
    return request;
}
function network(context) {
    return {
        request: (config) => {
            return context.callNative('network', 'request', transformRequest(config));
        },
        get: (url, config) => {
            let finalConfig = config;
            if (finalConfig === undefined) {
                finalConfig = {};
            }
            finalConfig.url = url;
            finalConfig.method = "get";
            return context.callNative('network', 'request', transformRequest(finalConfig));
        },
        post: (url, data, config) => {
            let finalConfig = config;
            if (finalConfig === undefined) {
                finalConfig = {};
            }
            finalConfig.url = url;
            finalConfig.method = "post";
            if (data !== undefined) {
                finalConfig.data = data;
            }
            return context.callNative('network', 'request', transformRequest(finalConfig));
        },
        put: (url, data, config) => {
            let finalConfig = config;
            if (finalConfig === undefined) {
                finalConfig = {};
            }
            finalConfig.url = url;
            finalConfig.method = "put";
            if (data !== undefined) {
                finalConfig.data = data;
            }
            return context.callNative('network', 'request', transformRequest(finalConfig));
        },
        delete: (url, data, config) => {
            let finalConfig = config;
            if (finalConfig === undefined) {
                finalConfig = {};
            }
            finalConfig.url = url;
            finalConfig.method = "delete";
            return context.callNative('network', 'request', transformRequest(finalConfig));
        },
    };
}

function storage(context) {
    return {
        setItem: (key, value, zone) => {
            return context.callNative('storage', 'setItem', { key, value, zone });
        },
        getItem: (key, zone) => {
            return context.callNative('storage', 'getItem', { key, zone });
        },
        remove: (key, zone) => {
            return context.callNative('storage', 'remove', { key, zone });
        },
        clear: (zone) => {
            return context.callNative('storage', 'clear', { zone });
        },
    };
}

function popover(context) {
    const entity = context.entity;
    let panel = undefined;
    if (entity instanceof Panel) {
        panel = entity;
    }
    return {
        show: (view) => {
            if (panel) {
                panel.addHeadView("popover", view);
            }
            return context.callNative('popover', 'show', view.toModel());
        },
        dismiss: (view = undefined) => {
            if (panel) {
                if (view) {
                    panel.removeHeadView("popover", view);
                }
                else {
                    panel.clearHeadViews("popover");
                }
            }
            return context.callNative('popover', 'dismiss', view ? { id: view.viewId } : undefined);
        },
    };
}

/*
 * Copyright [2019] [Doric.Pub]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function take(target) {
    return (block) => {
        block(target);
    };
}
function takeNonNull(target) {
    return (block) => {
        if (target !== undefined) {
            return block(target);
        }
    };
}
function takeNull(target) {
    return (block) => {
        if (target === undefined) {
            return block();
        }
    };
}
function takeLet(target) {
    return (block) => {
        return block(target);
    };
}
function takeAlso(target) {
    return (block) => {
        block(target);
        return target;
    };
}
function takeIf(target) {
    return (predicate) => {
        return predicate(target) ? target : undefined;
    };
}
function takeUnless(target) {
    return (predicate) => {
        return predicate(target) ? undefined : target;
    };
}
function repeat(action) {
    return (times) => {
        for (let i = 0; i < times; i++) {
            action(i);
        }
    };
}

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Only supports x,y,width,height,corner(just for four corners),rotation,bgColor,
 * @param panel @see Panel
 */
function animate(context) {
    const entity = context.entity;
    if (entity instanceof Panel) {
        let panel = entity;
        return (args) => __awaiter(this, void 0, void 0, function* () {
            yield context.callNative('animate', 'submit');
            args.animations();
            return takeLet(panel.getRootView())(root => {
                if (root.isDirty()) {
                    const model = root.toModel();
                    model.duration = args.duration;
                    const ret = context.callNative('animate', 'animateRender', model);
                    root.clean();
                    return ret;
                }
                for (let map of panel.allHeadViews()) {
                    for (let v of map.values()) {
                        if (v.isDirty()) {
                            const model_1 = v.toModel();
                            const ret_1 = context.callNative('animate', 'animateRender', model_1);
                            v.clean();
                            return ret_1;
                        }
                    }
                }
                throw new Error('Cannot find any animated elements');
            });
        });
    }
    else {
        return (args) => {
            return Promise.reject(`Cannot find panel in Context:${context.id}`);
        };
    }
}

function notification(context) {
    return {
        publish: (args) => {
            if (args.data !== undefined) {
                args.data = JSON.stringify(args.data);
            }
            return context.callNative('notification', 'publish', args);
        },
        subscribe: (args) => {
            args.callback = context.function2Id(args.callback);
            return context.callNative('notification', 'subscribe', args);
        },
        unsubscribe: (subscribeId) => {
            context.removeFuncById(subscribeId);
            return context.callNative('notification', 'unsubscribe', subscribeId);
        }
    };
}

(function (StatusBarMode) {
    StatusBarMode[StatusBarMode["LIGHT"] = 0] = "LIGHT";
    StatusBarMode[StatusBarMode["DARK"] = 1] = "DARK";
})(exports.StatusBarMode || (exports.StatusBarMode = {}));
function statusbar(context) {
    return {
        setHidden: (hidden) => {
            return context.callNative('statusbar', 'setHidden', { hidden });
        },
        setMode: (mode) => {
            return context.callNative('statusbar', 'setMode', { mode });
        },
        setColor: (color) => {
            return context.callNative('statusbar', 'setColor', { color: color.toModel() });
        },
    };
}

function viewIdChains(view) {
    const viewIds = [];
    let thisView = view;
    while (thisView != undefined) {
        viewIds.push(thisView.viewId);
        thisView = thisView.superview;
    }
    return viewIds.reverse();
}
function coordinator(context) {
    return {
        verticalScrolling: (argument) => {
            if (context.entity instanceof Panel) {
                const panel = context.entity;
                panel.addOnRenderFinishedCallback(() => {
                    argument.scrollable = viewIdChains(argument.scrollable);
                    if (argument.target instanceof View) {
                        argument.target = viewIdChains(argument.target);
                    }
                    if (argument.changing.start instanceof Color) {
                        argument.changing.start = argument.changing.start.toModel();
                    }
                    if (argument.changing.end instanceof Color) {
                        argument.changing.end = argument.changing.end.toModel();
                    }
                    context.callNative("coordinator", "verticalScrolling", argument);
                });
            }
        }
    };
}

function notch(context) {
    return {
        inset: () => {
            return context.callNative('notch', 'inset', {});
        }
    };
}

class Observable {
    constructor(provider, clz) {
        this.observers = new Set;
        this.provider = provider;
        this.clz = clz;
    }
    addObserver(observer) {
        this.observers.add(observer);
    }
    removeObserver(observer) {
        this.observers.delete(observer);
    }
    update(updater) {
        const oldV = this.provider.acquire(this.clz);
        const newV = updater(oldV);
        if (newV !== undefined) {
            this.provider.provide(newV);
        }
        for (let observer of this.observers) {
            observer(newV);
        }
    }
}
class Provider {
    constructor() {
        this.provision = new Map;
        this.observableMap = new Map;
    }
    provide(obj) {
        this.provision.set(obj.constructor, obj);
    }
    acquire(clz) {
        const ret = this.provision.get(clz);
        return ret;
    }
    remove(clz) {
        this.provision.delete(clz);
    }
    clear() {
        this.provision.clear();
    }
    observe(clz) {
        let observable = this.observableMap.get(clz);
        if (observable === undefined) {
            observable = new Observable(this, clz);
            this.observableMap.set(clz, observable);
        }
        return observable;
    }
}

class ViewHolder {
}
class ViewModel {
    constructor(obj, v) {
        this.state = obj;
        this.viewHolder = v;
    }
    getState() {
        return this.state;
    }
    getViewHolder() {
        return this.viewHolder;
    }
    updateState(setter) {
        setter(this.state);
        this.onBind(this.state, this.viewHolder);
    }
    attach(view) {
        this.viewHolder.build(view);
        this.onAttached(this.state, this.viewHolder);
        this.onBind(this.state, this.viewHolder);
    }
}
class VMPanel extends Panel {
    getViewModel() {
        return this.vm;
    }
    build(root) {
        this.vh = new (this.getViewHolderClass());
        this.vm = new (this.getViewModelClass())(this.getState(), this.vh);
        this.vm.attach(root);
    }
}

exports.AnimationSet = AnimationSet;
exports.BOTTOM = BOTTOM;
exports.CENTER = CENTER;
exports.CENTER_X = CENTER_X;
exports.CENTER_Y = CENTER_Y;
exports.Color = Color;
exports.Draggable = Draggable;
exports.FlexLayout = FlexLayout;
exports.FlexTypedValue = FlexTypedValue;
exports.FlowLayout = FlowLayout;
exports.FlowLayoutItem = FlowLayoutItem;
exports.Gravity = Gravity;
exports.Group = Group;
exports.HLayout = HLayout;
exports.Image = Image;
exports.Input = Input;
exports.LEFT = LEFT;
exports.LayoutConfigImpl = LayoutConfigImpl;
exports.List = List;
exports.ListItem = ListItem;
exports.Mutable = Mutable;
exports.NativeCall = NativeCall;
exports.NestedSlider = NestedSlider;
exports.Observable = Observable;
exports.Panel = Panel;
exports.Property = Property;
exports.Provider = Provider;
exports.RIGHT = RIGHT;
exports.Refreshable = Refreshable;
exports.Root = Root;
exports.RotationAnimation = RotationAnimation;
exports.ScaleAnimation = ScaleAnimation;
exports.Scroller = Scroller;
exports.SlideItem = SlideItem;
exports.Slider = Slider;
exports.Stack = Stack;
exports.Superview = Superview;
exports.Switch = Switch;
exports.TOP = TOP;
exports.Text = Text;
exports.TranslationAnimation = TranslationAnimation;
exports.VLayout = VLayout;
exports.VMPanel = VMPanel;
exports.View = View;
exports.ViewHolder = ViewHolder;
exports.ViewModel = ViewModel;
exports.animate = animate;
exports.coordinator = coordinator;
exports.draggable = draggable;
exports.flexlayout = flexlayout;
exports.flowItem = flowItem;
exports.flowlayout = flowlayout;
exports.gravity = gravity;
exports.hlayout = hlayout;
exports.image = image;
exports.input = input;
exports.layoutConfig = layoutConfig;
exports.list = list;
exports.listItem = listItem;
exports.log = log;
exports.loge = loge;
exports.logw = logw;
exports.modal = modal;
exports.navbar = navbar;
exports.navigator = navigator;
exports.network = network;
exports.notch = notch;
exports.notification = notification;
exports.obj2Model = obj2Model;
exports.popover = popover;
exports.pullable = pullable;
exports.refreshable = refreshable;
exports.repeat = repeat;
exports.scroller = scroller;
exports.slideItem = slideItem;
exports.slider = slider;
exports.stack = stack;
exports.statusbar = statusbar;
exports.storage = storage;
exports.switchView = switchView;
exports.take = take;
exports.takeAlso = takeAlso;
exports.takeIf = takeIf;
exports.takeLet = takeLet;
exports.takeNonNull = takeNonNull;
exports.takeNull = takeNull;
exports.takeUnless = takeUnless;
exports.text = text;
exports.uniqueId = uniqueId;
exports.vlayout = vlayout;

})(__module,__module.exports,doric.__require__);
return __module.exports;
},this,[{exports:{}}])]);
/**--------Lib--------*/
    
var doric_web = (function (exports, axios, sandbox) {
    'use strict';

    axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;

    class DoricPlugin {
        constructor(context) {
            this.context = context;
        }
        onTearDown() {
        }
    }

    class ShaderPlugin extends DoricPlugin {
        render(ret) {
            var _a;
            if (((_a = this.context.rootNode.viewId) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                if (this.context.rootNode.viewId === ret.id) {
                    this.context.rootNode.blend(ret.props);
                }
                else {
                    for (let map of this.context.headNodes.values()) {
                        const viewNode = map.get(ret.id);
                        if (viewNode) {
                            viewNode.blend(ret.props);
                        }
                    }
                }
            }
            else {
                this.context.rootNode.viewId = ret.id;
                this.context.rootNode.blend(ret.props);
            }
        }
    }

    (function (LayoutSpec) {
        LayoutSpec[LayoutSpec["EXACTLY"] = 0] = "EXACTLY";
        LayoutSpec[LayoutSpec["WRAP_CONTENT"] = 1] = "WRAP_CONTENT";
        LayoutSpec[LayoutSpec["AT_MOST"] = 2] = "AT_MOST";
    })(exports.LayoutSpec || (exports.LayoutSpec = {}));
    const SPECIFIED = 1;
    const START = 1 << 1;
    const END = 1 << 2;
    const SHIFT_X = 0;
    const SHIFT_Y = 4;
    const LEFT = (START | SPECIFIED) << SHIFT_X;
    const RIGHT = (END | SPECIFIED) << SHIFT_X;
    const TOP = (START | SPECIFIED) << SHIFT_Y;
    const BOTTOM = (END | SPECIFIED) << SHIFT_Y;
    const CENTER_X = SPECIFIED << SHIFT_X;
    const CENTER_Y = SPECIFIED << SHIFT_Y;
    const CENTER = CENTER_X | CENTER_Y;
    function toPixelString(v) {
        return `${v}px`;
    }
    function toRGBAString(color) {
        let strs = [];
        for (let i = 0; i < 32; i += 8) {
            strs.push(((color >> i) & 0xff).toString(16));
        }
        strs = strs.map(e => {
            if (e.length === 1) {
                return '0' + e;
            }
            return e;
        }).reverse();
        /// RGBA
        return `#${strs[1]}${strs[2]}${strs[3]}${strs[0]}`;
    }
    class DoricViewNode {
        constructor(context) {
            this.viewId = "";
            this.viewType = "View";
            this.layoutConfig = {
                widthSpec: exports.LayoutSpec.EXACTLY,
                heightSpec: exports.LayoutSpec.EXACTLY,
                alignment: 0,
                weight: 0,
                margin: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            };
            this.padding = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            };
            this.frameWidth = 0;
            this.frameHeight = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.context = context;
        }
        init(superNode) {
            if (superNode) {
                this.superNode = superNode;
                if (this instanceof DoricSuperNode) {
                    this.reusable = superNode.reusable;
                }
            }
            this.view = this.build();
        }
        get paddingLeft() {
            return this.padding.left || 0;
        }
        get paddingRight() {
            return this.padding.right || 0;
        }
        get paddingTop() {
            return this.padding.top || 0;
        }
        get paddingBottom() {
            return this.padding.bottom || 0;
        }
        get borderWidth() {
            var _a;
            return ((_a = this.border) === null || _a === void 0 ? void 0 : _a.width) || 0;
        }
        blend(props) {
            this.view.id = `${this.viewId}`;
            for (let key in props) {
                this.blendProps(this.view, key, props[key]);
            }
            this.onBlended();
            this.layout();
        }
        onBlended() {
        }
        configBorder() {
            if (this.border) {
                this.view.style.borderStyle = "solid";
                this.view.style.borderWidth = toPixelString(this.border.width);
                this.view.style.borderColor = toRGBAString(this.border.color);
            }
        }
        configWidth() {
            switch (this.layoutConfig.widthSpec) {
                case exports.LayoutSpec.WRAP_CONTENT:
                    this.view.style.width = "max-content";
                    break;
                case exports.LayoutSpec.AT_MOST:
                    this.view.style.width = "100%";
                    break;
                case exports.LayoutSpec.EXACTLY:
                default:
                    this.view.style.width = toPixelString(this.frameWidth
                        - this.paddingLeft - this.paddingRight
                        - this.borderWidth * 2);
                    break;
            }
        }
        configHeight() {
            switch (this.layoutConfig.heightSpec) {
                case exports.LayoutSpec.WRAP_CONTENT:
                    this.view.style.height = "max-content";
                    break;
                case exports.LayoutSpec.AT_MOST:
                    this.view.style.height = "100%";
                    break;
                case exports.LayoutSpec.EXACTLY:
                default:
                    this.view.style.height = toPixelString(this.frameHeight
                        - this.paddingTop - this.paddingBottom
                        - this.borderWidth * 2);
                    break;
            }
        }
        configMargin() {
            if (this.layoutConfig.margin) {
                this.view.style.marginLeft = toPixelString(this.layoutConfig.margin.left || 0);
                this.view.style.marginRight = toPixelString(this.layoutConfig.margin.right || 0);
                this.view.style.marginTop = toPixelString(this.layoutConfig.margin.top || 0);
                this.view.style.marginBottom = toPixelString(this.layoutConfig.margin.bottom || 0);
            }
        }
        configPadding() {
            if (this.padding) {
                this.view.style.paddingLeft = toPixelString(this.paddingLeft);
                this.view.style.paddingRight = toPixelString(this.paddingRight);
                this.view.style.paddingTop = toPixelString(this.paddingTop);
                this.view.style.paddingBottom = toPixelString(this.paddingBottom);
            }
        }
        layout() {
            this.configMargin();
            this.configBorder();
            this.configPadding();
            this.configWidth();
            this.configHeight();
        }
        blendProps(v, propName, prop) {
            switch (propName) {
                case "border":
                    this.border = prop;
                    break;
                case "padding":
                    this.padding = prop;
                    break;
                case 'width':
                    this.frameWidth = prop;
                    break;
                case 'height':
                    this.frameHeight = prop;
                    break;
                case 'backgroundColor':
                    this.backgroundColor = prop;
                    break;
                case 'layoutConfig':
                    const layoutConfig = prop;
                    for (let key in layoutConfig) {
                        Reflect.set(this.layoutConfig, key, Reflect.get(layoutConfig, key, layoutConfig));
                    }
                    break;
                case 'x':
                    this.offsetX = prop;
                    break;
                case 'y':
                    this.offsetY = prop;
                    break;
                case 'onClick':
                    this.view.onclick = (event) => {
                        this.callJSResponse(prop);
                        event.stopPropagation();
                    };
                    break;
                case 'corners':
                    if (typeof prop === 'object') {
                        this.view.style.borderTopLeftRadius = toPixelString(prop.leftTop);
                        this.view.style.borderTopRightRadius = toPixelString(prop.rightTop);
                        this.view.style.borderBottomRightRadius = toPixelString(prop.rightBottom);
                        this.view.style.borderBottomLeftRadius = toPixelString(prop.leftBottom);
                    }
                    else {
                        this.view.style.borderRadius = toPixelString(prop);
                    }
                    break;
                case 'shadow':
                    const opacity = prop.opacity || 0;
                    if (opacity > 0) {
                        const offsetX = prop.offsetX || 0;
                        const offsetY = prop.offsetY || 0;
                        const shadowColor = prop.color || 0xff000000;
                        const shadowRadius = prop.radius;
                        const alpha = opacity * 255;
                        this.view.style.boxShadow = `${toPixelString(offsetX)} ${toPixelString(offsetY)} ${toPixelString(shadowRadius)} ${toRGBAString((shadowColor & 0xffffff) | ((alpha & 0xff) << 24))} `;
                    }
                    else {
                        this.view.style.boxShadow = "";
                    }
                    break;
            }
        }
        set backgroundColor(v) {
            this.view.style.backgroundColor = toRGBAString(v);
        }
        static create(context, type) {
            const viewNodeClass = acquireViewNode(type);
            if (viewNodeClass === undefined) {
                console.error(`Cannot find ViewNode for ${type}`);
                return undefined;
            }
            const ret = new viewNodeClass(context);
            ret.viewType = type;
            return ret;
        }
        getIdList() {
            const ids = [];
            let viewNode = this;
            do {
                ids.push(viewNode.viewId);
                viewNode = viewNode.superNode;
            } while (viewNode);
            return ids.reverse();
        }
        callJSResponse(funcId, ...args) {
            const argumentsList = ['__response__', this.getIdList(), funcId];
            for (let i = 1; i < arguments.length; i++) {
                argumentsList.push(arguments[i]);
            }
            return Reflect.apply(this.context.invokeEntityMethod, this.context, argumentsList);
        }
    }
    class DoricSuperNode extends DoricViewNode {
        constructor() {
            super(...arguments);
            this.reusable = false;
            this.subModels = new Map;
        }
        blendProps(v, propName, prop) {
            if (propName === 'subviews') {
                if (prop instanceof Array) {
                    prop.forEach((e) => {
                        this.mixinSubModel(e);
                        this.blendSubNode(e);
                    });
                }
            }
            else {
                super.blendProps(v, propName, prop);
            }
        }
        mixinSubModel(subNode) {
            const oldValue = this.getSubModel(subNode.id);
            if (oldValue) {
                this.mixin(subNode, oldValue);
            }
            else {
                this.subModels.set(subNode.id, subNode);
            }
        }
        getSubModel(id) {
            return this.subModels.get(id);
        }
        mixin(src, target) {
            for (let key in src.props) {
                if (key === "subviews") {
                    continue;
                }
                Reflect.set(target.props, key, Reflect.get(src.props, key));
            }
        }
        clearSubModels() {
            this.subModels.clear();
        }
        removeSubModel(id) {
            this.subModels.delete(id);
        }
    }
    class DoricGroupViewNode extends DoricSuperNode {
        constructor() {
            super(...arguments);
            this.childNodes = [];
            this.childViewIds = [];
        }
        init(superNode) {
            super.init(superNode);
            this.view.style.overflow = "hidden";
        }
        blendProps(v, propName, prop) {
            if (propName === 'children') {
                if (prop instanceof Array) {
                    this.childViewIds = prop;
                }
            }
            else {
                super.blendProps(v, propName, prop);
            }
        }
        blend(props) {
            super.blend(props);
        }
        onBlended() {
            super.onBlended();
            this.configChildNode();
        }
        configChildNode() {
            this.childViewIds.forEach((childViewId, index) => {
                const model = this.getSubModel(childViewId);
                if (model === undefined) {
                    return;
                }
                if (index < this.childNodes.length) {
                    const oldNode = this.childNodes[index];
                    if (oldNode.viewId === childViewId) ;
                    else {
                        if (this.reusable) {
                            if (oldNode.viewType === model.type) {
                                //Same type,can be reused
                                oldNode.viewId = childViewId;
                                oldNode.blend(model.props);
                            }
                            else {
                                //Replace this view
                                this.view.removeChild(oldNode.view);
                                const newNode = DoricViewNode.create(this.context, model.type);
                                if (newNode === undefined) {
                                    return;
                                }
                                newNode.viewId = childViewId;
                                newNode.init(this);
                                newNode.blend(model.props);
                                this.childNodes[index] = newNode;
                                this.view.replaceChild(newNode.view, oldNode.view);
                            }
                        }
                        else {
                            //Find in remain nodes
                            let position = -1;
                            for (let start = index + 1; start < this.childNodes.length; start++) {
                                if (childViewId === this.childNodes[start].viewId) {
                                    //Found
                                    position = start;
                                    break;
                                }
                            }
                            if (position >= 0) {
                                //Found swap idx,position
                                const reused = this.childNodes[position];
                                const abandoned = this.childNodes[index];
                                this.childNodes[index] = reused;
                                this.childNodes[position] = abandoned;
                                this.view.removeChild(reused.view);
                                this.view.insertBefore(reused.view, abandoned.view);
                                this.view.removeChild(abandoned.view);
                                if (position === this.view.childElementCount - 1) {
                                    this.view.appendChild(abandoned.view);
                                }
                                else {
                                    this.view.insertBefore(abandoned.view, this.view.children[position]);
                                }
                            }
                            else {
                                //Not found,insert
                                const newNode = DoricViewNode.create(this.context, model.type);
                                if (newNode === undefined) {
                                    return;
                                }
                                newNode.viewId = childViewId;
                                newNode.init(this);
                                newNode.blend(model.props);
                                this.childNodes[index] = newNode;
                                this.view.insertBefore(newNode.view, this.view.children[index]);
                            }
                        }
                    }
                }
                else {
                    //Insert
                    const newNode = DoricViewNode.create(this.context, model.type);
                    if (newNode === undefined) {
                        return;
                    }
                    newNode.viewId = childViewId;
                    newNode.init(this);
                    newNode.blend(model.props);
                    this.childNodes.push(newNode);
                    this.view.appendChild(newNode.view);
                }
            });
            let size = this.childNodes.length;
            for (let idx = this.childViewIds.length; idx < size; idx++) {
                this.view.removeChild(this.childNodes[idx].view);
            }
            this.childNodes = this.childNodes.slice(0, this.childViewIds.length);
        }
        blendSubNode(model) {
            var _a;
            (_a = this.getSubNodeById(model.id)) === null || _a === void 0 ? void 0 : _a.blend(model.props);
        }
        getSubNodeById(viewId) {
            return this.childNodes.filter(e => e.viewId === viewId)[0];
        }
    }

    class DoricStackNode extends DoricGroupViewNode {
        build() {
            const ret = document.createElement('div');
            ret.style.position = "relative";
            return ret;
        }
        layout() {
            super.layout();
            Promise.resolve().then(_ => {
                this.configSize();
                this.configOffset();
            });
        }
        configSize() {
            if (this.layoutConfig.widthSpec === exports.LayoutSpec.WRAP_CONTENT) {
                const width = this.childNodes.reduce((prev, current) => {
                    return Math.max(prev, current.view.offsetWidth);
                }, 0);
                this.view.style.width = toPixelString(width);
            }
            if (this.layoutConfig.heightSpec === exports.LayoutSpec.WRAP_CONTENT) {
                const height = this.childNodes.reduce((prev, current) => {
                    return Math.max(prev, current.view.offsetHeight);
                }, 0);
                this.view.style.height = toPixelString(height);
            }
        }
        configOffset() {
            this.childNodes.forEach(e => {
                e.view.style.position = "absolute";
                e.view.style.left = toPixelString(e.offsetX + this.paddingLeft);
                e.view.style.top = toPixelString(e.offsetY + this.paddingTop);
                const gravity = e.layoutConfig.alignment;
                if ((gravity & LEFT) === LEFT) {
                    e.view.style.left = toPixelString(0);
                }
                else if ((gravity & RIGHT) === RIGHT) {
                    e.view.style.left = toPixelString(this.view.offsetWidth - e.view.offsetWidth);
                }
                else if ((gravity & CENTER_X) === CENTER_X) {
                    e.view.style.left = toPixelString(this.view.offsetWidth / 2 - e.view.offsetWidth / 2);
                }
                if ((gravity & TOP) === TOP) {
                    e.view.style.top = toPixelString(0);
                }
                else if ((gravity & BOTTOM) === BOTTOM) {
                    e.view.style.top = toPixelString(this.view.offsetHeight - e.view.offsetHeight);
                }
                else if ((gravity & CENTER_Y) === CENTER_Y) {
                    e.view.style.top = toPixelString(this.view.offsetHeight / 2 - e.view.offsetHeight / 2);
                }
            });
        }
    }

    class DoricVLayoutNode extends DoricGroupViewNode {
        constructor() {
            super(...arguments);
            this.space = 0;
            this.gravity = 0;
        }
        build() {
            const ret = document.createElement('div');
            ret.style.display = "flex";
            ret.style.flexDirection = "column";
            ret.style.flexWrap = "nowrap";
            return ret;
        }
        blendProps(v, propName, prop) {
            if (propName === 'space') {
                this.space = prop;
            }
            else if (propName === 'gravity') {
                this.gravity = prop;
                if ((this.gravity & LEFT) === LEFT) {
                    this.view.style.alignItems = "flex-start";
                }
                else if ((this.gravity & RIGHT) === RIGHT) {
                    this.view.style.alignItems = "flex-end";
                }
                else if ((this.gravity & CENTER_X) === CENTER_X) {
                    this.view.style.alignItems = "center";
                }
                if ((this.gravity & TOP) === TOP) {
                    this.view.style.justifyContent = "flex-start";
                }
                else if ((this.gravity & BOTTOM) === BOTTOM) {
                    this.view.style.justifyContent = "flex-end";
                }
                else if ((this.gravity & CENTER_Y) === CENTER_Y) {
                    this.view.style.justifyContent = "center";
                }
            }
            else {
                super.blendProps(v, propName, prop);
            }
        }
        layout() {
            super.layout();
            this.childNodes.forEach((e, idx) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                e.view.style.flexShrink = "0";
                if ((_a = e.layoutConfig) === null || _a === void 0 ? void 0 : _a.weight) {
                    e.view.style.flex = `${(_b = e.layoutConfig) === null || _b === void 0 ? void 0 : _b.weight}`;
                }
                e.view.style.marginTop = toPixelString(((_d = (_c = e.layoutConfig) === null || _c === void 0 ? void 0 : _c.margin) === null || _d === void 0 ? void 0 : _d.top) || 0);
                e.view.style.marginBottom = toPixelString((idx === this.childNodes.length - 1) ? 0 : this.space
                    + (((_f = (_e = e.layoutConfig) === null || _e === void 0 ? void 0 : _e.margin) === null || _f === void 0 ? void 0 : _f.bottom) || 0));
                e.view.style.marginLeft = toPixelString(((_h = (_g = e.layoutConfig) === null || _g === void 0 ? void 0 : _g.margin) === null || _h === void 0 ? void 0 : _h.left) || 0);
                e.view.style.marginRight = toPixelString(((_k = (_j = e.layoutConfig) === null || _j === void 0 ? void 0 : _j.margin) === null || _k === void 0 ? void 0 : _k.right) || 0);
                if ((e.layoutConfig.alignment & LEFT) === LEFT) {
                    e.view.style.alignSelf = "flex-start";
                }
                else if ((e.layoutConfig.alignment & RIGHT) === RIGHT) {
                    e.view.style.alignSelf = "flex-end";
                }
                else if ((e.layoutConfig.alignment & CENTER_X) === CENTER_X) {
                    e.view.style.alignSelf = "center";
                }
            });
        }
    }

    class DoricHLayoutNode extends DoricGroupViewNode {
        constructor() {
            super(...arguments);
            this.space = 0;
            this.gravity = 0;
        }
        build() {
            const ret = document.createElement('div');
            ret.style.display = "flex";
            ret.style.flexDirection = "row";
            ret.style.flexWrap = "nowrap";
            return ret;
        }
        blendProps(v, propName, prop) {
            if (propName === 'space') {
                this.space = prop;
            }
            else if (propName === 'gravity') {
                this.gravity = prop;
                this.gravity = prop;
                if ((this.gravity & LEFT) === LEFT) {
                    this.view.style.justifyContent = "flex-start";
                }
                else if ((this.gravity & RIGHT) === RIGHT) {
                    this.view.style.justifyContent = "flex-end";
                }
                else if ((this.gravity & CENTER_X) === CENTER_X) {
                    this.view.style.justifyContent = "center";
                }
                if ((this.gravity & TOP) === TOP) {
                    this.view.style.alignItems = "flex-start";
                }
                else if ((this.gravity & BOTTOM) === BOTTOM) {
                    this.view.style.alignItems = "flex-end";
                }
                else if ((this.gravity & CENTER_Y) === CENTER_Y) {
                    this.view.style.alignItems = "center";
                }
            }
            else {
                super.blendProps(v, propName, prop);
            }
        }
        layout() {
            super.layout();
            this.childNodes.forEach((e, idx) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                e.view.style.flexShrink = "0";
                if ((_a = e.layoutConfig) === null || _a === void 0 ? void 0 : _a.weight) {
                    e.view.style.flex = `${(_b = e.layoutConfig) === null || _b === void 0 ? void 0 : _b.weight}`;
                }
                e.view.style.marginLeft = toPixelString(((_d = (_c = e.layoutConfig) === null || _c === void 0 ? void 0 : _c.margin) === null || _d === void 0 ? void 0 : _d.left) || 0);
                e.view.style.marginRight = toPixelString((idx === this.childNodes.length - 1) ? 0 : this.space
                    + (((_f = (_e = e.layoutConfig) === null || _e === void 0 ? void 0 : _e.margin) === null || _f === void 0 ? void 0 : _f.right) || 0));
                e.view.style.marginTop = toPixelString(((_h = (_g = e.layoutConfig) === null || _g === void 0 ? void 0 : _g.margin) === null || _h === void 0 ? void 0 : _h.top) || 0);
                e.view.style.marginBottom = toPixelString(((_k = (_j = e.layoutConfig) === null || _j === void 0 ? void 0 : _j.margin) === null || _k === void 0 ? void 0 : _k.bottom) || 0);
                if ((e.layoutConfig.alignment & TOP) === TOP) {
                    e.view.style.alignSelf = "flex-start";
                }
                else if ((e.layoutConfig.alignment & BOTTOM) === BOTTOM) {
                    e.view.style.alignSelf = "flex-end";
                }
                else if ((e.layoutConfig.alignment & CENTER_Y) === CENTER_Y) {
                    e.view.style.alignSelf = "center";
                }
            });
        }
    }

    class DoricTextNode extends DoricViewNode {
        build() {
            const div = document.createElement('div');
            div.style.display = "flex";
            this.textElement = document.createElement('span');
            div.appendChild(this.textElement);
            div.style.justifyContent = "center";
            div.style.alignItems = "center";
            return div;
        }
        blendProps(v, propName, prop) {
            switch (propName) {
                case 'text':
                    this.textElement.innerText = prop;
                    break;
                case 'textSize':
                    v.style.fontSize = toPixelString(prop);
                    break;
                case 'textColor':
                    v.style.color = toRGBAString(prop);
                    break;
                case 'textAlignment':
                    const gravity = prop;
                    if ((gravity & LEFT) === LEFT) {
                        v.style.justifyContent = "flex-start";
                    }
                    else if ((gravity & RIGHT) === RIGHT) {
                        v.style.justifyContent = "flex-end";
                    }
                    else if ((gravity & CENTER_X) === CENTER_X) {
                        v.style.justifyContent = "center";
                    }
                    if ((gravity & TOP) === TOP) {
                        v.style.alignItems = "flex-start";
                    }
                    else if ((gravity & BOTTOM) === BOTTOM) {
                        v.style.alignItems = "flex-end";
                    }
                    else if ((gravity & CENTER_Y) === CENTER_Y) {
                        v.style.alignItems = "center";
                    }
                    break;
                case "fontStyle":
                    switch (prop) {
                        case "bold":
                            v.style.fontWeight = "bold";
                            v.style.fontStyle = "normal";
                            break;
                        case "italic":
                            v.style.fontWeight = "normal";
                            v.style.fontStyle = "italic";
                            break;
                        case "bold_italic":
                            v.style.fontWeight = "bold";
                            v.style.fontStyle = "italic";
                            break;
                        default:
                            v.style.fontWeight = "normal";
                            v.style.fontStyle = "normal";
                            break;
                    }
                    break;
                default:
                    super.blendProps(v, propName, prop);
                    break;
            }
        }
    }

    var ScaleType;
    (function (ScaleType) {
        ScaleType[ScaleType["ScaleToFill"] = 0] = "ScaleToFill";
        ScaleType[ScaleType["ScaleAspectFit"] = 1] = "ScaleAspectFit";
        ScaleType[ScaleType["ScaleAspectFill"] = 2] = "ScaleAspectFill";
    })(ScaleType || (ScaleType = {}));
    class DoricImageNode extends DoricViewNode {
        build() {
            const ret = document.createElement('img');
            ret.style.objectFit = "fill";
            return ret;
        }
        blendProps(v, propName, prop) {
            switch (propName) {
                case 'imageUrl':
                    v.setAttribute('src', prop);
                    break;
                case 'imageBase64':
                    v.setAttribute('src', prop);
                    break;
                case 'loadCallback':
                    v.onload = () => {
                        this.callJSResponse(prop, {
                            width: v.width,
                            height: v.height
                        });
                    };
                    break;
                case 'scaleType':
                    switch (prop) {
                        case ScaleType.ScaleToFill:
                            v.style.objectFit = "fill";
                            break;
                        case ScaleType.ScaleAspectFit:
                            v.style.objectFit = "contain";
                            break;
                        case ScaleType.ScaleAspectFill:
                            v.style.objectFit = "cover";
                            break;
                    }
                    break;
                case 'isBlur':
                    if (prop) {
                        v.style.filter = 'blur(8px)';
                    }
                    else {
                        v.style.filter = '';
                    }
                    break;
                default:
                    super.blendProps(v, propName, prop);
                    break;
            }
        }
    }

    class DoricScrollerNode extends DoricSuperNode {
        constructor() {
            super(...arguments);
            this.childViewId = "";
        }
        build() {
            const ret = document.createElement('div');
            ret.style.overflow = "scroll";
            return ret;
        }
        blendProps(v, propName, prop) {
            if (propName === 'content') {
                this.childViewId = prop;
            }
            else {
                super.blendProps(v, propName, prop);
            }
        }
        blendSubNode(model) {
            var _a;
            (_a = this.childNode) === null || _a === void 0 ? void 0 : _a.blend(model.props);
        }
        getSubNodeById(viewId) {
            return viewId === this.childViewId ? this.childNode : undefined;
        }
        onBlended() {
            super.onBlended();
            const model = this.getSubModel(this.childViewId);
            if (model === undefined) {
                return;
            }
            if (this.childNode) {
                if (this.childNode.viewId === this.childViewId) ;
                else {
                    if (this.reusable && this.childNode.viewType === model.type) {
                        this.childNode.viewId = model.id;
                        this.childNode.blend(model.props);
                    }
                    else {
                        this.view.removeChild(this.childNode.view);
                        const childNode = DoricViewNode.create(this.context, model.type);
                        if (childNode === undefined) {
                            return;
                        }
                        childNode.viewId = model.id;
                        childNode.init(this);
                        childNode.blend(model.props);
                        this.view.appendChild(childNode.view);
                        this.childNode = childNode;
                    }
                }
            }
            else {
                const childNode = DoricViewNode.create(this.context, model.type);
                if (childNode === undefined) {
                    return;
                }
                childNode.viewId = model.id;
                childNode.init(this);
                childNode.blend(model.props);
                this.view.appendChild(childNode.view);
                this.childNode = childNode;
            }
        }
        layout() {
            super.layout();
        }
    }

    class ModalPlugin extends DoricPlugin {
        toast(args) {
            const toastElement = document.createElement('div');
            toastElement.style.position = "absolute";
            toastElement.style.textAlign = "center";
            toastElement.style.width = "100%";
            const textElement = document.createElement('span');
            textElement.innerText = args.msg || "";
            textElement.style.backgroundColor = "#777777";
            textElement.style.color = "white";
            textElement.style.paddingLeft = '20px';
            textElement.style.paddingRight = '20px';
            textElement.style.paddingTop = '10px';
            textElement.style.paddingBottom = '10px';
            toastElement.appendChild(textElement);
            document.body.appendChild(toastElement);
            const gravity = args.gravity || BOTTOM;
            if ((gravity & TOP) == TOP) {
                toastElement.style.top = toPixelString(30);
            }
            else if ((gravity & BOTTOM) == BOTTOM) {
                toastElement.style.bottom = toPixelString(30);
            }
            else if ((gravity & CENTER_Y) == CENTER_Y) {
                toastElement.style.top = toPixelString(document.body.offsetHeight / 2 - toastElement.offsetHeight / 2);
            }
            setTimeout(() => {
                document.body.removeChild(toastElement);
            }, 2000);
            return Promise.resolve();
        }
        alert(args) {
            window.alert(args.msg || "");
            return Promise.resolve();
        }
        confirm(args) {
            if (window.confirm(args.msg || "")) {
                return Promise.resolve();
            }
            else {
                return Promise.reject();
            }
        }
        prompt(args) {
            const result = window.prompt(args.msg || "", args.defaultText);
            if (result) {
                return Promise.resolve(result);
            }
            else {
                return Promise.reject(result);
            }
        }
    }

    class StoragePlugin extends DoricPlugin {
        setItem(args) {
            localStorage.setItem(`${args.zone}_${args.key}`, args.value);
            return Promise.resolve();
        }
        getItem(args) {
            return Promise.resolve(localStorage.getItem(`${args.zone}_${args.key}`));
        }
        remove(args) {
            localStorage.removeItem(`${args.zone}_${args.key}`);
            return Promise.resolve();
        }
        clear(args) {
            let removingKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${args.zone}_`)) {
                    removingKeys.push(key);
                }
            }
            removingKeys.forEach(e => {
                localStorage.removeItem(e);
            });
            return Promise.resolve();
        }
    }

    class NavigatorPlugin extends DoricPlugin {
        constructor() {
            super(...arguments);
            this.navigation = document.getElementsByTagName('doric-navigation')[0];
        }
        push(args) {
            var _a;
            if (this.navigation) {
                const div = new DoricElement;
                div.src = args.source;
                div.alias = ((_a = args.config) === null || _a === void 0 ? void 0 : _a.alias) || args.source;
                this.navigation.push(div);
                return Promise.resolve();
            }
            else {
                return Promise.reject('Not implemented');
            }
        }
        pop() {
            if (this.navigation) {
                this.navigation.pop();
                return Promise.resolve();
            }
            else {
                return Promise.reject('Not implemented');
            }
        }
    }

    class PopoverPlugin extends DoricPlugin {
        constructor(context) {
            super(context);
            this.fullScreen = document.createElement('div');
            this.fullScreen.id = `PopOver__${context.contextId}`;
            this.fullScreen.style.position = 'fixed';
            this.fullScreen.style.top = '0px';
            this.fullScreen.style.width = "100%";
            this.fullScreen.style.height = "100%";
        }
        show(model) {
            const viewNode = DoricViewNode.create(this.context, model.type);
            if (viewNode === undefined) {
                return Promise.reject(`Cannot create ViewNode for ${model.type}`);
            }
            viewNode.viewId = model.id;
            viewNode.init();
            viewNode.blend(model.props);
            this.fullScreen.appendChild(viewNode.view);
            let map = this.context.headNodes.get(PopoverPlugin.TYPE);
            if (map) {
                map.set(model.id, viewNode);
            }
            else {
                map = new Map;
                map.set(model.id, viewNode);
                this.context.headNodes.set(PopoverPlugin.TYPE, map);
            }
            if (!document.body.contains(this.fullScreen)) {
                document.body.appendChild(this.fullScreen);
            }
            return Promise.resolve();
        }
        dismiss(args) {
            if (args) {
                let map = this.context.headNodes.get(PopoverPlugin.TYPE);
                if (map) {
                    const viewNode = map.get(args.id);
                    if (viewNode) {
                        this.fullScreen.removeChild(viewNode.view);
                    }
                    if (map.size === 0) {
                        document.body.removeChild(this.fullScreen);
                    }
                }
            }
            else {
                this.dismissAll();
            }
            return Promise.resolve();
        }
        dismissAll() {
            let map = this.context.headNodes.get(PopoverPlugin.TYPE);
            if (map) {
                for (let node of map.values()) {
                    map.delete(node.viewId);
                    this.fullScreen.removeChild(node.view);
                }
            }
            if (document.body.contains(this.fullScreen)) {
                document.body.removeChild(this.fullScreen);
            }
        }
        onTearDown() {
            super.onTearDown();
            this.dismissAll();
        }
    }
    PopoverPlugin.TYPE = "popover";

    class DoricListItemNode extends DoricStackNode {
    }

    class DoricListNode extends DoricSuperNode {
        constructor() {
            super(...arguments);
            this.itemCount = 0;
            this.batchCount = 15;
            this.loadMore = false;
            this.childNodes = [];
        }
        blendProps(v, propName, prop) {
            switch (propName) {
                case "itemCount":
                    this.itemCount = prop;
                    break;
                case "renderItem":
                    this.reset();
                    this.renderItemFuncId = prop;
                    break;
                case "onLoadMore":
                    this.onLoadMoreFuncId = prop;
                    break;
                case "loadMoreView":
                    this.loadMoreViewId = prop;
                    break;
                case "batchCount":
                    this.batchCount = prop;
                    break;
                case "loadMore":
                    this.loadMore = prop;
                    break;
                default:
                    super.blendProps(v, propName, prop);
                    break;
            }
        }
        reset() {
            while (this.view.lastElementChild) {
                this.view.removeChild(this.view.lastElementChild);
            }
        }
        onBlended() {
            super.onBlended();
            if (this.childNodes.length !== this.itemCount) {
                const ret = this.callJSResponse("renderBunchedItems", this.childNodes.length, this.itemCount);
                this.childNodes = this.childNodes.concat(ret.map(e => {
                    const viewNode = DoricViewNode.create(this.context, e.type);
                    viewNode.viewId = e.id;
                    viewNode.init(this);
                    viewNode.blend(e.props);
                    this.view.appendChild(viewNode.view);
                    return viewNode;
                }));
            }
            if (this.loadMoreViewNode && this.view.contains(this.loadMoreViewNode.view)) {
                this.view.removeChild(this.loadMoreViewNode.view);
            }
            if (this.loadMore) {
                if (!this.loadMoreViewNode) {
                    const loadMoreViewModel = this.getSubModel(this.loadMoreViewId || "");
                    if (loadMoreViewModel) {
                        this.loadMoreViewNode = DoricViewNode.create(this.context, loadMoreViewModel.type);
                        this.loadMoreViewNode.viewId = loadMoreViewModel.id;
                        this.loadMoreViewNode.init(this);
                        this.loadMoreViewNode.blend(loadMoreViewModel.props);
                    }
                }
                if (this.loadMoreViewNode) {
                    this.view.appendChild(this.loadMoreViewNode.view);
                }
            }
        }
        blendSubNode(model) {
            const viewNode = this.getSubNodeById(model.id);
            if (viewNode) {
                viewNode.blend(model.props);
            }
        }
        getSubNodeById(viewId) {
            if (viewId === this.loadMoreViewId) {
                return this.loadMoreViewNode;
            }
            return this.childNodes.filter(e => e.viewId === viewId)[0];
        }
        onScrollToEnd() {
            if (this.loadMore && this.onLoadMoreFuncId) {
                this.callJSResponse(this.onLoadMoreFuncId);
            }
        }
        build() {
            const ret = document.createElement('div');
            ret.style.overflow = "scroll";
            ret.addEventListener("scroll", () => {
                if (this.loadMore) {
                    if (ret.scrollTop + ret.offsetHeight === ret.scrollHeight) {
                        this.onScrollToEnd();
                    }
                }
            });
            return ret;
        }
    }

    class DoricDraggableNode extends DoricStackNode {
        constructor() {
            super(...arguments);
            this.onDrag = "";
            this.dragging = false;
            this.lastX = 0;
            this.lastY = 0;
        }
        build() {
            const ret = document.createElement('div');
            ret.ontouchstart = (event) => {
                this.dragging = true;
                this.lastX = event.targetTouches[0].clientX;
                this.lastY = event.targetTouches[0].clientY;
            };
            ret.ontouchend = (event) => {
                this.dragging = false;
            };
            ret.ontouchcancel = (event) => {
                this.dragging = false;
            };
            ret.ontouchmove = (event) => {
                if (this.dragging) {
                    this.offsetX += (event.targetTouches[0].clientX - this.lastX);
                    this.offsetY += (event.targetTouches[0].clientY - this.lastY);
                    this.callJSResponse(this.onDrag, this.offsetX, this.offsetY);
                    this.lastX = event.targetTouches[0].clientX;
                    this.lastY = event.targetTouches[0].clientY;
                }
            };
            ret.onmousedown = (event) => {
                this.dragging = true;
                this.lastX = event.x;
                this.lastY = event.y;
            };
            ret.onmousemove = (event) => {
                if (this.dragging) {
                    this.offsetX += (event.x - this.lastX);
                    this.offsetY += (event.y - this.lastY);
                    this.callJSResponse(this.onDrag, this.offsetX, this.offsetY);
                    this.lastX = event.x;
                    this.lastY = event.y;
                }
            };
            ret.onmouseup = (event) => {
                this.dragging = false;
            };
            ret.onmouseout = (event) => {
                this.dragging = false;
            };
            ret.style.position = "relative";
            return ret;
        }
        blendProps(v, propName, prop) {
            switch (propName) {
                case 'onDrag':
                    this.onDrag = prop;
                    break;
                default:
                    super.blendProps(v, propName, prop);
                    break;
            }
        }
    }

    const bundles = new Map;
    const plugins = new Map;
    const nodes = new Map;
    function acquireJSBundle(name) {
        return bundles.get(name);
    }
    function registerJSBundle(name, bundle) {
        bundles.set(name, bundle);
    }
    function registerPlugin(name, plugin) {
        plugins.set(name, plugin);
    }
    function acquirePlugin(name) {
        return plugins.get(name);
    }
    function registerViewNode(name, node) {
        nodes.set(name, node);
    }
    function acquireViewNode(name) {
        return nodes.get(name);
    }
    registerPlugin('shader', ShaderPlugin);
    registerPlugin('modal', ModalPlugin);
    registerPlugin('storage', StoragePlugin);
    registerPlugin('navigator', NavigatorPlugin);
    registerPlugin('popover', PopoverPlugin);
    registerViewNode('Stack', DoricStackNode);
    registerViewNode('VLayout', DoricVLayoutNode);
    registerViewNode('HLayout', DoricHLayoutNode);
    registerViewNode('Text', DoricTextNode);
    registerViewNode('Image', DoricImageNode);
    registerViewNode('Scroller', DoricScrollerNode);
    registerViewNode('ListItem', DoricListItemNode);
    registerViewNode('List', DoricListNode);
    registerViewNode('Draggable', DoricDraggableNode);

    function getScriptId(contextId) {
        return `__doric_script_${contextId}`;
    }
    const originSetTimeout = window.setTimeout;
    const originClearTimeout = window.clearTimeout;
    const originSetInterval = window.setInterval;
    const originClearInterval = window.clearInterval;
    const timers = new Map;
    function injectGlobalObject(name, value) {
        Reflect.set(window, name, value, window);
    }
    function loadJS(contextId, script) {
        const scriptElement = document.createElement('script');
        scriptElement.text = script;
        scriptElement.id = getScriptId(contextId);
        document.body.appendChild(scriptElement);
    }
    function packageModuleScript(name, content) {
        return `Reflect.apply(doric.jsRegisterModule,this,[${name},Reflect.apply(function(__module){(function(module,exports,require,setTimeout,setInterval,clearTimeout,clearInterval){
${content}
})(__module,__module.exports,doric.__require__,doricSetTimeout,doricSetInterval,doricClearTimeout,doricClearInterval);
return __module.exports;},this,[{exports:{}}])])`;
    }
    function packageCreateContext(contextId, content) {
        return `//@ sourceURL=contextId_${contextId}.js
Reflect.apply(function(doric,context,Entry,require,exports,setTimeout,setInterval,clearTimeout,clearInterval){
${content}
},undefined,[undefined,doric.jsObtainContext("${contextId}"),doric.jsObtainEntry("${contextId}"),doric.__require__,{},doricSetTimeout,doricSetInterval,doricClearTimeout,doricClearInterval])`;
    }
    function initDoric() {
        injectGlobalObject("Environment", {
            platform: "h5"
        });
        injectGlobalObject("nativeEmpty", () => undefined);
        injectGlobalObject('nativeLog', (type, message) => {
            switch (type) {
                case 'd':
                    console.log(message);
                    break;
                case 'w':
                    console.warn(message);
                    break;
                case 'e':
                    console.error(message);
                    break;
            }
        });
        injectGlobalObject('nativeRequire', (moduleName) => {
            const bundle = acquireJSBundle(moduleName);
            if (bundle === undefined || bundle.length === 0) {
                console.log(`Cannot require JS Bundle :${moduleName}`);
                return false;
            }
            else {
                loadJS(moduleName, packageModuleScript(moduleName, packageModuleScript(name, bundle)));
                return true;
            }
        });
        injectGlobalObject('nativeBridge', (contextId, namespace, method, callbackId, args) => {
            const pluginClass = acquirePlugin(namespace);
            const doricContext = getDoricContext(contextId);
            if (pluginClass === undefined) {
                console.error(`Cannot find Plugin:${namespace}`);
                return false;
            }
            if (doricContext === undefined) {
                console.error(`Cannot find Doric Context:${contextId}`);
                return false;
            }
            let plugin = doricContext.pluginInstances.get(namespace);
            if (plugin === undefined) {
                plugin = new pluginClass(doricContext);
                doricContext.pluginInstances.set(namespace, plugin);
            }
            if (!Reflect.has(plugin, method)) {
                console.error(`Cannot find Method:${method} in plugin ${namespace}`);
                return false;
            }
            const pluginMethod = Reflect.get(plugin, method, plugin);
            if (typeof pluginMethod !== 'function') {
                console.error(`Plugin ${namespace}'s property ${method}'s type is ${typeof pluginMethod} not function,`);
            }
            const ret = Reflect.apply(pluginMethod, plugin, [args]);
            if (ret instanceof Promise) {
                ret.then(e => {
                    sandbox.jsCallResolve(contextId, callbackId, e);
                }, e => {
                    sandbox.jsCallReject(contextId, callbackId, e);
                });
            }
            else if (ret !== undefined) {
                sandbox.jsCallResolve(contextId, callbackId, ret);
            }
            return true;
        });
        injectGlobalObject('nativeSetTimer', (timerId, time, repeat) => {
            if (repeat) {
                const handleId = originSetInterval(() => {
                    sandbox.jsCallbackTimer(timerId);
                }, time);
                timers.set(timerId, { handleId, repeat });
            }
            else {
                const handleId = originSetTimeout(() => {
                    sandbox.jsCallbackTimer(timerId);
                }, time);
                timers.set(timerId, { handleId, repeat });
            }
        });
        injectGlobalObject('nativeClearTimer', (timerId) => {
            const timerInfo = timers.get(timerId);
            if (timerInfo) {
                if (timerInfo.repeat) {
                    originClearInterval(timerInfo.handleId);
                }
                else {
                    originClearTimeout(timerInfo.handleId);
                }
            }
        });
    }
    function createContext(contextId, content) {
        loadJS(contextId, packageCreateContext(contextId, content));
    }
    function destroyContext(contextId) {
        sandbox.jsReleaseContext(contextId);
        const scriptElement = document.getElementById(getScriptId(contextId));
        if (scriptElement) {
            document.body.removeChild(scriptElement);
        }
    }
    initDoric();

    const doricContexts = new Map;
    let __contextId__ = 0;
    function getContextId() {
        return `context_${__contextId__++}`;
    }
    function getDoricContext(contextId) {
        return doricContexts.get(contextId);
    }
    class DoricContext {
        constructor(content) {
            this.contextId = getContextId();
            this.pluginInstances = new Map;
            this.headNodes = new Map;
            createContext(this.contextId, content);
            doricContexts.set(this.contextId, this);
            this.rootNode = new DoricStackNode(this);
        }
        get panel() {
            var _a;
            return (_a = sandbox.jsObtainContext(this.contextId)) === null || _a === void 0 ? void 0 : _a.entity;
        }
        invokeEntityMethod(method, ...otherArgs) {
            const argumentsList = [this.contextId];
            for (let i = 0; i < arguments.length; i++) {
                argumentsList.push(arguments[i]);
            }
            return Reflect.apply(sandbox.jsCallEntityMethod, this.panel, argumentsList);
        }
        init(extra) {
            this.invokeEntityMethod("__init__", extra ? JSON.stringify(extra) : undefined);
        }
        build(frame) {
            this.invokeEntityMethod("__build__", frame);
        }
        teardown() {
            for (let plugin of this.pluginInstances.values()) {
                plugin.onTearDown();
            }
            destroyContext(this.contextId);
        }
    }

    class DoricElement extends HTMLElement {
        constructor() {
            super();
        }
        get src() {
            return this.getAttribute('src');
        }
        get alias() {
            return this.getAttribute('alias');
        }
        set src(v) {
            this.setAttribute('src', v);
        }
        set alias(v) {
            this.setAttribute('alias', v);
        }
        connectedCallback() {
            if (this.src && this.context === undefined) {
                axios.get(this.src).then(result => {
                    this.load(result.data);
                });
            }
        }
        disconnectedCallback() {
        }
        adoptedCallback() {
        }
        attributeChangedCallback() {
        }
        onDestroy() {
            var _a;
            (_a = this.context) === null || _a === void 0 ? void 0 : _a.teardown();
        }
        load(content) {
            this.context = new DoricContext(content);
            const divElement = document.createElement('div');
            divElement.style.position = 'relative';
            divElement.style.height = '100%';
            this.append(divElement);
            this.context.rootNode.view = divElement;
            this.context.build({
                width: divElement.offsetWidth,
                height: divElement.offsetHeight,
            });
        }
    }

    class NavigationElement extends HTMLElement {
        constructor() {
            super(...arguments);
            this.elementStack = [];
        }
        get currentNode() {
            for (let i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i] instanceof DoricElement) {
                    return this.childNodes[i];
                }
            }
            return undefined;
        }
        push(element) {
            const currentNode = this.currentNode;
            if (currentNode) {
                this.elementStack.push(currentNode);
                this.replaceChild(element, currentNode);
            }
            else {
                this.appendChild(element);
            }
        }
        pop() {
            const lastElement = this.elementStack.pop();
            const currentNode = this.currentNode;
            if (lastElement && currentNode) {
                this.replaceChild(lastElement, currentNode);
                currentNode.onDestroy();
            }
            else {
                window.history.back();
            }
        }
    }

    window.customElements.define('doric-div', DoricElement);
    window.customElements.define('doric-navigation', NavigationElement);

    exports.BOTTOM = BOTTOM;
    exports.CENTER = CENTER;
    exports.CENTER_X = CENTER_X;
    exports.CENTER_Y = CENTER_Y;
    exports.DoricElement = DoricElement;
    exports.DoricGroupViewNode = DoricGroupViewNode;
    exports.DoricPlugin = DoricPlugin;
    exports.DoricSuperNode = DoricSuperNode;
    exports.DoricViewNode = DoricViewNode;
    exports.LEFT = LEFT;
    exports.NavigationElement = NavigationElement;
    exports.RIGHT = RIGHT;
    exports.TOP = TOP;
    exports.acquireJSBundle = acquireJSBundle;
    exports.acquirePlugin = acquirePlugin;
    exports.acquireViewNode = acquireViewNode;
    exports.createContext = createContext;
    exports.destroyContext = destroyContext;
    exports.injectGlobalObject = injectGlobalObject;
    exports.loadJS = loadJS;
    exports.registerJSBundle = registerJSBundle;
    exports.registerPlugin = registerPlugin;
    exports.registerViewNode = registerViewNode;
    exports.toPixelString = toPixelString;
    exports.toRGBAString = toRGBAString;

    return exports;

}({}, axios, doric));
//# sourceMappingURL=index.js.map
