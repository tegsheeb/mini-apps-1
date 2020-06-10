/** @license React v16.13.1
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (global = global || self, factory(global.React = {}));
})(this, function (exports) {
  'use strict';

  var ReactVersion = '16.13.1'; // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
  // nor polyfill, then a plain number is used for performance.

  var hasSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
  var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
  var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
  var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
  var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
  var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
  var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary

  var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
  var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
  var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
  var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
  var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
  var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
  var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
  var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
  var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
  var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;
  var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';

  function getIteratorFn(maybeIterable) {
    if (maybeIterable === null || typeof maybeIterable !== 'object') {
      return null;
    }

    var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

    if (typeof maybeIterator === 'function') {
      return maybeIterator;
    }

    return null;
  }
  /*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  */

  /* eslint-disable no-unused-vars */


  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;

  function toObject(val) {
    if (val === null || val === undefined) {
      throw new TypeError('Object.assign cannot be called with null or undefined');
    }

    return Object(val);
  }

  function shouldUseNative() {
    try {
      if (!Object.assign) {
        return false;
      } // Detect buggy property enumeration order in older V8 versions.
      // https://bugs.chromium.org/p/v8/issues/detail?id=4118


      var test1 = new String('abc'); // eslint-disable-line no-new-wrappers

      test1[5] = 'de';

      if (Object.getOwnPropertyNames(test1)[0] === '5') {
        return false;
      } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


      var test2 = {};

      for (var i = 0; i < 10; i++) {
        test2['_' + String.fromCharCode(i)] = i;
      }

      var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
        return test2[n];
      });

      if (order2.join('') !== '0123456789') {
        return false;
      } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


      var test3 = {};
      'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
        test3[letter] = letter;
      });

      if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
        return false;
      }

      return true;
    } catch (err) {
      // We don't expect any of the above to throw, but better to be safe.
      return false;
    }
  }

  var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    var from;
    var to = toObject(target);
    var symbols;

    for (var s = 1; s < arguments.length; s++) {
      from = Object(arguments[s]);

      for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }

      if (getOwnPropertySymbols) {
        symbols = getOwnPropertySymbols(from);

        for (var i = 0; i < symbols.length; i++) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[i]] = from[symbols[i]];
          }
        }
      }
    }

    return to;
  };
  /**
   * Keeps track of the current dispatcher.
   */

  var ReactCurrentDispatcher = {
    /**
     * @internal
     * @type {ReactComponent}
     */
    current: null
  };
  /**
   * Keeps track of the current batch's configuration such as how long an update
   * should suspend for if it needs to.
   */

  var ReactCurrentBatchConfig = {
    suspense: null
  };
  /**
   * Keeps track of the current owner.
   *
   * The current owner is the component who should own any components that are
   * currently being constructed.
   */

  var ReactCurrentOwner = {
    /**
     * @internal
     * @type {ReactComponent}
     */
    current: null
  };
  var BEFORE_SLASH_RE = /^(.*)[\\\/]/;

  function describeComponentFrame(name, source, ownerName) {
    var sourceInfo = '';

    if (source) {
      var path = source.fileName;
      var fileName = path.replace(BEFORE_SLASH_RE, '');
      {
        // In DEV, include code for a common special case:
        // prefer "folder/index.js" instead of just "index.js".
        if (/^index\./.test(fileName)) {
          var match = path.match(BEFORE_SLASH_RE);

          if (match) {
            var pathBeforeSlash = match[1];

            if (pathBeforeSlash) {
              var folderName = pathBeforeSlash.replace(BEFORE_SLASH_RE, '');
              fileName = folderName + '/' + fileName;
            }
          }
        }
      }
      sourceInfo = ' (at ' + fileName + ':' + source.lineNumber + ')';
    } else if (ownerName) {
      sourceInfo = ' (created by ' + ownerName + ')';
    }

    return '\n    in ' + (name || 'Unknown') + sourceInfo;
  }

  var Resolved = 1;

  function refineResolvedLazyComponent(lazyComponent) {
    return lazyComponent._status === Resolved ? lazyComponent._result : null;
  }

  function getWrappedName(outerType, innerType, wrapperName) {
    var functionName = innerType.displayName || innerType.name || '';
    return outerType.displayName || (functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName);
  }

  function getComponentName(type) {
    if (type == null) {
      // Host root, text node or just invalid type.
      return null;
    }

    {
      if (typeof type.tag === 'number') {
        error('Received an unexpected object in getComponentName(). ' + 'This is likely a bug in React. Please file an issue.');
      }
    }

    if (typeof type === 'function') {
      return type.displayName || type.name || null;
    }

    if (typeof type === 'string') {
      return type;
    }

    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return 'Fragment';

      case REACT_PORTAL_TYPE:
        return 'Portal';

      case REACT_PROFILER_TYPE:
        return "Profiler";

      case REACT_STRICT_MODE_TYPE:
        return 'StrictMode';

      case REACT_SUSPENSE_TYPE:
        return 'Suspense';

      case REACT_SUSPENSE_LIST_TYPE:
        return 'SuspenseList';
    }

    if (typeof type === 'object') {
      switch (type.$$typeof) {
        case REACT_CONTEXT_TYPE:
          return 'Context.Consumer';

        case REACT_PROVIDER_TYPE:
          return 'Context.Provider';

        case REACT_FORWARD_REF_TYPE:
          return getWrappedName(type, type.render, 'ForwardRef');

        case REACT_MEMO_TYPE:
          return getComponentName(type.type);

        case REACT_BLOCK_TYPE:
          return getComponentName(type.render);

        case REACT_LAZY_TYPE:
          {
            var thenable = type;
            var resolvedThenable = refineResolvedLazyComponent(thenable);

            if (resolvedThenable) {
              return getComponentName(resolvedThenable);
            }

            break;
          }
      }
    }

    return null;
  }

  var ReactDebugCurrentFrame = {};
  var currentlyValidatingElement = null;

  function setCurrentlyValidatingElement(element) {
    {
      currentlyValidatingElement = element;
    }
  }

  {
    // Stack implementation injected by the current renderer.
    ReactDebugCurrentFrame.getCurrentStack = null;

    ReactDebugCurrentFrame.getStackAddendum = function () {
      var stack = ''; // Add an extra top frame while an element is being validated

      if (currentlyValidatingElement) {
        var name = getComponentName(currentlyValidatingElement.type);
        var owner = currentlyValidatingElement._owner;
        stack += describeComponentFrame(name, currentlyValidatingElement._source, owner && getComponentName(owner.type));
      } // Delegate to the injected renderer-specific implementation


      var impl = ReactDebugCurrentFrame.getCurrentStack;

      if (impl) {
        stack += impl() || '';
      }

      return stack;
    };
  }
  /**
   * Used by act() to track whether you're inside an act() scope.
   */

  var IsSomeRendererActing = {
    current: false
  };
  var ReactSharedInternals = {
    ReactCurrentDispatcher: ReactCurrentDispatcher,
    ReactCurrentBatchConfig: ReactCurrentBatchConfig,
    ReactCurrentOwner: ReactCurrentOwner,
    IsSomeRendererActing: IsSomeRendererActing,
    // Used by renderers to avoid bundling object-assign twice in UMD bundles:
    assign: objectAssign
  };
  {
    objectAssign(ReactSharedInternals, {
      // These should not be included in production.
      ReactDebugCurrentFrame: ReactDebugCurrentFrame,
      // Shim for React DOM 16.0.0 which still destructured (but not used) this.
      // TODO: remove in React 17.0.
      ReactComponentTreeHook: {}
    });
  } // by calls to these methods by a Babel plugin.
  //
  // In PROD (or in packages without access to React internals),
  // they are left as they are instead.

  function warn(format) {
    {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      printWarning('warn', format, args);
    }
  }

  function error(format) {
    {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      printWarning('error', format, args);
    }
  }

  function printWarning(level, format, args) {
    // When changing this logic, you might want to also
    // update consoleWithStackDev.www.js as well.
    {
      var hasExistingStack = args.length > 0 && typeof args[args.length - 1] === 'string' && args[args.length - 1].indexOf('\n    in') === 0;

      if (!hasExistingStack) {
        var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
        var stack = ReactDebugCurrentFrame.getStackAddendum();

        if (stack !== '') {
          format += '%s';
          args = args.concat([stack]);
        }
      }

      var argsWithFormat = args.map(function (item) {
        return '' + item;
      }); // Careful: RN currently depends on this prefix

      argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
      // breaks IE9: https://github.com/facebook/react/issues/13610
      // eslint-disable-next-line react-internal/no-production-logging

      Function.prototype.apply.call(console[level], console, argsWithFormat);

      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        var argIndex = 0;
        var message = 'Warning: ' + format.replace(/%s/g, function () {
          return args[argIndex++];
        });
        throw new Error(message);
      } catch (x) {}
    }
  }

  var didWarnStateUpdateForUnmountedComponent = {};

  function warnNoop(publicInstance, callerName) {
    {
      var _constructor = publicInstance.constructor;
      var componentName = _constructor && (_constructor.displayName || _constructor.name) || 'ReactClass';
      var warningKey = componentName + "." + callerName;

      if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
        return;
      }

      error("Can't call %s on a component that is not yet mounted. " + 'This is a no-op, but it might indicate a bug in your application. ' + 'Instead, assign to `this.state` directly or define a `state = {};` ' + 'class property with the desired state in the %s component.', callerName, componentName);
      didWarnStateUpdateForUnmountedComponent[warningKey] = true;
    }
  }
  /**
   * This is the abstract API for an update queue.
   */


  var ReactNoopUpdateQueue = {
    /**
     * Checks whether or not this composite component is mounted.
     * @param {ReactClass} publicInstance The instance we want to test.
     * @return {boolean} True if mounted, false otherwise.
     * @protected
     * @final
     */
    isMounted: function (publicInstance) {
      return false;
    },

    /**
     * Forces an update. This should only be invoked when it is known with
     * certainty that we are **not** in a DOM transaction.
     *
     * You may want to call this when you know that some deeper aspect of the
     * component's state has changed but `setState` was not called.
     *
     * This will not invoke `shouldComponentUpdate`, but it will invoke
     * `componentWillUpdate` and `componentDidUpdate`.
     *
     * @param {ReactClass} publicInstance The instance that should rerender.
     * @param {?function} callback Called after component is updated.
     * @param {?string} callerName name of the calling function in the public API.
     * @internal
     */
    enqueueForceUpdate: function (publicInstance, callback, callerName) {
      warnNoop(publicInstance, 'forceUpdate');
    },

    /**
     * Replaces all of the state. Always use this or `setState` to mutate state.
     * You should treat `this.state` as immutable.
     *
     * There is no guarantee that `this.state` will be immediately updated, so
     * accessing `this.state` after calling this method may return the old value.
     *
     * @param {ReactClass} publicInstance The instance that should rerender.
     * @param {object} completeState Next state.
     * @param {?function} callback Called after component is updated.
     * @param {?string} callerName name of the calling function in the public API.
     * @internal
     */
    enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
      warnNoop(publicInstance, 'replaceState');
    },

    /**
     * Sets a subset of the state. This only exists because _pendingState is
     * internal. This provides a merging strategy that is not available to deep
     * properties which is confusing. TODO: Expose pendingState or don't use it
     * during the merge.
     *
     * @param {ReactClass} publicInstance The instance that should rerender.
     * @param {object} partialState Next partial state to be merged with state.
     * @param {?function} callback Called after component is updated.
     * @param {?string} Name of the calling function in the public API.
     * @internal
     */
    enqueueSetState: function (publicInstance, partialState, callback, callerName) {
      warnNoop(publicInstance, 'setState');
    }
  };
  var emptyObject = {};
  {
    Object.freeze(emptyObject);
  }
  /**
   * Base class helpers for the updating state of a component.
   */

  function Component(props, context, updater) {
    this.props = props;
    this.context = context; // If a component has string refs, we will assign a different object later.

    this.refs = emptyObject; // We initialize the default updater but the real one gets injected by the
    // renderer.

    this.updater = updater || ReactNoopUpdateQueue;
  }

  Component.prototype.isReactComponent = {};
  /**
   * Sets a subset of the state. Always use this to mutate
   * state. You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * There is no guarantee that calls to `setState` will run synchronously,
   * as they may eventually be batched together.  You can provide an optional
   * callback that will be executed when the call to setState is actually
   * completed.
   *
   * When a function is provided to setState, it will be called at some point in
   * the future (not synchronously). It will be called with the up to date
   * component arguments (state, props, context). These values can be different
   * from this.* because your function may be called after receiveProps but before
   * shouldComponentUpdate, and this new state, props, and context will not yet be
   * assigned to this.
   *
   * @param {object|function} partialState Next partial state or function to
   *        produce next partial state to be merged with current state.
   * @param {?function} callback Called after state is updated.
   * @final
   * @protected
   */

  Component.prototype.setState = function (partialState, callback) {
    if (!(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null)) {
      {
        throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      }
    }

    this.updater.enqueueSetState(this, partialState, callback, 'setState');
  };
  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {?function} callback Called after update is complete.
   * @final
   * @protected
   */


  Component.prototype.forceUpdate = function (callback) {
    this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
  };
  /**
   * Deprecated APIs. These APIs used to exist on classic React classes but since
   * we would like to deprecate them, we're not going to move them over to this
   * modern base class. Instead, we define a getter that warns if it's accessed.
   */


  {
    var deprecatedAPIs = {
      isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
      replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
    };

    var defineDeprecationWarning = function (methodName, info) {
      Object.defineProperty(Component.prototype, methodName, {
        get: function () {
          warn('%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);
          return undefined;
        }
      });
    };

    for (var fnName in deprecatedAPIs) {
      if (deprecatedAPIs.hasOwnProperty(fnName)) {
        defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      }
    }
  }

  function ComponentDummy() {}

  ComponentDummy.prototype = Component.prototype;
  /**
   * Convenience component with default shallow equality check for sCU.
   */

  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context; // If a component has string refs, we will assign a different object later.

    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }

  var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
  pureComponentPrototype.constructor = PureComponent; // Avoid an extra prototype jump for these methods.

  objectAssign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true; // an immutable object with a single mutable value

  function createRef() {
    var refObject = {
      current: null
    };
    {
      Object.seal(refObject);
    }
    return refObject;
  }

  var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  var RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true
  };
  var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;
  {
    didWarnAboutStringRefs = {};
  }

  function hasValidRef(config) {
    {
      if (hasOwnProperty$1.call(config, 'ref')) {
        var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

        if (getter && getter.isReactWarning) {
          return false;
        }
      }
    }
    return config.ref !== undefined;
  }

  function hasValidKey(config) {
    {
      if (hasOwnProperty$1.call(config, 'key')) {
        var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

        if (getter && getter.isReactWarning) {
          return false;
        }
      }
    }
    return config.key !== undefined;
  }

  function defineKeyPropWarningGetter(props, displayName) {
    var warnAboutAccessingKey = function () {
      {
        if (!specialPropKeyWarningShown) {
          specialPropKeyWarningShown = true;
          error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
        }
      }
    };

    warnAboutAccessingKey.isReactWarning = true;
    Object.defineProperty(props, 'key', {
      get: warnAboutAccessingKey,
      configurable: true
    });
  }

  function defineRefPropWarningGetter(props, displayName) {
    var warnAboutAccessingRef = function () {
      {
        if (!specialPropRefWarningShown) {
          specialPropRefWarningShown = true;
          error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
        }
      }
    };

    warnAboutAccessingRef.isReactWarning = true;
    Object.defineProperty(props, 'ref', {
      get: warnAboutAccessingRef,
      configurable: true
    });
  }

  function warnIfStringRefCannotBeAutoConverted(config) {
    {
      if (typeof config.ref === 'string' && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
        var componentName = getComponentName(ReactCurrentOwner.current.type);

        if (!didWarnAboutStringRefs[componentName]) {
          error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://fb.me/react-strict-mode-string-ref', getComponentName(ReactCurrentOwner.current.type), config.ref);
          didWarnAboutStringRefs[componentName] = true;
        }
      }
    }
  }
  /**
   * Factory method to create a new React element. This no longer adheres to
   * the class pattern, so do not use new to call it. Also, instanceof check
   * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
   * if something is a React Element.
   *
   * @param {*} type
   * @param {*} props
   * @param {*} key
   * @param {string|object} ref
   * @param {*} owner
   * @param {*} self A *temporary* helper to detect places where `this` is
   * different from the `owner` when React.createElement is called, so that we
   * can warn. We want to get rid of owner and replace string `ref`s with arrow
   * functions, and as long as `this` and owner are the same, there will be no
   * change in behavior.
   * @param {*} source An annotation object (added by a transpiler or otherwise)
   * indicating filename, line number, and/or other information.
   * @internal
   */


  var ReactElement = function (type, key, ref, self, source, owner, props) {
    var element = {
      // This tag allows us to uniquely identify this as a React Element
      $$typeof: REACT_ELEMENT_TYPE,
      // Built-in properties that belong on the element
      type: type,
      key: key,
      ref: ref,
      props: props,
      // Record the component responsible for creating this element.
      _owner: owner
    };
    {
      // The validation flag is currently mutative. We put it on
      // an external backing store so that we can freeze the whole object.
      // This can be replaced with a WeakMap once they are implemented in
      // commonly used development environments.
      element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
      // the validation flag non-enumerable (where possible, which should
      // include every environment we run tests in), so the test framework
      // ignores it.

      Object.defineProperty(element._store, 'validated', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: false
      }); // self and source are DEV only properties.

      Object.defineProperty(element, '_self', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: self
      }); // Two elements created in two different places should be considered
      // equal for testing purposes and therefore we hide it from enumeration.

      Object.defineProperty(element, '_source', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: source
      });

      if (Object.freeze) {
        Object.freeze(element.props);
        Object.freeze(element);
      }
    }
    return element;
  };
  /**
   * Create and return a new ReactElement of the given type.
   * See https://reactjs.org/docs/react-api.html#createelement
   */


  function createElement(type, config, children) {
    var propName; // Reserved names are extracted

    var props = {};
    var key = null;
    var ref = null;
    var self = null;
    var source = null;

    if (config != null) {
      if (hasValidRef(config)) {
        ref = config.ref;
        {
          warnIfStringRefCannotBeAutoConverted(config);
        }
      }

      if (hasValidKey(config)) {
        key = '' + config.key;
      }

      self = config.__self === undefined ? null : config.__self;
      source = config.__source === undefined ? null : config.__source; // Remaining properties are added to a new props object

      for (propName in config) {
        if (hasOwnProperty$1.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
          props[propName] = config[propName];
        }
      }
    } // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.


    var childrenLength = arguments.length - 2;

    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);

      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }

      {
        if (Object.freeze) {
          Object.freeze(childArray);
        }
      }
      props.children = childArray;
    } // Resolve default props


    if (type && type.defaultProps) {
      var defaultProps = type.defaultProps;

      for (propName in defaultProps) {
        if (props[propName] === undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }

    {
      if (key || ref) {
        var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

        if (key) {
          defineKeyPropWarningGetter(props, displayName);
        }

        if (ref) {
          defineRefPropWarningGetter(props, displayName);
        }
      }
    }
    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
  }

  function cloneAndReplaceKey(oldElement, newKey) {
    var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
    return newElement;
  }
  /**
   * Clone and return a new ReactElement using element as the starting point.
   * See https://reactjs.org/docs/react-api.html#cloneelement
   */


  function cloneElement(element, config, children) {
    if (!!(element === null || element === undefined)) {
      {
        throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
      }
    }

    var propName; // Original props are copied

    var props = objectAssign({}, element.props); // Reserved names are extracted

    var key = element.key;
    var ref = element.ref; // Self is preserved since the owner is preserved.

    var self = element._self; // Source is preserved since cloneElement is unlikely to be targeted by a
    // transpiler, and the original source is probably a better indicator of the
    // true owner.

    var source = element._source; // Owner will be preserved, unless ref is overridden

    var owner = element._owner;

    if (config != null) {
      if (hasValidRef(config)) {
        // Silently steal the ref from the parent.
        ref = config.ref;
        owner = ReactCurrentOwner.current;
      }

      if (hasValidKey(config)) {
        key = '' + config.key;
      } // Remaining properties override existing props


      var defaultProps;

      if (element.type && element.type.defaultProps) {
        defaultProps = element.type.defaultProps;
      }

      for (propName in config) {
        if (hasOwnProperty$1.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
          if (config[propName] === undefined && defaultProps !== undefined) {
            // Resolve default props
            props[propName] = defaultProps[propName];
          } else {
            props[propName] = config[propName];
          }
        }
      }
    } // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.


    var childrenLength = arguments.length - 2;

    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);

      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }

      props.children = childArray;
    }

    return ReactElement(element.type, key, ref, self, source, owner, props);
  }
  /**
   * Verifies the object is a ReactElement.
   * See https://reactjs.org/docs/react-api.html#isvalidelement
   * @param {?object} object
   * @return {boolean} True if `object` is a ReactElement.
   * @final
   */


  function isValidElement(object) {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  }

  var SEPARATOR = '.';
  var SUBSEPARATOR = ':';
  /**
   * Escape and wrap key so it is safe to use as a reactid
   *
   * @param {string} key to be escaped.
   * @return {string} the escaped key.
   */

  function escape(key) {
    var escapeRegex = /[=:]/g;
    var escaperLookup = {
      '=': '=0',
      ':': '=2'
    };
    var escapedString = ('' + key).replace(escapeRegex, function (match) {
      return escaperLookup[match];
    });
    return '$' + escapedString;
  }
  /**
   * TODO: Test that a single child and an array with one item have the same key
   * pattern.
   */


  var didWarnAboutMaps = false;
  var userProvidedKeyEscapeRegex = /\/+/g;

  function escapeUserProvidedKey(text) {
    return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/');
  }

  var POOL_SIZE = 10;
  var traverseContextPool = [];

  function getPooledTraverseContext(mapResult, keyPrefix, mapFunction, mapContext) {
    if (traverseContextPool.length) {
      var traverseContext = traverseContextPool.pop();
      traverseContext.result = mapResult;
      traverseContext.keyPrefix = keyPrefix;
      traverseContext.func = mapFunction;
      traverseContext.context = mapContext;
      traverseContext.count = 0;
      return traverseContext;
    } else {
      return {
        result: mapResult,
        keyPrefix: keyPrefix,
        func: mapFunction,
        context: mapContext,
        count: 0
      };
    }
  }

  function releaseTraverseContext(traverseContext) {
    traverseContext.result = null;
    traverseContext.keyPrefix = null;
    traverseContext.func = null;
    traverseContext.context = null;
    traverseContext.count = 0;

    if (traverseContextPool.length < POOL_SIZE) {
      traverseContextPool.push(traverseContext);
    }
  }
  /**
   * @param {?*} children Children tree container.
   * @param {!string} nameSoFar Name of the key path so far.
   * @param {!function} callback Callback to invoke with each child found.
   * @param {?*} traverseContext Used to pass information throughout the traversal
   * process.
   * @return {!number} The number of children in this subtree.
   */


  function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
    var type = typeof children;

    if (type === 'undefined' || type === 'boolean') {
      // All of the above are perceived as null.
      children = null;
    }

    var invokeCallback = false;

    if (children === null) {
      invokeCallback = true;
    } else {
      switch (type) {
        case 'string':
        case 'number':
          invokeCallback = true;
          break;

        case 'object':
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
          }

      }
    }

    if (invokeCallback) {
      callback(traverseContext, children, // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows.
      nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
      return 1;
    }

    var child;
    var nextName;
    var subtreeCount = 0; // Count of children found in the current subtree.

    var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        nextName = nextNamePrefix + getComponentKey(child, i);
        subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
      }
    } else {
      var iteratorFn = getIteratorFn(children);

      if (typeof iteratorFn === 'function') {
        {
          // Warn about using Maps as children
          if (iteratorFn === children.entries) {
            if (!didWarnAboutMaps) {
              warn('Using Maps as children is deprecated and will be removed in ' + 'a future major release. Consider converting children to ' + 'an array of keyed ReactElements instead.');
            }

            didWarnAboutMaps = true;
          }
        }
        var iterator = iteratorFn.call(children);
        var step;
        var ii = 0;

        while (!(step = iterator.next()).done) {
          child = step.value;
          nextName = nextNamePrefix + getComponentKey(child, ii++);
          subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
        }
      } else if (type === 'object') {
        var addendum = '';
        {
          addendum = ' If you meant to render a collection of children, use an array ' + 'instead.' + ReactDebugCurrentFrame.getStackAddendum();
        }
        var childrenString = '' + children;
        {
          {
            throw Error("Objects are not valid as a React child (found: " + (childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString) + ")." + addendum);
          }
        }
      }
    }

    return subtreeCount;
  }
  /**
   * Traverses children that are typically specified as `props.children`, but
   * might also be specified through attributes:
   *
   * - `traverseAllChildren(this.props.children, ...)`
   * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
   *
   * The `traverseContext` is an optional argument that is passed through the
   * entire traversal. It can be used to store accumulations or anything else that
   * the callback might find relevant.
   *
   * @param {?*} children Children tree object.
   * @param {!function} callback To invoke upon traversing each child.
   * @param {?*} traverseContext Context for traversal.
   * @return {!number} The number of children in this subtree.
   */


  function traverseAllChildren(children, callback, traverseContext) {
    if (children == null) {
      return 0;
    }

    return traverseAllChildrenImpl(children, '', callback, traverseContext);
  }
  /**
   * Generate a key string that identifies a component within a set.
   *
   * @param {*} component A component that could contain a manual key.
   * @param {number} index Index that is used if a manual key is not provided.
   * @return {string}
   */


  function getComponentKey(component, index) {
    // Do some typechecking here since we call this blindly. We want to ensure
    // that we don't block potential future ES APIs.
    if (typeof component === 'object' && component !== null && component.key != null) {
      // Explicit key
      return escape(component.key);
    } // Implicit key determined by the index in the set


    return index.toString(36);
  }

  function forEachSingleChild(bookKeeping, child, name) {
    var func = bookKeeping.func,
        context = bookKeeping.context;
    func.call(context, child, bookKeeping.count++);
  }
  /**
   * Iterates through children that are typically specified as `props.children`.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
   *
   * The provided forEachFunc(child, index) will be called for each
   * leaf child.
   *
   * @param {?*} children Children tree container.
   * @param {function(*, int)} forEachFunc
   * @param {*} forEachContext Context for forEachContext.
   */


  function forEachChildren(children, forEachFunc, forEachContext) {
    if (children == null) {
      return children;
    }

    var traverseContext = getPooledTraverseContext(null, null, forEachFunc, forEachContext);
    traverseAllChildren(children, forEachSingleChild, traverseContext);
    releaseTraverseContext(traverseContext);
  }

  function mapSingleChildIntoContext(bookKeeping, child, childKey) {
    var result = bookKeeping.result,
        keyPrefix = bookKeeping.keyPrefix,
        func = bookKeeping.func,
        context = bookKeeping.context;
    var mappedChild = func.call(context, child, bookKeeping.count++);

    if (Array.isArray(mappedChild)) {
      mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, function (c) {
        return c;
      });
    } else if (mappedChild != null) {
      if (isValidElement(mappedChild)) {
        mappedChild = cloneAndReplaceKey(mappedChild, // Keep both the (mapped) and old keys if they differ, just as
        // traverseAllChildren used to do for objects as children
        keyPrefix + (mappedChild.key && (!child || child.key !== mappedChild.key) ? escapeUserProvidedKey(mappedChild.key) + '/' : '') + childKey);
      }

      result.push(mappedChild);
    }
  }

  function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
    var escapedPrefix = '';

    if (prefix != null) {
      escapedPrefix = escapeUserProvidedKey(prefix) + '/';
    }

    var traverseContext = getPooledTraverseContext(array, escapedPrefix, func, context);
    traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
    releaseTraverseContext(traverseContext);
  }
  /**
   * Maps children that are typically specified as `props.children`.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrenmap
   *
   * The provided mapFunction(child, key, index) will be called for each
   * leaf child.
   *
   * @param {?*} children Children tree container.
   * @param {function(*, int)} func The map function.
   * @param {*} context Context for mapFunction.
   * @return {object} Object containing the ordered map of results.
   */


  function mapChildren(children, func, context) {
    if (children == null) {
      return children;
    }

    var result = [];
    mapIntoWithKeyPrefixInternal(children, result, null, func, context);
    return result;
  }
  /**
   * Count the number of children that are typically specified as
   * `props.children`.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrencount
   *
   * @param {?*} children Children tree container.
   * @return {number} The number of children.
   */


  function countChildren(children) {
    return traverseAllChildren(children, function () {
      return null;
    }, null);
  }
  /**
   * Flatten a children object (typically specified as `props.children`) and
   * return an array with appropriately re-keyed children.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
   */


  function toArray(children) {
    var result = [];
    mapIntoWithKeyPrefixInternal(children, result, null, function (child) {
      return child;
    });
    return result;
  }
  /**
   * Returns the first child in a collection of children and verifies that there
   * is only one child in the collection.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrenonly
   *
   * The current implementation of this function assumes that a single child gets
   * passed without a wrapper, but the purpose of this helper function is to
   * abstract away the particular structure of children.
   *
   * @param {?object} children Child collection structure.
   * @return {ReactElement} The first and only `ReactElement` contained in the
   * structure.
   */


  function onlyChild(children) {
    if (!isValidElement(children)) {
      {
        throw Error("React.Children.only expected to receive a single React element child.");
      }
    }

    return children;
  }

  function createContext(defaultValue, calculateChangedBits) {
    if (calculateChangedBits === undefined) {
      calculateChangedBits = null;
    } else {
      {
        if (calculateChangedBits !== null && typeof calculateChangedBits !== 'function') {
          error('createContext: Expected the optional second argument to be a ' + 'function. Instead received: %s', calculateChangedBits);
        }
      }
    }

    var context = {
      $$typeof: REACT_CONTEXT_TYPE,
      _calculateChangedBits: calculateChangedBits,
      // As a workaround to support multiple concurrent renderers, we categorize
      // some renderers as primary and others as secondary. We only expect
      // there to be two concurrent renderers at most: React Native (primary) and
      // Fabric (secondary); React DOM (primary) and React ART (secondary).
      // Secondary renderers store their context values on separate fields.
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      // Used to track how many concurrent renderers this context currently
      // supports within in a single renderer. Such as parallel server rendering.
      _threadCount: 0,
      // These are circular
      Provider: null,
      Consumer: null
    };
    context.Provider = {
      $$typeof: REACT_PROVIDER_TYPE,
      _context: context
    };
    var hasWarnedAboutUsingNestedContextConsumers = false;
    var hasWarnedAboutUsingConsumerProvider = false;
    {
      // A separate object, but proxies back to the original context object for
      // backwards compatibility. It has a different $$typeof, so we can properly
      // warn for the incorrect usage of Context as a Consumer.
      var Consumer = {
        $$typeof: REACT_CONTEXT_TYPE,
        _context: context,
        _calculateChangedBits: context._calculateChangedBits
      }; // $FlowFixMe: Flow complains about not setting a value, which is intentional here

      Object.defineProperties(Consumer, {
        Provider: {
          get: function () {
            if (!hasWarnedAboutUsingConsumerProvider) {
              hasWarnedAboutUsingConsumerProvider = true;
              error('Rendering <Context.Consumer.Provider> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Provider> instead?');
            }

            return context.Provider;
          },
          set: function (_Provider) {
            context.Provider = _Provider;
          }
        },
        _currentValue: {
          get: function () {
            return context._currentValue;
          },
          set: function (_currentValue) {
            context._currentValue = _currentValue;
          }
        },
        _currentValue2: {
          get: function () {
            return context._currentValue2;
          },
          set: function (_currentValue2) {
            context._currentValue2 = _currentValue2;
          }
        },
        _threadCount: {
          get: function () {
            return context._threadCount;
          },
          set: function (_threadCount) {
            context._threadCount = _threadCount;
          }
        },
        Consumer: {
          get: function () {
            if (!hasWarnedAboutUsingNestedContextConsumers) {
              hasWarnedAboutUsingNestedContextConsumers = true;
              error('Rendering <Context.Consumer.Consumer> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
            }

            return context.Consumer;
          }
        }
      }); // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty

      context.Consumer = Consumer;
    }
    {
      context._currentRenderer = null;
      context._currentRenderer2 = null;
    }
    return context;
  }

  function lazy(ctor) {
    var lazyType = {
      $$typeof: REACT_LAZY_TYPE,
      _ctor: ctor,
      // React uses these fields to store the result.
      _status: -1,
      _result: null
    };
    {
      // In production, this would just set it on the object.
      var defaultProps;
      var propTypes;
      Object.defineProperties(lazyType, {
        defaultProps: {
          configurable: true,
          get: function () {
            return defaultProps;
          },
          set: function (newDefaultProps) {
            error('React.lazy(...): It is not supported to assign `defaultProps` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');
            defaultProps = newDefaultProps; // Match production behavior more closely:

            Object.defineProperty(lazyType, 'defaultProps', {
              enumerable: true
            });
          }
        },
        propTypes: {
          configurable: true,
          get: function () {
            return propTypes;
          },
          set: function (newPropTypes) {
            error('React.lazy(...): It is not supported to assign `propTypes` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');
            propTypes = newPropTypes; // Match production behavior more closely:

            Object.defineProperty(lazyType, 'propTypes', {
              enumerable: true
            });
          }
        }
      });
    }
    return lazyType;
  }

  function forwardRef(render) {
    {
      if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
        error('forwardRef requires a render function but received a `memo` ' + 'component. Instead of forwardRef(memo(...)), use ' + 'memo(forwardRef(...)).');
      } else if (typeof render !== 'function') {
        error('forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render);
      } else {
        if (render.length !== 0 && render.length !== 2) {
          error('forwardRef render functions accept exactly two parameters: props and ref. %s', render.length === 1 ? 'Did you forget to use the ref parameter?' : 'Any additional parameter will be undefined.');
        }
      }

      if (render != null) {
        if (render.defaultProps != null || render.propTypes != null) {
          error('forwardRef render functions do not support propTypes or defaultProps. ' + 'Did you accidentally pass a React component?');
        }
      }
    }
    return {
      $$typeof: REACT_FORWARD_REF_TYPE,
      render: render
    };
  }

  function isValidElementType(type) {
    return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
    type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
  }

  function memo(type, compare) {
    {
      if (!isValidElementType(type)) {
        error('memo: The first argument must be a component. Instead ' + 'received: %s', type === null ? 'null' : typeof type);
      }
    }
    return {
      $$typeof: REACT_MEMO_TYPE,
      type: type,
      compare: compare === undefined ? null : compare
    };
  }

  function resolveDispatcher() {
    var dispatcher = ReactCurrentDispatcher.current;

    if (!(dispatcher !== null)) {
      {
        throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.");
      }
    }

    return dispatcher;
  }

  function useContext(Context, unstable_observedBits) {
    var dispatcher = resolveDispatcher();
    {
      if (unstable_observedBits !== undefined) {
        error('useContext() second argument is reserved for future ' + 'use in React. Passing it is not supported. ' + 'You passed: %s.%s', unstable_observedBits, typeof unstable_observedBits === 'number' && Array.isArray(arguments[2]) ? '\n\nDid you call array.map(useContext)? ' + 'Calling Hooks inside a loop is not supported. ' + 'Learn more at https://fb.me/rules-of-hooks' : '');
      } // TODO: add a more generic warning for invalid values.


      if (Context._context !== undefined) {
        var realContext = Context._context; // Don't deduplicate because this legitimately causes bugs
        // and nobody should be using this in existing code.

        if (realContext.Consumer === Context) {
          error('Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be ' + 'removed in a future major release. Did you mean to call useContext(Context) instead?');
        } else if (realContext.Provider === Context) {
          error('Calling useContext(Context.Provider) is not supported. ' + 'Did you mean to call useContext(Context) instead?');
        }
      }
    }
    return dispatcher.useContext(Context, unstable_observedBits);
  }

  function useState(initialState) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
  }

  function useReducer(reducer, initialArg, init) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useReducer(reducer, initialArg, init);
  }

  function useRef(initialValue) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useRef(initialValue);
  }

  function useEffect(create, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useEffect(create, deps);
  }

  function useLayoutEffect(create, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useLayoutEffect(create, deps);
  }

  function useCallback(callback, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useCallback(callback, deps);
  }

  function useMemo(create, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useMemo(create, deps);
  }

  function useImperativeHandle(ref, create, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useImperativeHandle(ref, create, deps);
  }

  function useDebugValue(value, formatterFn) {
    {
      var dispatcher = resolveDispatcher();
      return dispatcher.useDebugValue(value, formatterFn);
    }
  }
  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */


  var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
  var ReactPropTypesSecret_1 = ReactPropTypesSecret;

  var printWarning$1 = function () {};

  {
    var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;
    var loggedTypeFailures = {};
    var has = Function.call.bind(Object.prototype.hasOwnProperty);

    printWarning$1 = function (text) {
      var message = 'Warning: ' + text;

      if (typeof console !== 'undefined') {
        console.error(message);
      }

      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };
  }
  /**
   * Assert that the values match with the type specs.
   * Error messages are memorized and will only be shown once.
   *
   * @param {object} typeSpecs Map of name to a ReactPropType
   * @param {object} values Runtime values that need to be type-checked
   * @param {string} location e.g. "prop", "context", "child context"
   * @param {string} componentName Name of the component for error messages.
   * @param {?Function} getStack Returns the component stack.
   * @private
   */

  function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
    {
      for (var typeSpecName in typeSpecs) {
        if (has(typeSpecs, typeSpecName)) {
          var error; // Prop type validation may throw. In case they do, we don't want to
          // fail the render phase where it didn't fail before. So we log it.
          // After these have been cleaned up, we'll let them throw.

          try {
            // This is intentionally an invariant that gets caught. It's the same
            // behavior as without this statement except with a better message.
            if (typeof typeSpecs[typeSpecName] !== 'function') {
              var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.');
              err.name = 'Invariant Violation';
              throw err;
            }

            error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
          } catch (ex) {
            error = ex;
          }

          if (error && !(error instanceof Error)) {
            printWarning$1((componentName || 'React class') + ': type specification of ' + location + ' `' + typeSpecName + '` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a ' + typeof error + '. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).');
          }

          if (error instanceof Error && !(error.message in loggedTypeFailures)) {
            // Only monitor this failure once because there tends to be a lot of the
            // same error.
            loggedTypeFailures[error.message] = true;
            var stack = getStack ? getStack() : '';
            printWarning$1('Failed ' + location + ' type: ' + error.message + (stack != null ? stack : ''));
          }
        }
      }
    }
  }
  /**
   * Resets warning cache when testing.
   *
   * @private
   */


  checkPropTypes.resetWarningCache = function () {
    {
      loggedTypeFailures = {};
    }
  };

  var checkPropTypes_1 = checkPropTypes;
  var propTypesMisspellWarningShown;
  {
    propTypesMisspellWarningShown = false;
  }

  function getDeclarationErrorAddendum() {
    if (ReactCurrentOwner.current) {
      var name = getComponentName(ReactCurrentOwner.current.type);

      if (name) {
        return '\n\nCheck the render method of `' + name + '`.';
      }
    }

    return '';
  }

  function getSourceInfoErrorAddendum(source) {
    if (source !== undefined) {
      var fileName = source.fileName.replace(/^.*[\\\/]/, '');
      var lineNumber = source.lineNumber;
      return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
    }

    return '';
  }

  function getSourceInfoErrorAddendumForProps(elementProps) {
    if (elementProps !== null && elementProps !== undefined) {
      return getSourceInfoErrorAddendum(elementProps.__source);
    }

    return '';
  }
  /**
   * Warn if there's no key explicitly set on dynamic arrays of children or
   * object keys are not valid. This allows us to keep track of children between
   * updates.
   */


  var ownerHasKeyUseWarning = {};

  function getCurrentComponentErrorInfo(parentType) {
    var info = getDeclarationErrorAddendum();

    if (!info) {
      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

      if (parentName) {
        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
      }
    }

    return info;
  }
  /**
   * Warn if the element doesn't have an explicit key assigned to it.
   * This element is in an array. The array could grow and shrink or be
   * reordered. All children that haven't already been validated are required to
   * have a "key" property assigned to it. Error statuses are cached so a warning
   * will only be shown once.
   *
   * @internal
   * @param {ReactElement} element Element that requires a key.
   * @param {*} parentType element's parent's type.
   */


  function validateExplicitKey(element, parentType) {
    if (!element._store || element._store.validated || element.key != null) {
      return;
    }

    element._store.validated = true;
    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
      return;
    }

    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
    // property, it may be the creator of the child that's responsible for
    // assigning it a key.

    var childOwner = '';

    if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
      // Give the component that originally created this child.
      childOwner = " It was passed a child from " + getComponentName(element._owner.type) + ".";
    }

    setCurrentlyValidatingElement(element);
    {
      error('Each child in a list should have a unique "key" prop.' + '%s%s See https://fb.me/react-warning-keys for more information.', currentComponentErrorInfo, childOwner);
    }
    setCurrentlyValidatingElement(null);
  }
  /**
   * Ensure that every element either is passed in a static location, in an
   * array with an explicit keys property defined, or in an object literal
   * with valid key property.
   *
   * @internal
   * @param {ReactNode} node Statically passed child of any type.
   * @param {*} parentType node's parent's type.
   */


  function validateChildKeys(node, parentType) {
    if (typeof node !== 'object') {
      return;
    }

    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        var child = node[i];

        if (isValidElement(child)) {
          validateExplicitKey(child, parentType);
        }
      }
    } else if (isValidElement(node)) {
      // This element was passed in a valid location.
      if (node._store) {
        node._store.validated = true;
      }
    } else if (node) {
      var iteratorFn = getIteratorFn(node);

      if (typeof iteratorFn === 'function') {
        // Entry iterators used to provide implicit keys,
        // but now we print a separate warning for them later.
        if (iteratorFn !== node.entries) {
          var iterator = iteratorFn.call(node);
          var step;

          while (!(step = iterator.next()).done) {
            if (isValidElement(step.value)) {
              validateExplicitKey(step.value, parentType);
            }
          }
        }
      }
    }
  }
  /**
   * Given an element, validate that its props follow the propTypes definition,
   * provided by the type.
   *
   * @param {ReactElement} element
   */


  function validatePropTypes(element) {
    {
      var type = element.type;

      if (type === null || type === undefined || typeof type === 'string') {
        return;
      }

      var name = getComponentName(type);
      var propTypes;

      if (typeof type === 'function') {
        propTypes = type.propTypes;
      } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
      // Inner props are checked in the reconciler.
      type.$$typeof === REACT_MEMO_TYPE)) {
        propTypes = type.propTypes;
      } else {
        return;
      }

      if (propTypes) {
        setCurrentlyValidatingElement(element);
        checkPropTypes_1(propTypes, element.props, 'prop', name, ReactDebugCurrentFrame.getStackAddendum);
        setCurrentlyValidatingElement(null);
      } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
        propTypesMisspellWarningShown = true;
        error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', name || 'Unknown');
      }

      if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
        error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
      }
    }
  }
  /**
   * Given a fragment, validate that it can only be provided with fragment props
   * @param {ReactElement} fragment
   */


  function validateFragmentProps(fragment) {
    {
      setCurrentlyValidatingElement(fragment);
      var keys = Object.keys(fragment.props);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (key !== 'children' && key !== 'key') {
          error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);
          break;
        }
      }

      if (fragment.ref !== null) {
        error('Invalid attribute `ref` supplied to `React.Fragment`.');
      }

      setCurrentlyValidatingElement(null);
    }
  }

  function createElementWithValidation(type, props, children) {
    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
    // succeed and there will likely be errors in render.

    if (!validType) {
      var info = '';

      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
      }

      var sourceInfo = getSourceInfoErrorAddendumForProps(props);

      if (sourceInfo) {
        info += sourceInfo;
      } else {
        info += getDeclarationErrorAddendum();
      }

      var typeString;

      if (type === null) {
        typeString = 'null';
      } else if (Array.isArray(type)) {
        typeString = 'array';
      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
        typeString = "<" + (getComponentName(type.type) || 'Unknown') + " />";
        info = ' Did you accidentally export a JSX literal instead of a component?';
      } else {
        typeString = typeof type;
      }

      {
        error('React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
      }
    }

    var element = createElement.apply(this, arguments); // The result can be nullish if a mock or a custom function is used.
    // TODO: Drop this when these are no longer allowed as the type argument.

    if (element == null) {
      return element;
    } // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing errors.
    // We don't want exception behavior to differ between dev and prod.
    // (Rendering will throw with a helpful message and as soon as the type is
    // fixed, the key warnings will appear.)


    if (validType) {
      for (var i = 2; i < arguments.length; i++) {
        validateChildKeys(arguments[i], type);
      }
    }

    if (type === REACT_FRAGMENT_TYPE) {
      validateFragmentProps(element);
    } else {
      validatePropTypes(element);
    }

    return element;
  }

  var didWarnAboutDeprecatedCreateFactory = false;

  function createFactoryWithValidation(type) {
    var validatedFactory = createElementWithValidation.bind(null, type);
    validatedFactory.type = type;
    {
      if (!didWarnAboutDeprecatedCreateFactory) {
        didWarnAboutDeprecatedCreateFactory = true;
        warn('React.createFactory() is deprecated and will be removed in ' + 'a future major release. Consider using JSX ' + 'or use React.createElement() directly instead.');
      } // Legacy hook: remove it


      Object.defineProperty(validatedFactory, 'type', {
        enumerable: false,
        get: function () {
          warn('Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.');
          Object.defineProperty(this, 'type', {
            value: type
          });
          return type;
        }
      });
    }
    return validatedFactory;
  }

  function cloneElementWithValidation(element, props, children) {
    var newElement = cloneElement.apply(this, arguments);

    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i], newElement.type);
    }

    validatePropTypes(newElement);
    return newElement;
  }

  var enableSchedulerDebugging = false;
  var enableProfiling = true;
  var requestHostCallback;
  var requestHostTimeout;
  var cancelHostTimeout;
  var shouldYieldToHost;
  var requestPaint;
  var getCurrentTime;
  var forceFrameRate;

  if ( // If Scheduler runs in a non-DOM environment, it falls back to a naive
  // implementation using setTimeout.
  typeof window === 'undefined' || // Check if MessageChannel is supported, too.
  typeof MessageChannel !== 'function') {
    // If this accidentally gets imported in a non-browser environment, e.g. JavaScriptCore,
    // fallback to a naive implementation.
    var _callback = null;
    var _timeoutID = null;

    var _flushCallback = function () {
      if (_callback !== null) {
        try {
          var currentTime = getCurrentTime();
          var hasRemainingTime = true;

          _callback(hasRemainingTime, currentTime);

          _callback = null;
        } catch (e) {
          setTimeout(_flushCallback, 0);
          throw e;
        }
      }
    };

    var initialTime = Date.now();

    getCurrentTime = function () {
      return Date.now() - initialTime;
    };

    requestHostCallback = function (cb) {
      if (_callback !== null) {
        // Protect against re-entrancy.
        setTimeout(requestHostCallback, 0, cb);
      } else {
        _callback = cb;
        setTimeout(_flushCallback, 0);
      }
    };

    requestHostTimeout = function (cb, ms) {
      _timeoutID = setTimeout(cb, ms);
    };

    cancelHostTimeout = function () {
      clearTimeout(_timeoutID);
    };

    shouldYieldToHost = function () {
      return false;
    };

    requestPaint = forceFrameRate = function () {};
  } else {
    // Capture local references to native APIs, in case a polyfill overrides them.
    var performance = window.performance;
    var _Date = window.Date;
    var _setTimeout = window.setTimeout;
    var _clearTimeout = window.clearTimeout;

    if (typeof console !== 'undefined') {
      // TODO: Scheduler no longer requires these methods to be polyfilled. But
      // maybe we want to continue warning if they don't exist, to preserve the
      // option to rely on it in the future?
      var requestAnimationFrame = window.requestAnimationFrame;
      var cancelAnimationFrame = window.cancelAnimationFrame; // TODO: Remove fb.me link

      if (typeof requestAnimationFrame !== 'function') {
        // Using console['error'] to evade Babel and ESLint
        console['error']("This browser doesn't support requestAnimationFrame. " + 'Make sure that you load a ' + 'polyfill in older browsers. https://fb.me/react-polyfills');
      }

      if (typeof cancelAnimationFrame !== 'function') {
        // Using console['error'] to evade Babel and ESLint
        console['error']("This browser doesn't support cancelAnimationFrame. " + 'Make sure that you load a ' + 'polyfill in older browsers. https://fb.me/react-polyfills');
      }
    }

    if (typeof performance === 'object' && typeof performance.now === 'function') {
      getCurrentTime = function () {
        return performance.now();
      };
    } else {
      var _initialTime = _Date.now();

      getCurrentTime = function () {
        return _Date.now() - _initialTime;
      };
    }

    var isMessageLoopRunning = false;
    var scheduledHostCallback = null;
    var taskTimeoutID = -1; // Scheduler periodically yields in case there is other work on the main
    // thread, like user events. By default, it yields multiple times per frame.
    // It does not attempt to align with frame boundaries, since most tasks don't
    // need to be frame aligned; for those that do, use requestAnimationFrame.

    var yieldInterval = 5;
    var deadline = 0; // TODO: Make this configurable

    {
      // `isInputPending` is not available. Since we have no way of knowing if
      // there's pending input, always yield at the end of the frame.
      shouldYieldToHost = function () {
        return getCurrentTime() >= deadline;
      }; // Since we yield every frame regardless, `requestPaint` has no effect.


      requestPaint = function () {};
    }

    forceFrameRate = function (fps) {
      if (fps < 0 || fps > 125) {
        // Using console['error'] to evade Babel and ESLint
        console['error']('forceFrameRate takes a positive int between 0 and 125, ' + 'forcing framerates higher than 125 fps is not unsupported');
        return;
      }

      if (fps > 0) {
        yieldInterval = Math.floor(1000 / fps);
      } else {
        // reset the framerate
        yieldInterval = 5;
      }
    };

    var performWorkUntilDeadline = function () {
      if (scheduledHostCallback !== null) {
        var currentTime = getCurrentTime(); // Yield after `yieldInterval` ms, regardless of where we are in the vsync
        // cycle. This means there's always time remaining at the beginning of
        // the message event.

        deadline = currentTime + yieldInterval;
        var hasTimeRemaining = true;

        try {
          var hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);

          if (!hasMoreWork) {
            isMessageLoopRunning = false;
            scheduledHostCallback = null;
          } else {
            // If there's more work, schedule the next message event at the end
            // of the preceding one.
            port.postMessage(null);
          }
        } catch (error) {
          // If a scheduler task throws, exit the current browser task so the
          // error can be observed.
          port.postMessage(null);
          throw error;
        }
      } else {
        isMessageLoopRunning = false;
      } // Yielding to the browser will give it a chance to paint, so we can

    };

    var channel = new MessageChannel();
    var port = channel.port2;
    channel.port1.onmessage = performWorkUntilDeadline;

    requestHostCallback = function (callback) {
      scheduledHostCallback = callback;

      if (!isMessageLoopRunning) {
        isMessageLoopRunning = true;
        port.postMessage(null);
      }
    };

    requestHostTimeout = function (callback, ms) {
      taskTimeoutID = _setTimeout(function () {
        callback(getCurrentTime());
      }, ms);
    };

    cancelHostTimeout = function () {
      _clearTimeout(taskTimeoutID);

      taskTimeoutID = -1;
    };
  }

  function push(heap, node) {
    var index = heap.length;
    heap.push(node);
    siftUp(heap, node, index);
  }

  function peek(heap) {
    var first = heap[0];
    return first === undefined ? null : first;
  }

  function pop(heap) {
    var first = heap[0];

    if (first !== undefined) {
      var last = heap.pop();

      if (last !== first) {
        heap[0] = last;
        siftDown(heap, last, 0);
      }

      return first;
    } else {
      return null;
    }
  }

  function siftUp(heap, node, i) {
    var index = i;

    while (true) {
      var parentIndex = index - 1 >>> 1;
      var parent = heap[parentIndex];

      if (parent !== undefined && compare(parent, node) > 0) {
        // The parent is larger. Swap positions.
        heap[parentIndex] = node;
        heap[index] = parent;
        index = parentIndex;
      } else {
        // The parent is smaller. Exit.
        return;
      }
    }
  }

  function siftDown(heap, node, i) {
    var index = i;
    var length = heap.length;

    while (index < length) {
      var leftIndex = (index + 1) * 2 - 1;
      var left = heap[leftIndex];
      var rightIndex = leftIndex + 1;
      var right = heap[rightIndex]; // If the left or right node is smaller, swap with the smaller of those.

      if (left !== undefined && compare(left, node) < 0) {
        if (right !== undefined && compare(right, left) < 0) {
          heap[index] = right;
          heap[rightIndex] = node;
          index = rightIndex;
        } else {
          heap[index] = left;
          heap[leftIndex] = node;
          index = leftIndex;
        }
      } else if (right !== undefined && compare(right, node) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // Neither child is smaller. Exit.
        return;
      }
    }
  }

  function compare(a, b) {
    // Compare sort index first, then task id.
    var diff = a.sortIndex - b.sortIndex;
    return diff !== 0 ? diff : a.id - b.id;
  } // TODO: Use symbols?


  var NoPriority = 0;
  var ImmediatePriority = 1;
  var UserBlockingPriority = 2;
  var NormalPriority = 3;
  var LowPriority = 4;
  var IdlePriority = 5;
  var runIdCounter = 0;
  var mainThreadIdCounter = 0;
  var profilingStateSize = 4;
  var sharedProfilingBuffer = // $FlowFixMe Flow doesn't know about SharedArrayBuffer
  typeof SharedArrayBuffer === 'function' ? new SharedArrayBuffer(profilingStateSize * Int32Array.BYTES_PER_ELEMENT) : // $FlowFixMe Flow doesn't know about ArrayBuffer
  typeof ArrayBuffer === 'function' ? new ArrayBuffer(profilingStateSize * Int32Array.BYTES_PER_ELEMENT) : null // Don't crash the init path on IE9
  ;
  var profilingState = sharedProfilingBuffer !== null ? new Int32Array(sharedProfilingBuffer) : []; // We can't read this but it helps save bytes for null checks

  var PRIORITY = 0;
  var CURRENT_TASK_ID = 1;
  var CURRENT_RUN_ID = 2;
  var QUEUE_SIZE = 3;
  {
    profilingState[PRIORITY] = NoPriority; // This is maintained with a counter, because the size of the priority queue
    // array might include canceled tasks.

    profilingState[QUEUE_SIZE] = 0;
    profilingState[CURRENT_TASK_ID] = 0;
  } // Bytes per element is 4

  var INITIAL_EVENT_LOG_SIZE = 131072;
  var MAX_EVENT_LOG_SIZE = 524288; // Equivalent to 2 megabytes

  var eventLogSize = 0;
  var eventLogBuffer = null;
  var eventLog = null;
  var eventLogIndex = 0;
  var TaskStartEvent = 1;
  var TaskCompleteEvent = 2;
  var TaskErrorEvent = 3;
  var TaskCancelEvent = 4;
  var TaskRunEvent = 5;
  var TaskYieldEvent = 6;
  var SchedulerSuspendEvent = 7;
  var SchedulerResumeEvent = 8;

  function logEvent(entries) {
    if (eventLog !== null) {
      var offset = eventLogIndex;
      eventLogIndex += entries.length;

      if (eventLogIndex + 1 > eventLogSize) {
        eventLogSize *= 2;

        if (eventLogSize > MAX_EVENT_LOG_SIZE) {
          // Using console['error'] to evade Babel and ESLint
          console['error']("Scheduler Profiling: Event log exceeded maximum size. Don't " + 'forget to call `stopLoggingProfilingEvents()`.');
          stopLoggingProfilingEvents();
          return;
        }

        var newEventLog = new Int32Array(eventLogSize * 4);
        newEventLog.set(eventLog);
        eventLogBuffer = newEventLog.buffer;
        eventLog = newEventLog;
      }

      eventLog.set(entries, offset);
    }
  }

  function startLoggingProfilingEvents() {
    eventLogSize = INITIAL_EVENT_LOG_SIZE;
    eventLogBuffer = new ArrayBuffer(eventLogSize * 4);
    eventLog = new Int32Array(eventLogBuffer);
    eventLogIndex = 0;
  }

  function stopLoggingProfilingEvents() {
    var buffer = eventLogBuffer;
    eventLogSize = 0;
    eventLogBuffer = null;
    eventLog = null;
    eventLogIndex = 0;
    return buffer;
  }

  function markTaskStart(task, ms) {
    {
      profilingState[QUEUE_SIZE]++;

      if (eventLog !== null) {
        // performance.now returns a float, representing milliseconds. When the
        // event is logged, it's coerced to an int. Convert to microseconds to
        // maintain extra degrees of precision.
        logEvent([TaskStartEvent, ms * 1000, task.id, task.priorityLevel]);
      }
    }
  }

  function markTaskCompleted(task, ms) {
    {
      profilingState[PRIORITY] = NoPriority;
      profilingState[CURRENT_TASK_ID] = 0;
      profilingState[QUEUE_SIZE]--;

      if (eventLog !== null) {
        logEvent([TaskCompleteEvent, ms * 1000, task.id]);
      }
    }
  }

  function markTaskCanceled(task, ms) {
    {
      profilingState[QUEUE_SIZE]--;

      if (eventLog !== null) {
        logEvent([TaskCancelEvent, ms * 1000, task.id]);
      }
    }
  }

  function markTaskErrored(task, ms) {
    {
      profilingState[PRIORITY] = NoPriority;
      profilingState[CURRENT_TASK_ID] = 0;
      profilingState[QUEUE_SIZE]--;

      if (eventLog !== null) {
        logEvent([TaskErrorEvent, ms * 1000, task.id]);
      }
    }
  }

  function markTaskRun(task, ms) {
    {
      runIdCounter++;
      profilingState[PRIORITY] = task.priorityLevel;
      profilingState[CURRENT_TASK_ID] = task.id;
      profilingState[CURRENT_RUN_ID] = runIdCounter;

      if (eventLog !== null) {
        logEvent([TaskRunEvent, ms * 1000, task.id, runIdCounter]);
      }
    }
  }

  function markTaskYield(task, ms) {
    {
      profilingState[PRIORITY] = NoPriority;
      profilingState[CURRENT_TASK_ID] = 0;
      profilingState[CURRENT_RUN_ID] = 0;

      if (eventLog !== null) {
        logEvent([TaskYieldEvent, ms * 1000, task.id, runIdCounter]);
      }
    }
  }

  function markSchedulerSuspended(ms) {
    {
      mainThreadIdCounter++;

      if (eventLog !== null) {
        logEvent([SchedulerSuspendEvent, ms * 1000, mainThreadIdCounter]);
      }
    }
  }

  function markSchedulerUnsuspended(ms) {
    {
      if (eventLog !== null) {
        logEvent([SchedulerResumeEvent, ms * 1000, mainThreadIdCounter]);
      }
    }
  }
  /* eslint-disable no-var */
  // Math.pow(2, 30) - 1
  // 0b111111111111111111111111111111


  var maxSigned31BitInt = 1073741823; // Times out immediately

  var IMMEDIATE_PRIORITY_TIMEOUT = -1; // Eventually times out

  var USER_BLOCKING_PRIORITY = 250;
  var NORMAL_PRIORITY_TIMEOUT = 5000;
  var LOW_PRIORITY_TIMEOUT = 10000; // Never times out

  var IDLE_PRIORITY = maxSigned31BitInt; // Tasks are stored on a min heap

  var taskQueue = [];
  var timerQueue = []; // Incrementing id counter. Used to maintain insertion order.

  var taskIdCounter = 1; // Pausing the scheduler is useful for debugging.

  var currentTask = null;
  var currentPriorityLevel = NormalPriority; // This is set while performing work, to prevent re-entrancy.

  var isPerformingWork = false;
  var isHostCallbackScheduled = false;
  var isHostTimeoutScheduled = false;

  function advanceTimers(currentTime) {
    // Check for tasks that are no longer delayed and add them to the queue.
    var timer = peek(timerQueue);

    while (timer !== null) {
      if (timer.callback === null) {
        // Timer was cancelled.
        pop(timerQueue);
      } else if (timer.startTime <= currentTime) {
        // Timer fired. Transfer to the task queue.
        pop(timerQueue);
        timer.sortIndex = timer.expirationTime;
        push(taskQueue, timer);
        {
          markTaskStart(timer, currentTime);
          timer.isQueued = true;
        }
      } else {
        // Remaining timers are pending.
        return;
      }

      timer = peek(timerQueue);
    }
  }

  function handleTimeout(currentTime) {
    isHostTimeoutScheduled = false;
    advanceTimers(currentTime);

    if (!isHostCallbackScheduled) {
      if (peek(taskQueue) !== null) {
        isHostCallbackScheduled = true;
        requestHostCallback(flushWork);
      } else {
        var firstTimer = peek(timerQueue);

        if (firstTimer !== null) {
          requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
      }
    }
  }

  function flushWork(hasTimeRemaining, initialTime) {
    {
      markSchedulerUnsuspended(initialTime);
    } // We'll need a host callback the next time work is scheduled.

    isHostCallbackScheduled = false;

    if (isHostTimeoutScheduled) {
      // We scheduled a timeout but it's no longer needed. Cancel it.
      isHostTimeoutScheduled = false;
      cancelHostTimeout();
    }

    isPerformingWork = true;
    var previousPriorityLevel = currentPriorityLevel;

    try {
      if (enableProfiling) {
        try {
          return workLoop(hasTimeRemaining, initialTime);
        } catch (error) {
          if (currentTask !== null) {
            var currentTime = getCurrentTime();
            markTaskErrored(currentTask, currentTime);
            currentTask.isQueued = false;
          }

          throw error;
        }
      } else {
        // No catch in prod codepath.
        return workLoop(hasTimeRemaining, initialTime);
      }
    } finally {
      currentTask = null;
      currentPriorityLevel = previousPriorityLevel;
      isPerformingWork = false;
      {
        var _currentTime = getCurrentTime();

        markSchedulerSuspended(_currentTime);
      }
    }
  }

  function workLoop(hasTimeRemaining, initialTime) {
    var currentTime = initialTime;
    advanceTimers(currentTime);
    currentTask = peek(taskQueue);

    while (currentTask !== null && !enableSchedulerDebugging) {
      if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
        // This currentTask hasn't expired, and we've reached the deadline.
        break;
      }

      var callback = currentTask.callback;

      if (callback !== null) {
        currentTask.callback = null;
        currentPriorityLevel = currentTask.priorityLevel;
        var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
        markTaskRun(currentTask, currentTime);
        var continuationCallback = callback(didUserCallbackTimeout);
        currentTime = getCurrentTime();

        if (typeof continuationCallback === 'function') {
          currentTask.callback = continuationCallback;
          markTaskYield(currentTask, currentTime);
        } else {
          {
            markTaskCompleted(currentTask, currentTime);
            currentTask.isQueued = false;
          }

          if (currentTask === peek(taskQueue)) {
            pop(taskQueue);
          }
        }

        advanceTimers(currentTime);
      } else {
        pop(taskQueue);
      }

      currentTask = peek(taskQueue);
    } // Return whether there's additional work


    if (currentTask !== null) {
      return true;
    } else {
      var firstTimer = peek(timerQueue);

      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }

      return false;
    }
  }

  function unstable_runWithPriority(priorityLevel, eventHandler) {
    switch (priorityLevel) {
      case ImmediatePriority:
      case UserBlockingPriority:
      case NormalPriority:
      case LowPriority:
      case IdlePriority:
        break;

      default:
        priorityLevel = NormalPriority;
    }

    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;

    try {
      return eventHandler();
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  }

  function unstable_next(eventHandler) {
    var priorityLevel;

    switch (currentPriorityLevel) {
      case ImmediatePriority:
      case UserBlockingPriority:
      case NormalPriority:
        // Shift down to normal priority
        priorityLevel = NormalPriority;
        break;

      default:
        // Anything lower than normal priority should remain at the current level.
        priorityLevel = currentPriorityLevel;
        break;
    }

    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;

    try {
      return eventHandler();
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  }

  function unstable_wrapCallback(callback) {
    var parentPriorityLevel = currentPriorityLevel;
    return function () {
      // This is a fork of runWithPriority, inlined for performance.
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = parentPriorityLevel;

      try {
        return callback.apply(this, arguments);
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
  }

  function timeoutForPriorityLevel(priorityLevel) {
    switch (priorityLevel) {
      case ImmediatePriority:
        return IMMEDIATE_PRIORITY_TIMEOUT;

      case UserBlockingPriority:
        return USER_BLOCKING_PRIORITY;

      case IdlePriority:
        return IDLE_PRIORITY;

      case LowPriority:
        return LOW_PRIORITY_TIMEOUT;

      case NormalPriority:
      default:
        return NORMAL_PRIORITY_TIMEOUT;
    }
  }

  function unstable_scheduleCallback(priorityLevel, callback, options) {
    var currentTime = getCurrentTime();
    var startTime;
    var timeout;

    if (typeof options === 'object' && options !== null) {
      var delay = options.delay;

      if (typeof delay === 'number' && delay > 0) {
        startTime = currentTime + delay;
      } else {
        startTime = currentTime;
      }

      timeout = typeof options.timeout === 'number' ? options.timeout : timeoutForPriorityLevel(priorityLevel);
    } else {
      timeout = timeoutForPriorityLevel(priorityLevel);
      startTime = currentTime;
    }

    var expirationTime = startTime + timeout;
    var newTask = {
      id: taskIdCounter++,
      callback: callback,
      priorityLevel: priorityLevel,
      startTime: startTime,
      expirationTime: expirationTime,
      sortIndex: -1
    };
    {
      newTask.isQueued = false;
    }

    if (startTime > currentTime) {
      // This is a delayed task.
      newTask.sortIndex = startTime;
      push(timerQueue, newTask);

      if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
        // All tasks are delayed, and this is the task with the earliest delay.
        if (isHostTimeoutScheduled) {
          // Cancel an existing timeout.
          cancelHostTimeout();
        } else {
          isHostTimeoutScheduled = true;
        } // Schedule a timeout.


        requestHostTimeout(handleTimeout, startTime - currentTime);
      }
    } else {
      newTask.sortIndex = expirationTime;
      push(taskQueue, newTask);
      {
        markTaskStart(newTask, currentTime);
        newTask.isQueued = true;
      } // Schedule a host callback, if needed. If we're already performing work,
      // wait until the next time we yield.

      if (!isHostCallbackScheduled && !isPerformingWork) {
        isHostCallbackScheduled = true;
        requestHostCallback(flushWork);
      }
    }

    return newTask;
  }

  function unstable_pauseExecution() {}

  function unstable_continueExecution() {
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }

  function unstable_getFirstCallbackNode() {
    return peek(taskQueue);
  }

  function unstable_cancelCallback(task) {
    {
      if (task.isQueued) {
        var currentTime = getCurrentTime();
        markTaskCanceled(task, currentTime);
        task.isQueued = false;
      }
    } // Null out the callback to indicate the task has been canceled. (Can't
    // remove from the queue because you can't remove arbitrary nodes from an
    // array based heap, only the first one.)

    task.callback = null;
  }

  function unstable_getCurrentPriorityLevel() {
    return currentPriorityLevel;
  }

  function unstable_shouldYield() {
    var currentTime = getCurrentTime();
    advanceTimers(currentTime);
    var firstTask = peek(taskQueue);
    return firstTask !== currentTask && currentTask !== null && firstTask !== null && firstTask.callback !== null && firstTask.startTime <= currentTime && firstTask.expirationTime < currentTask.expirationTime || shouldYieldToHost();
  }

  var unstable_requestPaint = requestPaint;
  var unstable_Profiling = {
    startLoggingProfilingEvents: startLoggingProfilingEvents,
    stopLoggingProfilingEvents: stopLoggingProfilingEvents,
    sharedProfilingBuffer: sharedProfilingBuffer
  };
  var Scheduler = /*#__PURE__*/Object.freeze({
    __proto__: null,
    unstable_ImmediatePriority: ImmediatePriority,
    unstable_UserBlockingPriority: UserBlockingPriority,
    unstable_NormalPriority: NormalPriority,
    unstable_IdlePriority: IdlePriority,
    unstable_LowPriority: LowPriority,
    unstable_runWithPriority: unstable_runWithPriority,
    unstable_next: unstable_next,
    unstable_scheduleCallback: unstable_scheduleCallback,
    unstable_cancelCallback: unstable_cancelCallback,
    unstable_wrapCallback: unstable_wrapCallback,
    unstable_getCurrentPriorityLevel: unstable_getCurrentPriorityLevel,
    unstable_shouldYield: unstable_shouldYield,
    unstable_requestPaint: unstable_requestPaint,
    unstable_continueExecution: unstable_continueExecution,
    unstable_pauseExecution: unstable_pauseExecution,
    unstable_getFirstCallbackNode: unstable_getFirstCallbackNode,

    get unstable_now() {
      return getCurrentTime;
    },

    get unstable_forceFrameRate() {
      return forceFrameRate;
    },

    unstable_Profiling: unstable_Profiling
  });
  var DEFAULT_THREAD_ID = 0; // Counters used to generate unique IDs.

  var interactionIDCounter = 0;
  var threadIDCounter = 0; // Set of currently traced interactions.
  // Interactions "stack"–
  // Meaning that newly traced interactions are appended to the previously active set.
  // When an interaction goes out of scope, the previous set (if any) is restored.

  var interactionsRef = null; // Listener(s) to notify when interactions begin and end.

  var subscriberRef = null;
  {
    interactionsRef = {
      current: new Set()
    };
    subscriberRef = {
      current: null
    };
  }

  function unstable_clear(callback) {
    var prevInteractions = interactionsRef.current;
    interactionsRef.current = new Set();

    try {
      return callback();
    } finally {
      interactionsRef.current = prevInteractions;
    }
  }

  function unstable_getCurrent() {
    {
      return interactionsRef.current;
    }
  }

  function unstable_getThreadID() {
    return ++threadIDCounter;
  }

  function unstable_trace(name, timestamp, callback) {
    var threadID = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : DEFAULT_THREAD_ID;
    var interaction = {
      __count: 1,
      id: interactionIDCounter++,
      name: name,
      timestamp: timestamp
    };
    var prevInteractions = interactionsRef.current; // Traced interactions should stack/accumulate.
    // To do that, clone the current interactions.
    // The previous set will be restored upon completion.

    var interactions = new Set(prevInteractions);
    interactions.add(interaction);
    interactionsRef.current = interactions;
    var subscriber = subscriberRef.current;
    var returnValue;

    try {
      if (subscriber !== null) {
        subscriber.onInteractionTraced(interaction);
      }
    } finally {
      try {
        if (subscriber !== null) {
          subscriber.onWorkStarted(interactions, threadID);
        }
      } finally {
        try {
          returnValue = callback();
        } finally {
          interactionsRef.current = prevInteractions;

          try {
            if (subscriber !== null) {
              subscriber.onWorkStopped(interactions, threadID);
            }
          } finally {
            interaction.__count--; // If no async work was scheduled for this interaction,
            // Notify subscribers that it's completed.

            if (subscriber !== null && interaction.__count === 0) {
              subscriber.onInteractionScheduledWorkCompleted(interaction);
            }
          }
        }
      }
    }

    return returnValue;
  }

  function unstable_wrap(callback) {
    var threadID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_THREAD_ID;
    var wrappedInteractions = interactionsRef.current;
    var subscriber = subscriberRef.current;

    if (subscriber !== null) {
      subscriber.onWorkScheduled(wrappedInteractions, threadID);
    } // Update the pending async work count for the current interactions.
    // Update after calling subscribers in case of error.


    wrappedInteractions.forEach(function (interaction) {
      interaction.__count++;
    });
    var hasRun = false;

    function wrapped() {
      var prevInteractions = interactionsRef.current;
      interactionsRef.current = wrappedInteractions;
      subscriber = subscriberRef.current;

      try {
        var returnValue;

        try {
          if (subscriber !== null) {
            subscriber.onWorkStarted(wrappedInteractions, threadID);
          }
        } finally {
          try {
            returnValue = callback.apply(undefined, arguments);
          } finally {
            interactionsRef.current = prevInteractions;

            if (subscriber !== null) {
              subscriber.onWorkStopped(wrappedInteractions, threadID);
            }
          }
        }

        return returnValue;
      } finally {
        if (!hasRun) {
          // We only expect a wrapped function to be executed once,
          // But in the event that it's executed more than once–
          // Only decrement the outstanding interaction counts once.
          hasRun = true; // Update pending async counts for all wrapped interactions.
          // If this was the last scheduled async work for any of them,
          // Mark them as completed.

          wrappedInteractions.forEach(function (interaction) {
            interaction.__count--;

            if (subscriber !== null && interaction.__count === 0) {
              subscriber.onInteractionScheduledWorkCompleted(interaction);
            }
          });
        }
      }
    }

    wrapped.cancel = function cancel() {
      subscriber = subscriberRef.current;

      try {
        if (subscriber !== null) {
          subscriber.onWorkCanceled(wrappedInteractions, threadID);
        }
      } finally {
        // Update pending async counts for all wrapped interactions.
        // If this was the last scheduled async work for any of them,
        // Mark them as completed.
        wrappedInteractions.forEach(function (interaction) {
          interaction.__count--;

          if (subscriber && interaction.__count === 0) {
            subscriber.onInteractionScheduledWorkCompleted(interaction);
          }
        });
      }
    };

    return wrapped;
  }

  var subscribers = null;
  {
    subscribers = new Set();
  }

  function unstable_subscribe(subscriber) {
    {
      subscribers.add(subscriber);

      if (subscribers.size === 1) {
        subscriberRef.current = {
          onInteractionScheduledWorkCompleted: onInteractionScheduledWorkCompleted,
          onInteractionTraced: onInteractionTraced,
          onWorkCanceled: onWorkCanceled,
          onWorkScheduled: onWorkScheduled,
          onWorkStarted: onWorkStarted,
          onWorkStopped: onWorkStopped
        };
      }
    }
  }

  function unstable_unsubscribe(subscriber) {
    {
      subscribers.delete(subscriber);

      if (subscribers.size === 0) {
        subscriberRef.current = null;
      }
    }
  }

  function onInteractionTraced(interaction) {
    var didCatchError = false;
    var caughtError = null;
    subscribers.forEach(function (subscriber) {
      try {
        subscriber.onInteractionTraced(interaction);
      } catch (error) {
        if (!didCatchError) {
          didCatchError = true;
          caughtError = error;
        }
      }
    });

    if (didCatchError) {
      throw caughtError;
    }
  }

  function onInteractionScheduledWorkCompleted(interaction) {
    var didCatchError = false;
    var caughtError = null;
    subscribers.forEach(function (subscriber) {
      try {
        subscriber.onInteractionScheduledWorkCompleted(interaction);
      } catch (error) {
        if (!didCatchError) {
          didCatchError = true;
          caughtError = error;
        }
      }
    });

    if (didCatchError) {
      throw caughtError;
    }
  }

  function onWorkScheduled(interactions, threadID) {
    var didCatchError = false;
    var caughtError = null;
    subscribers.forEach(function (subscriber) {
      try {
        subscriber.onWorkScheduled(interactions, threadID);
      } catch (error) {
        if (!didCatchError) {
          didCatchError = true;
          caughtError = error;
        }
      }
    });

    if (didCatchError) {
      throw caughtError;
    }
  }

  function onWorkStarted(interactions, threadID) {
    var didCatchError = false;
    var caughtError = null;
    subscribers.forEach(function (subscriber) {
      try {
        subscriber.onWorkStarted(interactions, threadID);
      } catch (error) {
        if (!didCatchError) {
          didCatchError = true;
          caughtError = error;
        }
      }
    });

    if (didCatchError) {
      throw caughtError;
    }
  }

  function onWorkStopped(interactions, threadID) {
    var didCatchError = false;
    var caughtError = null;
    subscribers.forEach(function (subscriber) {
      try {
        subscriber.onWorkStopped(interactions, threadID);
      } catch (error) {
        if (!didCatchError) {
          didCatchError = true;
          caughtError = error;
        }
      }
    });

    if (didCatchError) {
      throw caughtError;
    }
  }

  function onWorkCanceled(interactions, threadID) {
    var didCatchError = false;
    var caughtError = null;
    subscribers.forEach(function (subscriber) {
      try {
        subscriber.onWorkCanceled(interactions, threadID);
      } catch (error) {
        if (!didCatchError) {
          didCatchError = true;
          caughtError = error;
        }
      }
    });

    if (didCatchError) {
      throw caughtError;
    }
  }

  var SchedulerTracing = /*#__PURE__*/Object.freeze({
    __proto__: null,

    get __interactionsRef() {
      return interactionsRef;
    },

    get __subscriberRef() {
      return subscriberRef;
    },

    unstable_clear: unstable_clear,
    unstable_getCurrent: unstable_getCurrent,
    unstable_getThreadID: unstable_getThreadID,
    unstable_trace: unstable_trace,
    unstable_wrap: unstable_wrap,
    unstable_subscribe: unstable_subscribe,
    unstable_unsubscribe: unstable_unsubscribe
  });
  var ReactSharedInternals$1 = {
    ReactCurrentDispatcher: ReactCurrentDispatcher,
    ReactCurrentOwner: ReactCurrentOwner,
    IsSomeRendererActing: IsSomeRendererActing,
    // Used by renderers to avoid bundling object-assign twice in UMD bundles:
    assign: objectAssign
  };
  {
    objectAssign(ReactSharedInternals$1, {
      // These should not be included in production.
      ReactDebugCurrentFrame: ReactDebugCurrentFrame,
      // Shim for React DOM 16.0.0 which still destructured (but not used) this.
      // TODO: remove in React 17.0.
      ReactComponentTreeHook: {}
    });
  } // Re-export the schedule API(s) for UMD bundles.
  // This avoids introducing a dependency on a new UMD global in a minor update,
  // Since that would be a breaking change (e.g. for all existing CodeSandboxes).
  // This re-export is only required for UMD bundles;
  // CJS bundles use the shared NPM package.

  objectAssign(ReactSharedInternals$1, {
    Scheduler: Scheduler,
    SchedulerTracing: SchedulerTracing
  });
  {
    try {
      var frozenObject = Object.freeze({});
      var testMap = new Map([[frozenObject, null]]);
      var testSet = new Set([frozenObject]); // This is necessary for Rollup to not consider these unused.
      // https://github.com/rollup/rollup/issues/1771
      // TODO: we can remove these if Rollup fixes the bug.

      testMap.set(0, 0);
      testSet.add(0);
    } catch (e) {}
  }
  var createElement$1 = createElementWithValidation;
  var cloneElement$1 = cloneElementWithValidation;
  var createFactory = createFactoryWithValidation;
  var Children = {
    map: mapChildren,
    forEach: forEachChildren,
    count: countChildren,
    toArray: toArray,
    only: onlyChild
  };
  exports.Children = Children;
  exports.Component = Component;
  exports.Fragment = REACT_FRAGMENT_TYPE;
  exports.Profiler = REACT_PROFILER_TYPE;
  exports.PureComponent = PureComponent;
  exports.StrictMode = REACT_STRICT_MODE_TYPE;
  exports.Suspense = REACT_SUSPENSE_TYPE;
  exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals$1;
  exports.cloneElement = cloneElement$1;
  exports.createContext = createContext;
  exports.createElement = createElement$1;
  exports.createFactory = createFactory;
  exports.createRef = createRef;
  exports.forwardRef = forwardRef;
  exports.isValidElement = isValidElement;
  exports.lazy = lazy;
  exports.memo = memo;
  exports.useCallback = useCallback;
  exports.useContext = useContext;
  exports.useDebugValue = useDebugValue;
  exports.useEffect = useEffect;
  exports.useImperativeHandle = useImperativeHandle;
  exports.useLayoutEffect = useLayoutEffect;
  exports.useMemo = useMemo;
  exports.useReducer = useReducer;
  exports.useRef = useRef;
  exports.useState = useState;
  exports.version = ReactVersion;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2NsaWVudC9yZWFjdC5kZXZlbG9wbWVudC5qcyJdLCJuYW1lcyI6WyJnbG9iYWwiLCJmYWN0b3J5IiwiZXhwb3J0cyIsIm1vZHVsZSIsImRlZmluZSIsImFtZCIsInNlbGYiLCJSZWFjdCIsIlJlYWN0VmVyc2lvbiIsImhhc1N5bWJvbCIsIlN5bWJvbCIsImZvciIsIlJFQUNUX0VMRU1FTlRfVFlQRSIsIlJFQUNUX1BPUlRBTF9UWVBFIiwiUkVBQ1RfRlJBR01FTlRfVFlQRSIsIlJFQUNUX1NUUklDVF9NT0RFX1RZUEUiLCJSRUFDVF9QUk9GSUxFUl9UWVBFIiwiUkVBQ1RfUFJPVklERVJfVFlQRSIsIlJFQUNUX0NPTlRFWFRfVFlQRSIsIlJFQUNUX0NPTkNVUlJFTlRfTU9ERV9UWVBFIiwiUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRSIsIlJFQUNUX1NVU1BFTlNFX1RZUEUiLCJSRUFDVF9TVVNQRU5TRV9MSVNUX1RZUEUiLCJSRUFDVF9NRU1PX1RZUEUiLCJSRUFDVF9MQVpZX1RZUEUiLCJSRUFDVF9CTE9DS19UWVBFIiwiUkVBQ1RfRlVOREFNRU5UQUxfVFlQRSIsIlJFQUNUX1JFU1BPTkRFUl9UWVBFIiwiUkVBQ1RfU0NPUEVfVFlQRSIsIk1BWUJFX0lURVJBVE9SX1NZTUJPTCIsIml0ZXJhdG9yIiwiRkFVWF9JVEVSQVRPUl9TWU1CT0wiLCJnZXRJdGVyYXRvckZuIiwibWF5YmVJdGVyYWJsZSIsIm1heWJlSXRlcmF0b3IiLCJnZXRPd25Qcm9wZXJ0eVN5bWJvbHMiLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsInByb3RvdHlwZSIsInByb3BJc0VudW1lcmFibGUiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsInRvT2JqZWN0IiwidmFsIiwidW5kZWZpbmVkIiwiVHlwZUVycm9yIiwic2hvdWxkVXNlTmF0aXZlIiwiYXNzaWduIiwidGVzdDEiLCJTdHJpbmciLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwidGVzdDIiLCJpIiwiZnJvbUNoYXJDb2RlIiwib3JkZXIyIiwibWFwIiwibiIsImpvaW4iLCJ0ZXN0MyIsInNwbGl0IiwiZm9yRWFjaCIsImxldHRlciIsImtleXMiLCJlcnIiLCJvYmplY3RBc3NpZ24iLCJ0YXJnZXQiLCJzb3VyY2UiLCJmcm9tIiwidG8iLCJzeW1ib2xzIiwicyIsImFyZ3VtZW50cyIsImxlbmd0aCIsImtleSIsImNhbGwiLCJSZWFjdEN1cnJlbnREaXNwYXRjaGVyIiwiY3VycmVudCIsIlJlYWN0Q3VycmVudEJhdGNoQ29uZmlnIiwic3VzcGVuc2UiLCJSZWFjdEN1cnJlbnRPd25lciIsIkJFRk9SRV9TTEFTSF9SRSIsImRlc2NyaWJlQ29tcG9uZW50RnJhbWUiLCJuYW1lIiwib3duZXJOYW1lIiwic291cmNlSW5mbyIsInBhdGgiLCJmaWxlTmFtZSIsInJlcGxhY2UiLCJ0ZXN0IiwibWF0Y2giLCJwYXRoQmVmb3JlU2xhc2giLCJmb2xkZXJOYW1lIiwibGluZU51bWJlciIsIlJlc29sdmVkIiwicmVmaW5lUmVzb2x2ZWRMYXp5Q29tcG9uZW50IiwibGF6eUNvbXBvbmVudCIsIl9zdGF0dXMiLCJfcmVzdWx0IiwiZ2V0V3JhcHBlZE5hbWUiLCJvdXRlclR5cGUiLCJpbm5lclR5cGUiLCJ3cmFwcGVyTmFtZSIsImZ1bmN0aW9uTmFtZSIsImRpc3BsYXlOYW1lIiwiZ2V0Q29tcG9uZW50TmFtZSIsInR5cGUiLCJ0YWciLCJlcnJvciIsIiQkdHlwZW9mIiwicmVuZGVyIiwidGhlbmFibGUiLCJyZXNvbHZlZFRoZW5hYmxlIiwiUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZSIsImN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50Iiwic2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQiLCJlbGVtZW50IiwiZ2V0Q3VycmVudFN0YWNrIiwiZ2V0U3RhY2tBZGRlbmR1bSIsInN0YWNrIiwib3duZXIiLCJfb3duZXIiLCJfc291cmNlIiwiaW1wbCIsIklzU29tZVJlbmRlcmVyQWN0aW5nIiwiUmVhY3RTaGFyZWRJbnRlcm5hbHMiLCJSZWFjdENvbXBvbmVudFRyZWVIb29rIiwid2FybiIsImZvcm1hdCIsIl9sZW4iLCJhcmdzIiwiQXJyYXkiLCJfa2V5IiwicHJpbnRXYXJuaW5nIiwiX2xlbjIiLCJfa2V5MiIsImxldmVsIiwiaGFzRXhpc3RpbmdTdGFjayIsImluZGV4T2YiLCJjb25jYXQiLCJhcmdzV2l0aEZvcm1hdCIsIml0ZW0iLCJ1bnNoaWZ0IiwiRnVuY3Rpb24iLCJhcHBseSIsImNvbnNvbGUiLCJhcmdJbmRleCIsIm1lc3NhZ2UiLCJFcnJvciIsIngiLCJkaWRXYXJuU3RhdGVVcGRhdGVGb3JVbm1vdW50ZWRDb21wb25lbnQiLCJ3YXJuTm9vcCIsInB1YmxpY0luc3RhbmNlIiwiY2FsbGVyTmFtZSIsIl9jb25zdHJ1Y3RvciIsImNvbnN0cnVjdG9yIiwiY29tcG9uZW50TmFtZSIsIndhcm5pbmdLZXkiLCJSZWFjdE5vb3BVcGRhdGVRdWV1ZSIsImlzTW91bnRlZCIsImVucXVldWVGb3JjZVVwZGF0ZSIsImNhbGxiYWNrIiwiZW5xdWV1ZVJlcGxhY2VTdGF0ZSIsImNvbXBsZXRlU3RhdGUiLCJlbnF1ZXVlU2V0U3RhdGUiLCJwYXJ0aWFsU3RhdGUiLCJlbXB0eU9iamVjdCIsImZyZWV6ZSIsIkNvbXBvbmVudCIsInByb3BzIiwiY29udGV4dCIsInVwZGF0ZXIiLCJyZWZzIiwiaXNSZWFjdENvbXBvbmVudCIsInNldFN0YXRlIiwiZm9yY2VVcGRhdGUiLCJkZXByZWNhdGVkQVBJcyIsInJlcGxhY2VTdGF0ZSIsImRlZmluZURlcHJlY2F0aW9uV2FybmluZyIsIm1ldGhvZE5hbWUiLCJpbmZvIiwiZGVmaW5lUHJvcGVydHkiLCJnZXQiLCJmbk5hbWUiLCJDb21wb25lbnREdW1teSIsIlB1cmVDb21wb25lbnQiLCJwdXJlQ29tcG9uZW50UHJvdG90eXBlIiwiaXNQdXJlUmVhY3RDb21wb25lbnQiLCJjcmVhdGVSZWYiLCJyZWZPYmplY3QiLCJzZWFsIiwiaGFzT3duUHJvcGVydHkkMSIsIlJFU0VSVkVEX1BST1BTIiwicmVmIiwiX19zZWxmIiwiX19zb3VyY2UiLCJzcGVjaWFsUHJvcEtleVdhcm5pbmdTaG93biIsInNwZWNpYWxQcm9wUmVmV2FybmluZ1Nob3duIiwiZGlkV2FybkFib3V0U3RyaW5nUmVmcyIsImhhc1ZhbGlkUmVmIiwiY29uZmlnIiwiZ2V0dGVyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiaXNSZWFjdFdhcm5pbmciLCJoYXNWYWxpZEtleSIsImRlZmluZUtleVByb3BXYXJuaW5nR2V0dGVyIiwid2FybkFib3V0QWNjZXNzaW5nS2V5IiwiY29uZmlndXJhYmxlIiwiZGVmaW5lUmVmUHJvcFdhcm5pbmdHZXR0ZXIiLCJ3YXJuQWJvdXRBY2Nlc3NpbmdSZWYiLCJ3YXJuSWZTdHJpbmdSZWZDYW5ub3RCZUF1dG9Db252ZXJ0ZWQiLCJzdGF0ZU5vZGUiLCJSZWFjdEVsZW1lbnQiLCJfc3RvcmUiLCJlbnVtZXJhYmxlIiwid3JpdGFibGUiLCJ2YWx1ZSIsImNyZWF0ZUVsZW1lbnQiLCJjaGlsZHJlbiIsInByb3BOYW1lIiwiY2hpbGRyZW5MZW5ndGgiLCJjaGlsZEFycmF5IiwiZGVmYXVsdFByb3BzIiwiY2xvbmVBbmRSZXBsYWNlS2V5Iiwib2xkRWxlbWVudCIsIm5ld0tleSIsIm5ld0VsZW1lbnQiLCJfc2VsZiIsImNsb25lRWxlbWVudCIsImlzVmFsaWRFbGVtZW50Iiwib2JqZWN0IiwiU0VQQVJBVE9SIiwiU1VCU0VQQVJBVE9SIiwiZXNjYXBlIiwiZXNjYXBlUmVnZXgiLCJlc2NhcGVyTG9va3VwIiwiZXNjYXBlZFN0cmluZyIsImRpZFdhcm5BYm91dE1hcHMiLCJ1c2VyUHJvdmlkZWRLZXlFc2NhcGVSZWdleCIsImVzY2FwZVVzZXJQcm92aWRlZEtleSIsInRleHQiLCJQT09MX1NJWkUiLCJ0cmF2ZXJzZUNvbnRleHRQb29sIiwiZ2V0UG9vbGVkVHJhdmVyc2VDb250ZXh0IiwibWFwUmVzdWx0Iiwia2V5UHJlZml4IiwibWFwRnVuY3Rpb24iLCJtYXBDb250ZXh0IiwidHJhdmVyc2VDb250ZXh0IiwicG9wIiwicmVzdWx0IiwiZnVuYyIsImNvdW50IiwicmVsZWFzZVRyYXZlcnNlQ29udGV4dCIsInB1c2giLCJ0cmF2ZXJzZUFsbENoaWxkcmVuSW1wbCIsIm5hbWVTb0ZhciIsImludm9rZUNhbGxiYWNrIiwiZ2V0Q29tcG9uZW50S2V5IiwiY2hpbGQiLCJuZXh0TmFtZSIsInN1YnRyZWVDb3VudCIsIm5leHROYW1lUHJlZml4IiwiaXNBcnJheSIsIml0ZXJhdG9yRm4iLCJlbnRyaWVzIiwic3RlcCIsImlpIiwibmV4dCIsImRvbmUiLCJhZGRlbmR1bSIsImNoaWxkcmVuU3RyaW5nIiwidHJhdmVyc2VBbGxDaGlsZHJlbiIsImNvbXBvbmVudCIsImluZGV4IiwidG9TdHJpbmciLCJmb3JFYWNoU2luZ2xlQ2hpbGQiLCJib29rS2VlcGluZyIsImZvckVhY2hDaGlsZHJlbiIsImZvckVhY2hGdW5jIiwiZm9yRWFjaENvbnRleHQiLCJtYXBTaW5nbGVDaGlsZEludG9Db250ZXh0IiwiY2hpbGRLZXkiLCJtYXBwZWRDaGlsZCIsIm1hcEludG9XaXRoS2V5UHJlZml4SW50ZXJuYWwiLCJjIiwiYXJyYXkiLCJwcmVmaXgiLCJlc2NhcGVkUHJlZml4IiwibWFwQ2hpbGRyZW4iLCJjb3VudENoaWxkcmVuIiwidG9BcnJheSIsIm9ubHlDaGlsZCIsImNyZWF0ZUNvbnRleHQiLCJkZWZhdWx0VmFsdWUiLCJjYWxjdWxhdGVDaGFuZ2VkQml0cyIsIl9jYWxjdWxhdGVDaGFuZ2VkQml0cyIsIl9jdXJyZW50VmFsdWUiLCJfY3VycmVudFZhbHVlMiIsIl90aHJlYWRDb3VudCIsIlByb3ZpZGVyIiwiQ29uc3VtZXIiLCJfY29udGV4dCIsImhhc1dhcm5lZEFib3V0VXNpbmdOZXN0ZWRDb250ZXh0Q29uc3VtZXJzIiwiaGFzV2FybmVkQWJvdXRVc2luZ0NvbnN1bWVyUHJvdmlkZXIiLCJkZWZpbmVQcm9wZXJ0aWVzIiwic2V0IiwiX1Byb3ZpZGVyIiwiX2N1cnJlbnRSZW5kZXJlciIsIl9jdXJyZW50UmVuZGVyZXIyIiwibGF6eSIsImN0b3IiLCJsYXp5VHlwZSIsIl9jdG9yIiwicHJvcFR5cGVzIiwibmV3RGVmYXVsdFByb3BzIiwibmV3UHJvcFR5cGVzIiwiZm9yd2FyZFJlZiIsImlzVmFsaWRFbGVtZW50VHlwZSIsIm1lbW8iLCJjb21wYXJlIiwicmVzb2x2ZURpc3BhdGNoZXIiLCJkaXNwYXRjaGVyIiwidXNlQ29udGV4dCIsIkNvbnRleHQiLCJ1bnN0YWJsZV9vYnNlcnZlZEJpdHMiLCJyZWFsQ29udGV4dCIsInVzZVN0YXRlIiwiaW5pdGlhbFN0YXRlIiwidXNlUmVkdWNlciIsInJlZHVjZXIiLCJpbml0aWFsQXJnIiwiaW5pdCIsInVzZVJlZiIsImluaXRpYWxWYWx1ZSIsInVzZUVmZmVjdCIsImNyZWF0ZSIsImRlcHMiLCJ1c2VMYXlvdXRFZmZlY3QiLCJ1c2VDYWxsYmFjayIsInVzZU1lbW8iLCJ1c2VJbXBlcmF0aXZlSGFuZGxlIiwidXNlRGVidWdWYWx1ZSIsImZvcm1hdHRlckZuIiwiUmVhY3RQcm9wVHlwZXNTZWNyZXQiLCJSZWFjdFByb3BUeXBlc1NlY3JldF8xIiwicHJpbnRXYXJuaW5nJDEiLCJSZWFjdFByb3BUeXBlc1NlY3JldCQxIiwibG9nZ2VkVHlwZUZhaWx1cmVzIiwiaGFzIiwiYmluZCIsImNoZWNrUHJvcFR5cGVzIiwidHlwZVNwZWNzIiwidmFsdWVzIiwibG9jYXRpb24iLCJnZXRTdGFjayIsInR5cGVTcGVjTmFtZSIsImV4IiwicmVzZXRXYXJuaW5nQ2FjaGUiLCJjaGVja1Byb3BUeXBlc18xIiwicHJvcFR5cGVzTWlzc3BlbGxXYXJuaW5nU2hvd24iLCJnZXREZWNsYXJhdGlvbkVycm9yQWRkZW5kdW0iLCJnZXRTb3VyY2VJbmZvRXJyb3JBZGRlbmR1bSIsImdldFNvdXJjZUluZm9FcnJvckFkZGVuZHVtRm9yUHJvcHMiLCJlbGVtZW50UHJvcHMiLCJvd25lckhhc0tleVVzZVdhcm5pbmciLCJnZXRDdXJyZW50Q29tcG9uZW50RXJyb3JJbmZvIiwicGFyZW50VHlwZSIsInBhcmVudE5hbWUiLCJ2YWxpZGF0ZUV4cGxpY2l0S2V5IiwidmFsaWRhdGVkIiwiY3VycmVudENvbXBvbmVudEVycm9ySW5mbyIsImNoaWxkT3duZXIiLCJ2YWxpZGF0ZUNoaWxkS2V5cyIsIm5vZGUiLCJ2YWxpZGF0ZVByb3BUeXBlcyIsIlByb3BUeXBlcyIsImdldERlZmF1bHRQcm9wcyIsImlzUmVhY3RDbGFzc0FwcHJvdmVkIiwidmFsaWRhdGVGcmFnbWVudFByb3BzIiwiZnJhZ21lbnQiLCJjcmVhdGVFbGVtZW50V2l0aFZhbGlkYXRpb24iLCJ2YWxpZFR5cGUiLCJ0eXBlU3RyaW5nIiwiZGlkV2FybkFib3V0RGVwcmVjYXRlZENyZWF0ZUZhY3RvcnkiLCJjcmVhdGVGYWN0b3J5V2l0aFZhbGlkYXRpb24iLCJ2YWxpZGF0ZWRGYWN0b3J5IiwiY2xvbmVFbGVtZW50V2l0aFZhbGlkYXRpb24iLCJlbmFibGVTY2hlZHVsZXJEZWJ1Z2dpbmciLCJlbmFibGVQcm9maWxpbmciLCJyZXF1ZXN0SG9zdENhbGxiYWNrIiwicmVxdWVzdEhvc3RUaW1lb3V0IiwiY2FuY2VsSG9zdFRpbWVvdXQiLCJzaG91bGRZaWVsZFRvSG9zdCIsInJlcXVlc3RQYWludCIsImdldEN1cnJlbnRUaW1lIiwiZm9yY2VGcmFtZVJhdGUiLCJ3aW5kb3ciLCJNZXNzYWdlQ2hhbm5lbCIsIl9jYWxsYmFjayIsIl90aW1lb3V0SUQiLCJfZmx1c2hDYWxsYmFjayIsImN1cnJlbnRUaW1lIiwiaGFzUmVtYWluaW5nVGltZSIsImUiLCJzZXRUaW1lb3V0IiwiaW5pdGlhbFRpbWUiLCJEYXRlIiwibm93IiwiY2IiLCJtcyIsImNsZWFyVGltZW91dCIsInBlcmZvcm1hbmNlIiwiX0RhdGUiLCJfc2V0VGltZW91dCIsIl9jbGVhclRpbWVvdXQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsIl9pbml0aWFsVGltZSIsImlzTWVzc2FnZUxvb3BSdW5uaW5nIiwic2NoZWR1bGVkSG9zdENhbGxiYWNrIiwidGFza1RpbWVvdXRJRCIsInlpZWxkSW50ZXJ2YWwiLCJkZWFkbGluZSIsImZwcyIsIk1hdGgiLCJmbG9vciIsInBlcmZvcm1Xb3JrVW50aWxEZWFkbGluZSIsImhhc1RpbWVSZW1haW5pbmciLCJoYXNNb3JlV29yayIsInBvcnQiLCJwb3N0TWVzc2FnZSIsImNoYW5uZWwiLCJwb3J0MiIsInBvcnQxIiwib25tZXNzYWdlIiwiaGVhcCIsInNpZnRVcCIsInBlZWsiLCJmaXJzdCIsImxhc3QiLCJzaWZ0RG93biIsInBhcmVudEluZGV4IiwicGFyZW50IiwibGVmdEluZGV4IiwibGVmdCIsInJpZ2h0SW5kZXgiLCJyaWdodCIsImEiLCJiIiwiZGlmZiIsInNvcnRJbmRleCIsImlkIiwiTm9Qcmlvcml0eSIsIkltbWVkaWF0ZVByaW9yaXR5IiwiVXNlckJsb2NraW5nUHJpb3JpdHkiLCJOb3JtYWxQcmlvcml0eSIsIkxvd1ByaW9yaXR5IiwiSWRsZVByaW9yaXR5IiwicnVuSWRDb3VudGVyIiwibWFpblRocmVhZElkQ291bnRlciIsInByb2ZpbGluZ1N0YXRlU2l6ZSIsInNoYXJlZFByb2ZpbGluZ0J1ZmZlciIsIlNoYXJlZEFycmF5QnVmZmVyIiwiSW50MzJBcnJheSIsIkJZVEVTX1BFUl9FTEVNRU5UIiwiQXJyYXlCdWZmZXIiLCJwcm9maWxpbmdTdGF0ZSIsIlBSSU9SSVRZIiwiQ1VSUkVOVF9UQVNLX0lEIiwiQ1VSUkVOVF9SVU5fSUQiLCJRVUVVRV9TSVpFIiwiSU5JVElBTF9FVkVOVF9MT0dfU0laRSIsIk1BWF9FVkVOVF9MT0dfU0laRSIsImV2ZW50TG9nU2l6ZSIsImV2ZW50TG9nQnVmZmVyIiwiZXZlbnRMb2ciLCJldmVudExvZ0luZGV4IiwiVGFza1N0YXJ0RXZlbnQiLCJUYXNrQ29tcGxldGVFdmVudCIsIlRhc2tFcnJvckV2ZW50IiwiVGFza0NhbmNlbEV2ZW50IiwiVGFza1J1bkV2ZW50IiwiVGFza1lpZWxkRXZlbnQiLCJTY2hlZHVsZXJTdXNwZW5kRXZlbnQiLCJTY2hlZHVsZXJSZXN1bWVFdmVudCIsImxvZ0V2ZW50Iiwib2Zmc2V0Iiwic3RvcExvZ2dpbmdQcm9maWxpbmdFdmVudHMiLCJuZXdFdmVudExvZyIsImJ1ZmZlciIsInN0YXJ0TG9nZ2luZ1Byb2ZpbGluZ0V2ZW50cyIsIm1hcmtUYXNrU3RhcnQiLCJ0YXNrIiwicHJpb3JpdHlMZXZlbCIsIm1hcmtUYXNrQ29tcGxldGVkIiwibWFya1Rhc2tDYW5jZWxlZCIsIm1hcmtUYXNrRXJyb3JlZCIsIm1hcmtUYXNrUnVuIiwibWFya1Rhc2tZaWVsZCIsIm1hcmtTY2hlZHVsZXJTdXNwZW5kZWQiLCJtYXJrU2NoZWR1bGVyVW5zdXNwZW5kZWQiLCJtYXhTaWduZWQzMUJpdEludCIsIklNTUVESUFURV9QUklPUklUWV9USU1FT1VUIiwiVVNFUl9CTE9DS0lOR19QUklPUklUWSIsIk5PUk1BTF9QUklPUklUWV9USU1FT1VUIiwiTE9XX1BSSU9SSVRZX1RJTUVPVVQiLCJJRExFX1BSSU9SSVRZIiwidGFza1F1ZXVlIiwidGltZXJRdWV1ZSIsInRhc2tJZENvdW50ZXIiLCJjdXJyZW50VGFzayIsImN1cnJlbnRQcmlvcml0eUxldmVsIiwiaXNQZXJmb3JtaW5nV29yayIsImlzSG9zdENhbGxiYWNrU2NoZWR1bGVkIiwiaXNIb3N0VGltZW91dFNjaGVkdWxlZCIsImFkdmFuY2VUaW1lcnMiLCJ0aW1lciIsInN0YXJ0VGltZSIsImV4cGlyYXRpb25UaW1lIiwiaXNRdWV1ZWQiLCJoYW5kbGVUaW1lb3V0IiwiZmx1c2hXb3JrIiwiZmlyc3RUaW1lciIsInByZXZpb3VzUHJpb3JpdHlMZXZlbCIsIndvcmtMb29wIiwiX2N1cnJlbnRUaW1lIiwiZGlkVXNlckNhbGxiYWNrVGltZW91dCIsImNvbnRpbnVhdGlvbkNhbGxiYWNrIiwidW5zdGFibGVfcnVuV2l0aFByaW9yaXR5IiwiZXZlbnRIYW5kbGVyIiwidW5zdGFibGVfbmV4dCIsInVuc3RhYmxlX3dyYXBDYWxsYmFjayIsInBhcmVudFByaW9yaXR5TGV2ZWwiLCJ0aW1lb3V0Rm9yUHJpb3JpdHlMZXZlbCIsInVuc3RhYmxlX3NjaGVkdWxlQ2FsbGJhY2siLCJvcHRpb25zIiwidGltZW91dCIsImRlbGF5IiwibmV3VGFzayIsInVuc3RhYmxlX3BhdXNlRXhlY3V0aW9uIiwidW5zdGFibGVfY29udGludWVFeGVjdXRpb24iLCJ1bnN0YWJsZV9nZXRGaXJzdENhbGxiYWNrTm9kZSIsInVuc3RhYmxlX2NhbmNlbENhbGxiYWNrIiwidW5zdGFibGVfZ2V0Q3VycmVudFByaW9yaXR5TGV2ZWwiLCJ1bnN0YWJsZV9zaG91bGRZaWVsZCIsImZpcnN0VGFzayIsInVuc3RhYmxlX3JlcXVlc3RQYWludCIsInVuc3RhYmxlX1Byb2ZpbGluZyIsIlNjaGVkdWxlciIsIl9fcHJvdG9fXyIsInVuc3RhYmxlX0ltbWVkaWF0ZVByaW9yaXR5IiwidW5zdGFibGVfVXNlckJsb2NraW5nUHJpb3JpdHkiLCJ1bnN0YWJsZV9Ob3JtYWxQcmlvcml0eSIsInVuc3RhYmxlX0lkbGVQcmlvcml0eSIsInVuc3RhYmxlX0xvd1ByaW9yaXR5IiwidW5zdGFibGVfbm93IiwidW5zdGFibGVfZm9yY2VGcmFtZVJhdGUiLCJERUZBVUxUX1RIUkVBRF9JRCIsImludGVyYWN0aW9uSURDb3VudGVyIiwidGhyZWFkSURDb3VudGVyIiwiaW50ZXJhY3Rpb25zUmVmIiwic3Vic2NyaWJlclJlZiIsIlNldCIsInVuc3RhYmxlX2NsZWFyIiwicHJldkludGVyYWN0aW9ucyIsInVuc3RhYmxlX2dldEN1cnJlbnQiLCJ1bnN0YWJsZV9nZXRUaHJlYWRJRCIsInVuc3RhYmxlX3RyYWNlIiwidGltZXN0YW1wIiwidGhyZWFkSUQiLCJpbnRlcmFjdGlvbiIsIl9fY291bnQiLCJpbnRlcmFjdGlvbnMiLCJhZGQiLCJzdWJzY3JpYmVyIiwicmV0dXJuVmFsdWUiLCJvbkludGVyYWN0aW9uVHJhY2VkIiwib25Xb3JrU3RhcnRlZCIsIm9uV29ya1N0b3BwZWQiLCJvbkludGVyYWN0aW9uU2NoZWR1bGVkV29ya0NvbXBsZXRlZCIsInVuc3RhYmxlX3dyYXAiLCJ3cmFwcGVkSW50ZXJhY3Rpb25zIiwib25Xb3JrU2NoZWR1bGVkIiwiaGFzUnVuIiwid3JhcHBlZCIsImNhbmNlbCIsIm9uV29ya0NhbmNlbGVkIiwic3Vic2NyaWJlcnMiLCJ1bnN0YWJsZV9zdWJzY3JpYmUiLCJzaXplIiwidW5zdGFibGVfdW5zdWJzY3JpYmUiLCJkZWxldGUiLCJkaWRDYXRjaEVycm9yIiwiY2F1Z2h0RXJyb3IiLCJTY2hlZHVsZXJUcmFjaW5nIiwiX19pbnRlcmFjdGlvbnNSZWYiLCJfX3N1YnNjcmliZXJSZWYiLCJSZWFjdFNoYXJlZEludGVybmFscyQxIiwiZnJvemVuT2JqZWN0IiwidGVzdE1hcCIsIk1hcCIsInRlc3RTZXQiLCJjcmVhdGVFbGVtZW50JDEiLCJjbG9uZUVsZW1lbnQkMSIsImNyZWF0ZUZhY3RvcnkiLCJDaGlsZHJlbiIsIm9ubHkiLCJGcmFnbWVudCIsIlByb2ZpbGVyIiwiU3RyaWN0TW9kZSIsIlN1c3BlbnNlIiwiX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQiLCJ2ZXJzaW9uIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7QUFTQTs7QUFFQyxXQUFVQSxNQUFWLEVBQWtCQyxPQUFsQixFQUEyQjtBQUMxQixTQUFPQyxPQUFQLEtBQW1CLFFBQW5CLElBQStCLE9BQU9DLE1BQVAsS0FBa0IsV0FBakQsR0FBK0RGLE9BQU8sQ0FBQ0MsT0FBRCxDQUF0RSxHQUNBLE9BQU9FLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0NBLE1BQU0sQ0FBQ0MsR0FBdkMsR0FBNkNELE1BQU0sQ0FBQyxDQUFDLFNBQUQsQ0FBRCxFQUFjSCxPQUFkLENBQW5ELElBQ0NELE1BQU0sR0FBR0EsTUFBTSxJQUFJTSxJQUFuQixFQUF5QkwsT0FBTyxDQUFDRCxNQUFNLENBQUNPLEtBQVAsR0FBZSxFQUFoQixDQURqQyxDQURBO0FBR0QsQ0FKQSxFQUlDLElBSkQsRUFJUSxVQUFVTCxPQUFWLEVBQW1CO0FBQUU7O0FBRTVCLE1BQUlNLFlBQVksR0FBRyxTQUFu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TyxDQUFDeWxCLGFBQVIsR0FBd0JBLGFBQXhCO0FBQ0F6bEIsRUFBQUEsT0FBTyxDQUFDd0wsU0FBUixHQUFvQkEsU0FBcEI7QUFDQXhMLEVBQUFBLE9BQU8sQ0FBQ3lULFVBQVIsR0FBcUJBLFVBQXJCO0FBQ0F6VCxFQUFBQSxPQUFPLENBQUNpTyxjQUFSLEdBQXlCQSxjQUF6QjtBQUNBak8sRUFBQUEsT0FBTyxDQUFDa1QsSUFBUixHQUFlQSxJQUFmO0FBQ0FsVCxFQUFBQSxPQUFPLENBQUMyVCxJQUFSLEdBQWVBLElBQWY7QUFDQTNULEVBQUFBLE9BQU8sQ0FBQytVLFdBQVIsR0FBc0JBLFdBQXRCO0FBQ0EvVSxFQUFBQSxPQUFPLENBQUMrVCxVQUFSLEdBQXFCQSxVQUFyQjtBQUNBL1QsRUFBQUEsT0FBTyxDQUFDa1YsYUFBUixHQUF3QkEsYUFBeEI7QUFDQWxWLEVBQUFBLE9BQU8sQ0FBQzJVLFNBQVIsR0FBb0JBLFNBQXBCO0FBQ0EzVSxFQUFBQSxPQUFPLENBQUNpVixtQkFBUixHQUE4QkEsbUJBQTlCO0FBQ0FqVixFQUFBQSxPQUFPLENBQUM4VSxlQUFSLEdBQTBCQSxlQUExQjtBQUNBOVUsRUFBQUEsT0FBTyxDQUFDZ1YsT0FBUixHQUFrQkEsT0FBbEI7QUFDQWhWLEVBQUFBLE9BQU8sQ0FBQ3FVLFVBQVIsR0FBcUJBLFVBQXJCO0FBQ0FyVSxFQUFBQSxPQUFPLENBQUN5VSxNQUFSLEdBQWlCQSxNQUFqQjtBQUNBelUsRUFBQUEsT0FBTyxDQUFDbVUsUUFBUixHQUFtQkEsUUFBbkI7QUFDQW5VLEVBQUFBLE9BQU8sQ0FBQ2ltQixPQUFSLEdBQWtCM2xCLFlBQWxCO0FBRUQsQ0ExdUdBLENBQUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGxpY2Vuc2UgUmVhY3QgdjE2LjEzLjFcbiAqIHJlYWN0LmRldmVsb3BtZW50LmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChnbG9iYWwgPSBnbG9iYWwgfHwgc2VsZiwgZmFjdG9yeShnbG9iYWwuUmVhY3QgPSB7fSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBSZWFjdFZlcnNpb24gPSAnMTYuMTMuMSc7XG5cbiAgLy8gVGhlIFN5bWJvbCB1c2VkIHRvIHRhZyB0aGUgUmVhY3RFbGVtZW50LWxpa2UgdHlwZXMuIElmIHRoZXJlIGlzIG5vIG5hdGl2ZSBTeW1ib2xcbiAgLy8gbm9yIHBvbHlmaWxsLCB0aGVuIGEgcGxhaW4gbnVtYmVyIGlzIHVzZWQgZm9yIHBlcmZvcm1hbmNlLlxuICB2YXIgaGFzU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wuZm9yO1xuICB2YXIgUkVBQ1RfRUxFTUVOVF9UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3QuZWxlbWVudCcpIDogMHhlYWM3O1xuICB2YXIgUkVBQ1RfUE9SVEFMX1RZUEUgPSBoYXNTeW1ib2wgPyBTeW1ib2wuZm9yKCdyZWFjdC5wb3J0YWwnKSA6IDB4ZWFjYTtcbiAgdmFyIFJFQUNUX0ZSQUdNRU5UX1RZUEUgPSBoYXNTeW1ib2wgPyBTeW1ib2wuZm9yKCdyZWFjdC5mcmFnbWVudCcpIDogMHhlYWNiO1xuICB2YXIgUkVBQ1RfU1RSSUNUX01PREVfVFlQRSA9IGhhc1N5bWJvbCA/IFN5bWJvbC5mb3IoJ3JlYWN0LnN0cmljdF9tb2RlJykgOiAweGVhY2M7XG4gIHZhciBSRUFDVF9QUk9GSUxFUl9UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3QucHJvZmlsZXInKSA6IDB4ZWFkMjtcbiAgdmFyIFJFQUNUX1BST1ZJREVSX1RZUEUgPSBoYXNTeW1ib2wgPyBTeW1ib2wuZm9yKCdyZWFjdC5wcm92aWRlcicpIDogMHhlYWNkO1xuICB2YXIgUkVBQ1RfQ09OVEVYVF9UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3QuY29udGV4dCcpIDogMHhlYWNlOyAvLyBUT0RPOiBXZSBkb24ndCB1c2UgQXN5bmNNb2RlIG9yIENvbmN1cnJlbnRNb2RlIGFueW1vcmUuIFRoZXkgd2VyZSB0ZW1wb3JhcnlcbiAgdmFyIFJFQUNUX0NPTkNVUlJFTlRfTU9ERV9UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3QuY29uY3VycmVudF9tb2RlJykgOiAweGVhY2Y7XG4gIHZhciBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3QuZm9yd2FyZF9yZWYnKSA6IDB4ZWFkMDtcbiAgdmFyIFJFQUNUX1NVU1BFTlNFX1RZUEUgPSBoYXNTeW1ib2wgPyBTeW1ib2wuZm9yKCdyZWFjdC5zdXNwZW5zZScpIDogMHhlYWQxO1xuICB2YXIgUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3Quc3VzcGVuc2VfbGlzdCcpIDogMHhlYWQ4O1xuICB2YXIgUkVBQ1RfTUVNT19UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3QubWVtbycpIDogMHhlYWQzO1xuICB2YXIgUkVBQ1RfTEFaWV9UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3QubGF6eScpIDogMHhlYWQ0O1xuICB2YXIgUkVBQ1RfQkxPQ0tfVFlQRSA9IGhhc1N5bWJvbCA/IFN5bWJvbC5mb3IoJ3JlYWN0LmJsb2NrJykgOiAweGVhZDk7XG4gIHZhciBSRUFDVF9GVU5EQU1FTlRBTF9UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3QuZnVuZGFtZW50YWwnKSA6IDB4ZWFkNTtcbiAgdmFyIFJFQUNUX1JFU1BPTkRFUl9UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3QucmVzcG9uZGVyJykgOiAweGVhZDY7XG4gIHZhciBSRUFDVF9TQ09QRV9UWVBFID0gaGFzU3ltYm9sID8gU3ltYm9sLmZvcigncmVhY3Quc2NvcGUnKSA6IDB4ZWFkNztcbiAgdmFyIE1BWUJFX0lURVJBVE9SX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgU3ltYm9sLml0ZXJhdG9yO1xuICB2YXIgRkFVWF9JVEVSQVRPUl9TWU1CT0wgPSAnQEBpdGVyYXRvcic7XG4gIGZ1bmN0aW9uIGdldEl0ZXJhdG9yRm4obWF5YmVJdGVyYWJsZSkge1xuICAgIGlmIChtYXliZUl0ZXJhYmxlID09PSBudWxsIHx8IHR5cGVvZiBtYXliZUl0ZXJhYmxlICE9PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIG1heWJlSXRlcmF0b3IgPSBNQVlCRV9JVEVSQVRPUl9TWU1CT0wgJiYgbWF5YmVJdGVyYWJsZVtNQVlCRV9JVEVSQVRPUl9TWU1CT0xdIHx8IG1heWJlSXRlcmFibGVbRkFVWF9JVEVSQVRPUl9TWU1CT0xdO1xuXG4gICAgaWYgKHR5cGVvZiBtYXliZUl0ZXJhdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gbWF5YmVJdGVyYXRvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qXG4gIG9iamVjdC1hc3NpZ25cbiAgKGMpIFNpbmRyZSBTb3JodXNcbiAgQGxpY2Vuc2UgTUlUXG4gICovXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gIHZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgcHJvcElzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbiAgZnVuY3Rpb24gdG9PYmplY3QodmFsKSB7XG4gIFx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuICBcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcbiAgXHR9XG5cbiAgXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRVc2VOYXRpdmUoKSB7XG4gIFx0dHJ5IHtcbiAgXHRcdGlmICghT2JqZWN0LmFzc2lnbikge1xuICBcdFx0XHRyZXR1cm4gZmFsc2U7XG4gIFx0XHR9XG5cbiAgXHRcdC8vIERldGVjdCBidWdneSBwcm9wZXJ0eSBlbnVtZXJhdGlvbiBvcmRlciBpbiBvbGRlciBWOCB2ZXJzaW9ucy5cblxuICBcdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDExOFxuICBcdFx0dmFyIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJyk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ldy13cmFwcGVyc1xuICBcdFx0dGVzdDFbNV0gPSAnZGUnO1xuICBcdFx0aWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QxKVswXSA9PT0gJzUnKSB7XG4gIFx0XHRcdHJldHVybiBmYWxzZTtcbiAgXHRcdH1cblxuICBcdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuICBcdFx0dmFyIHRlc3QyID0ge307XG4gIFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgXHRcdFx0dGVzdDJbJ18nICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKV0gPSBpO1xuICBcdFx0fVxuICBcdFx0dmFyIG9yZGVyMiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QyKS5tYXAoZnVuY3Rpb24gKG4pIHtcbiAgXHRcdFx0cmV0dXJuIHRlc3QyW25dO1xuICBcdFx0fSk7XG4gIFx0XHRpZiAob3JkZXIyLmpvaW4oJycpICE9PSAnMDEyMzQ1Njc4OScpIHtcbiAgXHRcdFx0cmV0dXJuIGZhbHNlO1xuICBcdFx0fVxuXG4gIFx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG4gIFx0XHR2YXIgdGVzdDMgPSB7fTtcbiAgXHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlcikge1xuICBcdFx0XHR0ZXN0M1tsZXR0ZXJdID0gbGV0dGVyO1xuICBcdFx0fSk7XG4gIFx0XHRpZiAoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPT1cbiAgXHRcdFx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnKSB7XG4gIFx0XHRcdHJldHVybiBmYWxzZTtcbiAgXHRcdH1cblxuICBcdFx0cmV0dXJuIHRydWU7XG4gIFx0fSBjYXRjaCAoZXJyKSB7XG4gIFx0XHQvLyBXZSBkb24ndCBleHBlY3QgYW55IG9mIHRoZSBhYm92ZSB0byB0aHJvdywgYnV0IGJldHRlciB0byBiZSBzYWZlLlxuICBcdFx0cmV0dXJuIGZhbHNlO1xuICBcdH1cbiAgfVxuXG4gIHZhciBvYmplY3RBc3NpZ24gPSBzaG91bGRVc2VOYXRpdmUoKSA/IE9iamVjdC5hc3NpZ24gOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgXHR2YXIgZnJvbTtcbiAgXHR2YXIgdG8gPSB0b09iamVjdCh0YXJnZXQpO1xuICBcdHZhciBzeW1ib2xzO1xuXG4gIFx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcbiAgXHRcdGZyb20gPSBPYmplY3QoYXJndW1lbnRzW3NdKTtcblxuICBcdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcbiAgXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuICBcdFx0XHRcdHRvW2tleV0gPSBmcm9tW2tleV07XG4gIFx0XHRcdH1cbiAgXHRcdH1cblxuICBcdFx0aWYgKGdldE93blByb3BlcnR5U3ltYm9scykge1xuICBcdFx0XHRzeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO1xuICBcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcbiAgXHRcdFx0XHRpZiAocHJvcElzRW51bWVyYWJsZS5jYWxsKGZyb20sIHN5bWJvbHNbaV0pKSB7XG4gIFx0XHRcdFx0XHR0b1tzeW1ib2xzW2ldXSA9IGZyb21bc3ltYm9sc1tpXV07XG4gIFx0XHRcdFx0fVxuICBcdFx0XHR9XG4gIFx0XHR9XG4gIFx0fVxuXG4gIFx0cmV0dXJuIHRvO1xuICB9O1xuXG4gIC8qKlxuICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgY3VycmVudCBkaXNwYXRjaGVyLlxuICAgKi9cbiAgdmFyIFJlYWN0Q3VycmVudERpc3BhdGNoZXIgPSB7XG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHR5cGUge1JlYWN0Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGN1cnJlbnQ6IG51bGxcbiAgfTtcblxuICAvKipcbiAgICogS2VlcHMgdHJhY2sgb2YgdGhlIGN1cnJlbnQgYmF0Y2gncyBjb25maWd1cmF0aW9uIHN1Y2ggYXMgaG93IGxvbmcgYW4gdXBkYXRlXG4gICAqIHNob3VsZCBzdXNwZW5kIGZvciBpZiBpdCBuZWVkcyB0by5cbiAgICovXG4gIHZhciBSZWFjdEN1cnJlbnRCYXRjaENvbmZpZyA9IHtcbiAgICBzdXNwZW5zZTogbnVsbFxuICB9O1xuXG4gIC8qKlxuICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgY3VycmVudCBvd25lci5cbiAgICpcbiAgICogVGhlIGN1cnJlbnQgb3duZXIgaXMgdGhlIGNvbXBvbmVudCB3aG8gc2hvdWxkIG93biBhbnkgY29tcG9uZW50cyB0aGF0IGFyZVxuICAgKiBjdXJyZW50bHkgYmVpbmcgY29uc3RydWN0ZWQuXG4gICAqL1xuICB2YXIgUmVhY3RDdXJyZW50T3duZXIgPSB7XG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHR5cGUge1JlYWN0Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGN1cnJlbnQ6IG51bGxcbiAgfTtcblxuICB2YXIgQkVGT1JFX1NMQVNIX1JFID0gL14oLiopW1xcXFxcXC9dLztcbiAgZnVuY3Rpb24gZGVzY3JpYmVDb21wb25lbnRGcmFtZSAobmFtZSwgc291cmNlLCBvd25lck5hbWUpIHtcbiAgICB2YXIgc291cmNlSW5mbyA9ICcnO1xuXG4gICAgaWYgKHNvdXJjZSkge1xuICAgICAgdmFyIHBhdGggPSBzb3VyY2UuZmlsZU5hbWU7XG4gICAgICB2YXIgZmlsZU5hbWUgPSBwYXRoLnJlcGxhY2UoQkVGT1JFX1NMQVNIX1JFLCAnJyk7XG5cbiAgICAgIHtcbiAgICAgICAgLy8gSW4gREVWLCBpbmNsdWRlIGNvZGUgZm9yIGEgY29tbW9uIHNwZWNpYWwgY2FzZTpcbiAgICAgICAgLy8gcHJlZmVyIFwiZm9sZGVyL2luZGV4LmpzXCIgaW5zdGVhZCBvZiBqdXN0IFwiaW5kZXguanNcIi5cbiAgICAgICAgaWYgKC9eaW5kZXhcXC4vLnRlc3QoZmlsZU5hbWUpKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gcGF0aC5tYXRjaChCRUZPUkVfU0xBU0hfUkUpO1xuXG4gICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgcGF0aEJlZm9yZVNsYXNoID0gbWF0Y2hbMV07XG5cbiAgICAgICAgICAgIGlmIChwYXRoQmVmb3JlU2xhc2gpIHtcbiAgICAgICAgICAgICAgdmFyIGZvbGRlck5hbWUgPSBwYXRoQmVmb3JlU2xhc2gucmVwbGFjZShCRUZPUkVfU0xBU0hfUkUsICcnKTtcbiAgICAgICAgICAgICAgZmlsZU5hbWUgPSBmb2xkZXJOYW1lICsgJy8nICsgZmlsZU5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNvdXJjZUluZm8gPSAnIChhdCAnICsgZmlsZU5hbWUgKyAnOicgKyBzb3VyY2UubGluZU51bWJlciArICcpJztcbiAgICB9IGVsc2UgaWYgKG93bmVyTmFtZSkge1xuICAgICAgc291cmNlSW5mbyA9ICcgKGNyZWF0ZWQgYnkgJyArIG93bmVyTmFtZSArICcpJztcbiAgICB9XG5cbiAgICByZXR1cm4gJ1xcbiAgICBpbiAnICsgKG5hbWUgfHwgJ1Vua25vd24nKSArIHNvdXJjZUluZm87XG4gIH1cblxuICB2YXIgUmVzb2x2ZWQgPSAxO1xuICBmdW5jdGlvbiByZWZpbmVSZXNvbHZlZExhenlDb21wb25lbnQobGF6eUNvbXBvbmVudCkge1xuICAgIHJldHVybiBsYXp5Q29tcG9uZW50Ll9zdGF0dXMgPT09IFJlc29sdmVkID8gbGF6eUNvbXBvbmVudC5fcmVzdWx0IDogbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFdyYXBwZWROYW1lKG91dGVyVHlwZSwgaW5uZXJUeXBlLCB3cmFwcGVyTmFtZSkge1xuICAgIHZhciBmdW5jdGlvbk5hbWUgPSBpbm5lclR5cGUuZGlzcGxheU5hbWUgfHwgaW5uZXJUeXBlLm5hbWUgfHwgJyc7XG4gICAgcmV0dXJuIG91dGVyVHlwZS5kaXNwbGF5TmFtZSB8fCAoZnVuY3Rpb25OYW1lICE9PSAnJyA/IHdyYXBwZXJOYW1lICsgXCIoXCIgKyBmdW5jdGlvbk5hbWUgKyBcIilcIiA6IHdyYXBwZXJOYW1lKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENvbXBvbmVudE5hbWUodHlwZSkge1xuICAgIGlmICh0eXBlID09IG51bGwpIHtcbiAgICAgIC8vIEhvc3Qgcm9vdCwgdGV4dCBub2RlIG9yIGp1c3QgaW52YWxpZCB0eXBlLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAge1xuICAgICAgaWYgKHR5cGVvZiB0eXBlLnRhZyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgZXJyb3IoJ1JlY2VpdmVkIGFuIHVuZXhwZWN0ZWQgb2JqZWN0IGluIGdldENvbXBvbmVudE5hbWUoKS4gJyArICdUaGlzIGlzIGxpa2VseSBhIGJ1ZyBpbiBSZWFjdC4gUGxlYXNlIGZpbGUgYW4gaXNzdWUuJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdHlwZS5kaXNwbGF5TmFtZSB8fCB0eXBlLm5hbWUgfHwgbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgUkVBQ1RfRlJBR01FTlRfVFlQRTpcbiAgICAgICAgcmV0dXJuICdGcmFnbWVudCc7XG5cbiAgICAgIGNhc2UgUkVBQ1RfUE9SVEFMX1RZUEU6XG4gICAgICAgIHJldHVybiAnUG9ydGFsJztcblxuICAgICAgY2FzZSBSRUFDVF9QUk9GSUxFUl9UWVBFOlxuICAgICAgICByZXR1cm4gXCJQcm9maWxlclwiO1xuXG4gICAgICBjYXNlIFJFQUNUX1NUUklDVF9NT0RFX1RZUEU6XG4gICAgICAgIHJldHVybiAnU3RyaWN0TW9kZSc7XG5cbiAgICAgIGNhc2UgUkVBQ1RfU1VTUEVOU0VfVFlQRTpcbiAgICAgICAgcmV0dXJuICdTdXNwZW5zZSc7XG5cbiAgICAgIGNhc2UgUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFOlxuICAgICAgICByZXR1cm4gJ1N1c3BlbnNlTGlzdCc7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgc3dpdGNoICh0eXBlLiQkdHlwZW9mKSB7XG4gICAgICAgIGNhc2UgUkVBQ1RfQ09OVEVYVF9UWVBFOlxuICAgICAgICAgIHJldHVybiAnQ29udGV4dC5Db25zdW1lcic7XG5cbiAgICAgICAgY2FzZSBSRUFDVF9QUk9WSURFUl9UWVBFOlxuICAgICAgICAgIHJldHVybiAnQ29udGV4dC5Qcm92aWRlcic7XG5cbiAgICAgICAgY2FzZSBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFOlxuICAgICAgICAgIHJldHVybiBnZXRXcmFwcGVkTmFtZSh0eXBlLCB0eXBlLnJlbmRlciwgJ0ZvcndhcmRSZWYnKTtcblxuICAgICAgICBjYXNlIFJFQUNUX01FTU9fVFlQRTpcbiAgICAgICAgICByZXR1cm4gZ2V0Q29tcG9uZW50TmFtZSh0eXBlLnR5cGUpO1xuXG4gICAgICAgIGNhc2UgUkVBQ1RfQkxPQ0tfVFlQRTpcbiAgICAgICAgICByZXR1cm4gZ2V0Q29tcG9uZW50TmFtZSh0eXBlLnJlbmRlcik7XG5cbiAgICAgICAgY2FzZSBSRUFDVF9MQVpZX1RZUEU6XG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFyIHRoZW5hYmxlID0gdHlwZTtcbiAgICAgICAgICAgIHZhciByZXNvbHZlZFRoZW5hYmxlID0gcmVmaW5lUmVzb2x2ZWRMYXp5Q29tcG9uZW50KHRoZW5hYmxlKTtcblxuICAgICAgICAgICAgaWYgKHJlc29sdmVkVGhlbmFibGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGdldENvbXBvbmVudE5hbWUocmVzb2x2ZWRUaGVuYWJsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBSZWFjdERlYnVnQ3VycmVudEZyYW1lID0ge307XG4gIHZhciBjdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudCA9IG51bGw7XG4gIGZ1bmN0aW9uIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50KGVsZW1lbnQpIHtcbiAgICB7XG4gICAgICBjdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuICB9XG5cbiAge1xuICAgIC8vIFN0YWNrIGltcGxlbWVudGF0aW9uIGluamVjdGVkIGJ5IHRoZSBjdXJyZW50IHJlbmRlcmVyLlxuICAgIFJlYWN0RGVidWdDdXJyZW50RnJhbWUuZ2V0Q3VycmVudFN0YWNrID0gbnVsbDtcblxuICAgIFJlYWN0RGVidWdDdXJyZW50RnJhbWUuZ2V0U3RhY2tBZGRlbmR1bSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzdGFjayA9ICcnOyAvLyBBZGQgYW4gZXh0cmEgdG9wIGZyYW1lIHdoaWxlIGFuIGVsZW1lbnQgaXMgYmVpbmcgdmFsaWRhdGVkXG5cbiAgICAgIGlmIChjdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudCkge1xuICAgICAgICB2YXIgbmFtZSA9IGdldENvbXBvbmVudE5hbWUoY3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQudHlwZSk7XG4gICAgICAgIHZhciBvd25lciA9IGN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50Ll9vd25lcjtcbiAgICAgICAgc3RhY2sgKz0gZGVzY3JpYmVDb21wb25lbnRGcmFtZShuYW1lLCBjdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudC5fc291cmNlLCBvd25lciAmJiBnZXRDb21wb25lbnROYW1lKG93bmVyLnR5cGUpKTtcbiAgICAgIH0gLy8gRGVsZWdhdGUgdG8gdGhlIGluamVjdGVkIHJlbmRlcmVyLXNwZWNpZmljIGltcGxlbWVudGF0aW9uXG5cblxuICAgICAgdmFyIGltcGwgPSBSZWFjdERlYnVnQ3VycmVudEZyYW1lLmdldEN1cnJlbnRTdGFjaztcblxuICAgICAgaWYgKGltcGwpIHtcbiAgICAgICAgc3RhY2sgKz0gaW1wbCgpIHx8ICcnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RhY2s7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGJ5IGFjdCgpIHRvIHRyYWNrIHdoZXRoZXIgeW91J3JlIGluc2lkZSBhbiBhY3QoKSBzY29wZS5cbiAgICovXG4gIHZhciBJc1NvbWVSZW5kZXJlckFjdGluZyA9IHtcbiAgICBjdXJyZW50OiBmYWxzZVxuICB9O1xuXG4gIHZhciBSZWFjdFNoYXJlZEludGVybmFscyA9IHtcbiAgICBSZWFjdEN1cnJlbnREaXNwYXRjaGVyOiBSZWFjdEN1cnJlbnREaXNwYXRjaGVyLFxuICAgIFJlYWN0Q3VycmVudEJhdGNoQ29uZmlnOiBSZWFjdEN1cnJlbnRCYXRjaENvbmZpZyxcbiAgICBSZWFjdEN1cnJlbnRPd25lcjogUmVhY3RDdXJyZW50T3duZXIsXG4gICAgSXNTb21lUmVuZGVyZXJBY3Rpbmc6IElzU29tZVJlbmRlcmVyQWN0aW5nLFxuICAgIC8vIFVzZWQgYnkgcmVuZGVyZXJzIHRvIGF2b2lkIGJ1bmRsaW5nIG9iamVjdC1hc3NpZ24gdHdpY2UgaW4gVU1EIGJ1bmRsZXM6XG4gICAgYXNzaWduOiBvYmplY3RBc3NpZ25cbiAgfTtcblxuICB7XG4gICAgb2JqZWN0QXNzaWduKFJlYWN0U2hhcmVkSW50ZXJuYWxzLCB7XG4gICAgICAvLyBUaGVzZSBzaG91bGQgbm90IGJlIGluY2x1ZGVkIGluIHByb2R1Y3Rpb24uXG4gICAgICBSZWFjdERlYnVnQ3VycmVudEZyYW1lOiBSZWFjdERlYnVnQ3VycmVudEZyYW1lLFxuICAgICAgLy8gU2hpbSBmb3IgUmVhY3QgRE9NIDE2LjAuMCB3aGljaCBzdGlsbCBkZXN0cnVjdHVyZWQgKGJ1dCBub3QgdXNlZCkgdGhpcy5cbiAgICAgIC8vIFRPRE86IHJlbW92ZSBpbiBSZWFjdCAxNy4wLlxuICAgICAgUmVhY3RDb21wb25lbnRUcmVlSG9vazoge31cbiAgICB9KTtcbiAgfVxuXG4gIC8vIGJ5IGNhbGxzIHRvIHRoZXNlIG1ldGhvZHMgYnkgYSBCYWJlbCBwbHVnaW4uXG4gIC8vXG4gIC8vIEluIFBST0QgKG9yIGluIHBhY2thZ2VzIHdpdGhvdXQgYWNjZXNzIHRvIFJlYWN0IGludGVybmFscyksXG4gIC8vIHRoZXkgYXJlIGxlZnQgYXMgdGhleSBhcmUgaW5zdGVhZC5cblxuICBmdW5jdGlvbiB3YXJuKGZvcm1hdCkge1xuICAgIHtcbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgYXJnc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIHByaW50V2FybmluZygnd2FybicsIGZvcm1hdCwgYXJncyk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGVycm9yKGZvcm1hdCkge1xuICAgIHtcbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuMiA+IDEgPyBfbGVuMiAtIDEgOiAwKSwgX2tleTIgPSAxOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgIGFyZ3NbX2tleTIgLSAxXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG5cbiAgICAgIHByaW50V2FybmluZygnZXJyb3InLCBmb3JtYXQsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHByaW50V2FybmluZyhsZXZlbCwgZm9ybWF0LCBhcmdzKSB7XG4gICAgLy8gV2hlbiBjaGFuZ2luZyB0aGlzIGxvZ2ljLCB5b3UgbWlnaHQgd2FudCB0byBhbHNvXG4gICAgLy8gdXBkYXRlIGNvbnNvbGVXaXRoU3RhY2tEZXYud3d3LmpzIGFzIHdlbGwuXG4gICAge1xuICAgICAgdmFyIGhhc0V4aXN0aW5nU3RhY2sgPSBhcmdzLmxlbmd0aCA+IDAgJiYgdHlwZW9mIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gJ3N0cmluZycgJiYgYXJnc1thcmdzLmxlbmd0aCAtIDFdLmluZGV4T2YoJ1xcbiAgICBpbicpID09PSAwO1xuXG4gICAgICBpZiAoIWhhc0V4aXN0aW5nU3RhY2spIHtcbiAgICAgICAgdmFyIFJlYWN0RGVidWdDdXJyZW50RnJhbWUgPSBSZWFjdFNoYXJlZEludGVybmFscy5SZWFjdERlYnVnQ3VycmVudEZyYW1lO1xuICAgICAgICB2YXIgc3RhY2sgPSBSZWFjdERlYnVnQ3VycmVudEZyYW1lLmdldFN0YWNrQWRkZW5kdW0oKTtcblxuICAgICAgICBpZiAoc3RhY2sgIT09ICcnKSB7XG4gICAgICAgICAgZm9ybWF0ICs9ICclcyc7XG4gICAgICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KFtzdGFja10pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBhcmdzV2l0aEZvcm1hdCA9IGFyZ3MubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiAnJyArIGl0ZW07XG4gICAgICB9KTsgLy8gQ2FyZWZ1bDogUk4gY3VycmVudGx5IGRlcGVuZHMgb24gdGhpcyBwcmVmaXhcblxuICAgICAgYXJnc1dpdGhGb3JtYXQudW5zaGlmdCgnV2FybmluZzogJyArIGZvcm1hdCk7IC8vIFdlIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIHNwcmVhZCAob3IgLmFwcGx5KSBkaXJlY3RseSBiZWNhdXNlIGl0XG4gICAgICAvLyBicmVha3MgSUU5OiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvaXNzdWVzLzEzNjEwXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaW50ZXJuYWwvbm8tcHJvZHVjdGlvbi1sb2dnaW5nXG5cbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGVbbGV2ZWxdLCBjb25zb2xlLCBhcmdzV2l0aEZvcm1hdCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIC0tLSBXZWxjb21lIHRvIGRlYnVnZ2luZyBSZWFjdCAtLS1cbiAgICAgICAgLy8gVGhpcyBlcnJvciB3YXMgdGhyb3duIGFzIGEgY29udmVuaWVuY2Ugc28gdGhhdCB5b3UgY2FuIHVzZSB0aGlzIHN0YWNrXG4gICAgICAgIC8vIHRvIGZpbmQgdGhlIGNhbGxzaXRlIHRoYXQgY2F1c2VkIHRoaXMgd2FybmluZyB0byBmaXJlLlxuICAgICAgICB2YXIgYXJnSW5kZXggPSAwO1xuICAgICAgICB2YXIgbWVzc2FnZSA9ICdXYXJuaW5nOiAnICsgZm9ybWF0LnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gYXJnc1thcmdJbmRleCsrXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKHgpIHt9XG4gICAgfVxuICB9XG5cbiAgdmFyIGRpZFdhcm5TdGF0ZVVwZGF0ZUZvclVubW91bnRlZENvbXBvbmVudCA9IHt9O1xuXG4gIGZ1bmN0aW9uIHdhcm5Ob29wKHB1YmxpY0luc3RhbmNlLCBjYWxsZXJOYW1lKSB7XG4gICAge1xuICAgICAgdmFyIF9jb25zdHJ1Y3RvciA9IHB1YmxpY0luc3RhbmNlLmNvbnN0cnVjdG9yO1xuICAgICAgdmFyIGNvbXBvbmVudE5hbWUgPSBfY29uc3RydWN0b3IgJiYgKF9jb25zdHJ1Y3Rvci5kaXNwbGF5TmFtZSB8fCBfY29uc3RydWN0b3IubmFtZSkgfHwgJ1JlYWN0Q2xhc3MnO1xuICAgICAgdmFyIHdhcm5pbmdLZXkgPSBjb21wb25lbnROYW1lICsgXCIuXCIgKyBjYWxsZXJOYW1lO1xuXG4gICAgICBpZiAoZGlkV2FyblN0YXRlVXBkYXRlRm9yVW5tb3VudGVkQ29tcG9uZW50W3dhcm5pbmdLZXldKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZXJyb3IoXCJDYW4ndCBjYWxsICVzIG9uIGEgY29tcG9uZW50IHRoYXQgaXMgbm90IHlldCBtb3VudGVkLiBcIiArICdUaGlzIGlzIGEgbm8tb3AsIGJ1dCBpdCBtaWdodCBpbmRpY2F0ZSBhIGJ1ZyBpbiB5b3VyIGFwcGxpY2F0aW9uLiAnICsgJ0luc3RlYWQsIGFzc2lnbiB0byBgdGhpcy5zdGF0ZWAgZGlyZWN0bHkgb3IgZGVmaW5lIGEgYHN0YXRlID0ge307YCAnICsgJ2NsYXNzIHByb3BlcnR5IHdpdGggdGhlIGRlc2lyZWQgc3RhdGUgaW4gdGhlICVzIGNvbXBvbmVudC4nLCBjYWxsZXJOYW1lLCBjb21wb25lbnROYW1lKTtcblxuICAgICAgZGlkV2FyblN0YXRlVXBkYXRlRm9yVW5tb3VudGVkQ29tcG9uZW50W3dhcm5pbmdLZXldID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFRoaXMgaXMgdGhlIGFic3RyYWN0IEFQSSBmb3IgYW4gdXBkYXRlIHF1ZXVlLlxuICAgKi9cblxuXG4gIHZhciBSZWFjdE5vb3BVcGRhdGVRdWV1ZSA9IHtcbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2hldGhlciBvciBub3QgdGhpcyBjb21wb3NpdGUgY29tcG9uZW50IGlzIG1vdW50ZWQuXG4gICAgICogQHBhcmFtIHtSZWFjdENsYXNzfSBwdWJsaWNJbnN0YW5jZSBUaGUgaW5zdGFuY2Ugd2Ugd2FudCB0byB0ZXN0LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgbW91bnRlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAZmluYWxcbiAgICAgKi9cbiAgICBpc01vdW50ZWQ6IGZ1bmN0aW9uIChwdWJsaWNJbnN0YW5jZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JjZXMgYW4gdXBkYXRlLiBUaGlzIHNob3VsZCBvbmx5IGJlIGludm9rZWQgd2hlbiBpdCBpcyBrbm93biB3aXRoXG4gICAgICogY2VydGFpbnR5IHRoYXQgd2UgYXJlICoqbm90KiogaW4gYSBET00gdHJhbnNhY3Rpb24uXG4gICAgICpcbiAgICAgKiBZb3UgbWF5IHdhbnQgdG8gY2FsbCB0aGlzIHdoZW4geW91IGtub3cgdGhhdCBzb21lIGRlZXBlciBhc3BlY3Qgb2YgdGhlXG4gICAgICogY29tcG9uZW50J3Mgc3RhdGUgaGFzIGNoYW5nZWQgYnV0IGBzZXRTdGF0ZWAgd2FzIG5vdCBjYWxsZWQuXG4gICAgICpcbiAgICAgKiBUaGlzIHdpbGwgbm90IGludm9rZSBgc2hvdWxkQ29tcG9uZW50VXBkYXRlYCwgYnV0IGl0IHdpbGwgaW52b2tlXG4gICAgICogYGNvbXBvbmVudFdpbGxVcGRhdGVgIGFuZCBgY29tcG9uZW50RGlkVXBkYXRlYC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7UmVhY3RDbGFzc30gcHVibGljSW5zdGFuY2UgVGhlIGluc3RhbmNlIHRoYXQgc2hvdWxkIHJlcmVuZGVyLlxuICAgICAqIEBwYXJhbSB7P2Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsZWQgYWZ0ZXIgY29tcG9uZW50IGlzIHVwZGF0ZWQuXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSBjYWxsZXJOYW1lIG5hbWUgb2YgdGhlIGNhbGxpbmcgZnVuY3Rpb24gaW4gdGhlIHB1YmxpYyBBUEkuXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgZW5xdWV1ZUZvcmNlVXBkYXRlOiBmdW5jdGlvbiAocHVibGljSW5zdGFuY2UsIGNhbGxiYWNrLCBjYWxsZXJOYW1lKSB7XG4gICAgICB3YXJuTm9vcChwdWJsaWNJbnN0YW5jZSwgJ2ZvcmNlVXBkYXRlJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlcGxhY2VzIGFsbCBvZiB0aGUgc3RhdGUuIEFsd2F5cyB1c2UgdGhpcyBvciBgc2V0U3RhdGVgIHRvIG11dGF0ZSBzdGF0ZS5cbiAgICAgKiBZb3Ugc2hvdWxkIHRyZWF0IGB0aGlzLnN0YXRlYCBhcyBpbW11dGFibGUuXG4gICAgICpcbiAgICAgKiBUaGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCBgdGhpcy5zdGF0ZWAgd2lsbCBiZSBpbW1lZGlhdGVseSB1cGRhdGVkLCBzb1xuICAgICAqIGFjY2Vzc2luZyBgdGhpcy5zdGF0ZWAgYWZ0ZXIgY2FsbGluZyB0aGlzIG1ldGhvZCBtYXkgcmV0dXJuIHRoZSBvbGQgdmFsdWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1JlYWN0Q2xhc3N9IHB1YmxpY0luc3RhbmNlIFRoZSBpbnN0YW5jZSB0aGF0IHNob3VsZCByZXJlbmRlci5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29tcGxldGVTdGF0ZSBOZXh0IHN0YXRlLlxuICAgICAqIEBwYXJhbSB7P2Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsZWQgYWZ0ZXIgY29tcG9uZW50IGlzIHVwZGF0ZWQuXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSBjYWxsZXJOYW1lIG5hbWUgb2YgdGhlIGNhbGxpbmcgZnVuY3Rpb24gaW4gdGhlIHB1YmxpYyBBUEkuXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgZW5xdWV1ZVJlcGxhY2VTdGF0ZTogZnVuY3Rpb24gKHB1YmxpY0luc3RhbmNlLCBjb21wbGV0ZVN0YXRlLCBjYWxsYmFjaywgY2FsbGVyTmFtZSkge1xuICAgICAgd2Fybk5vb3AocHVibGljSW5zdGFuY2UsICdyZXBsYWNlU3RhdGUnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyBhIHN1YnNldCBvZiB0aGUgc3RhdGUuIFRoaXMgb25seSBleGlzdHMgYmVjYXVzZSBfcGVuZGluZ1N0YXRlIGlzXG4gICAgICogaW50ZXJuYWwuIFRoaXMgcHJvdmlkZXMgYSBtZXJnaW5nIHN0cmF0ZWd5IHRoYXQgaXMgbm90IGF2YWlsYWJsZSB0byBkZWVwXG4gICAgICogcHJvcGVydGllcyB3aGljaCBpcyBjb25mdXNpbmcuIFRPRE86IEV4cG9zZSBwZW5kaW5nU3RhdGUgb3IgZG9uJ3QgdXNlIGl0XG4gICAgICogZHVyaW5nIHRoZSBtZXJnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7UmVhY3RDbGFzc30gcHVibGljSW5zdGFuY2UgVGhlIGluc3RhbmNlIHRoYXQgc2hvdWxkIHJlcmVuZGVyLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJ0aWFsU3RhdGUgTmV4dCBwYXJ0aWFsIHN0YXRlIHRvIGJlIG1lcmdlZCB3aXRoIHN0YXRlLlxuICAgICAqIEBwYXJhbSB7P2Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsZWQgYWZ0ZXIgY29tcG9uZW50IGlzIHVwZGF0ZWQuXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSBOYW1lIG9mIHRoZSBjYWxsaW5nIGZ1bmN0aW9uIGluIHRoZSBwdWJsaWMgQVBJLlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIGVucXVldWVTZXRTdGF0ZTogZnVuY3Rpb24gKHB1YmxpY0luc3RhbmNlLCBwYXJ0aWFsU3RhdGUsIGNhbGxiYWNrLCBjYWxsZXJOYW1lKSB7XG4gICAgICB3YXJuTm9vcChwdWJsaWNJbnN0YW5jZSwgJ3NldFN0YXRlJyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBlbXB0eU9iamVjdCA9IHt9O1xuXG4gIHtcbiAgICBPYmplY3QuZnJlZXplKGVtcHR5T2JqZWN0KTtcbiAgfVxuICAvKipcbiAgICogQmFzZSBjbGFzcyBoZWxwZXJzIGZvciB0aGUgdXBkYXRpbmcgc3RhdGUgb2YgYSBjb21wb25lbnQuXG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gQ29tcG9uZW50KHByb3BzLCBjb250ZXh0LCB1cGRhdGVyKSB7XG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7IC8vIElmIGEgY29tcG9uZW50IGhhcyBzdHJpbmcgcmVmcywgd2Ugd2lsbCBhc3NpZ24gYSBkaWZmZXJlbnQgb2JqZWN0IGxhdGVyLlxuXG4gICAgdGhpcy5yZWZzID0gZW1wdHlPYmplY3Q7IC8vIFdlIGluaXRpYWxpemUgdGhlIGRlZmF1bHQgdXBkYXRlciBidXQgdGhlIHJlYWwgb25lIGdldHMgaW5qZWN0ZWQgYnkgdGhlXG4gICAgLy8gcmVuZGVyZXIuXG5cbiAgICB0aGlzLnVwZGF0ZXIgPSB1cGRhdGVyIHx8IFJlYWN0Tm9vcFVwZGF0ZVF1ZXVlO1xuICB9XG5cbiAgQ29tcG9uZW50LnByb3RvdHlwZS5pc1JlYWN0Q29tcG9uZW50ID0ge307XG4gIC8qKlxuICAgKiBTZXRzIGEgc3Vic2V0IG9mIHRoZSBzdGF0ZS4gQWx3YXlzIHVzZSB0aGlzIHRvIG11dGF0ZVxuICAgKiBzdGF0ZS4gWW91IHNob3VsZCB0cmVhdCBgdGhpcy5zdGF0ZWAgYXMgaW1tdXRhYmxlLlxuICAgKlxuICAgKiBUaGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCBgdGhpcy5zdGF0ZWAgd2lsbCBiZSBpbW1lZGlhdGVseSB1cGRhdGVkLCBzb1xuICAgKiBhY2Nlc3NpbmcgYHRoaXMuc3RhdGVgIGFmdGVyIGNhbGxpbmcgdGhpcyBtZXRob2QgbWF5IHJldHVybiB0aGUgb2xkIHZhbHVlLlxuICAgKlxuICAgKiBUaGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCBjYWxscyB0byBgc2V0U3RhdGVgIHdpbGwgcnVuIHN5bmNocm9ub3VzbHksXG4gICAqIGFzIHRoZXkgbWF5IGV2ZW50dWFsbHkgYmUgYmF0Y2hlZCB0b2dldGhlci4gIFlvdSBjYW4gcHJvdmlkZSBhbiBvcHRpb25hbFxuICAgKiBjYWxsYmFjayB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgY2FsbCB0byBzZXRTdGF0ZSBpcyBhY3R1YWxseVxuICAgKiBjb21wbGV0ZWQuXG4gICAqXG4gICAqIFdoZW4gYSBmdW5jdGlvbiBpcyBwcm92aWRlZCB0byBzZXRTdGF0ZSwgaXQgd2lsbCBiZSBjYWxsZWQgYXQgc29tZSBwb2ludCBpblxuICAgKiB0aGUgZnV0dXJlIChub3Qgc3luY2hyb25vdXNseSkuIEl0IHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIHVwIHRvIGRhdGVcbiAgICogY29tcG9uZW50IGFyZ3VtZW50cyAoc3RhdGUsIHByb3BzLCBjb250ZXh0KS4gVGhlc2UgdmFsdWVzIGNhbiBiZSBkaWZmZXJlbnRcbiAgICogZnJvbSB0aGlzLiogYmVjYXVzZSB5b3VyIGZ1bmN0aW9uIG1heSBiZSBjYWxsZWQgYWZ0ZXIgcmVjZWl2ZVByb3BzIGJ1dCBiZWZvcmVcbiAgICogc2hvdWxkQ29tcG9uZW50VXBkYXRlLCBhbmQgdGhpcyBuZXcgc3RhdGUsIHByb3BzLCBhbmQgY29udGV4dCB3aWxsIG5vdCB5ZXQgYmVcbiAgICogYXNzaWduZWQgdG8gdGhpcy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R8ZnVuY3Rpb259IHBhcnRpYWxTdGF0ZSBOZXh0IHBhcnRpYWwgc3RhdGUgb3IgZnVuY3Rpb24gdG9cbiAgICogICAgICAgIHByb2R1Y2UgbmV4dCBwYXJ0aWFsIHN0YXRlIHRvIGJlIG1lcmdlZCB3aXRoIGN1cnJlbnQgc3RhdGUuXG4gICAqIEBwYXJhbSB7P2Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsZWQgYWZ0ZXIgc3RhdGUgaXMgdXBkYXRlZC5cbiAgICogQGZpbmFsXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG5cbiAgQ29tcG9uZW50LnByb3RvdHlwZS5zZXRTdGF0ZSA9IGZ1bmN0aW9uIChwYXJ0aWFsU3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCEodHlwZW9mIHBhcnRpYWxTdGF0ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHBhcnRpYWxTdGF0ZSA9PT0gJ2Z1bmN0aW9uJyB8fCBwYXJ0aWFsU3RhdGUgPT0gbnVsbCkpIHtcbiAgICAgIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoIFwic2V0U3RhdGUoLi4uKTogdGFrZXMgYW4gb2JqZWN0IG9mIHN0YXRlIHZhcmlhYmxlcyB0byB1cGRhdGUgb3IgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGFuIG9iamVjdCBvZiBzdGF0ZSB2YXJpYWJsZXMuXCIgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZXIuZW5xdWV1ZVNldFN0YXRlKHRoaXMsIHBhcnRpYWxTdGF0ZSwgY2FsbGJhY2ssICdzZXRTdGF0ZScpO1xuICB9O1xuICAvKipcbiAgICogRm9yY2VzIGFuIHVwZGF0ZS4gVGhpcyBzaG91bGQgb25seSBiZSBpbnZva2VkIHdoZW4gaXQgaXMga25vd24gd2l0aFxuICAgKiBjZXJ0YWludHkgdGhhdCB3ZSBhcmUgKipub3QqKiBpbiBhIERPTSB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogWW91IG1heSB3YW50IHRvIGNhbGwgdGhpcyB3aGVuIHlvdSBrbm93IHRoYXQgc29tZSBkZWVwZXIgYXNwZWN0IG9mIHRoZVxuICAgKiBjb21wb25lbnQncyBzdGF0ZSBoYXMgY2hhbmdlZCBidXQgYHNldFN0YXRlYCB3YXMgbm90IGNhbGxlZC5cbiAgICpcbiAgICogVGhpcyB3aWxsIG5vdCBpbnZva2UgYHNob3VsZENvbXBvbmVudFVwZGF0ZWAsIGJ1dCBpdCB3aWxsIGludm9rZVxuICAgKiBgY29tcG9uZW50V2lsbFVwZGF0ZWAgYW5kIGBjb21wb25lbnREaWRVcGRhdGVgLlxuICAgKlxuICAgKiBAcGFyYW0gez9mdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGVkIGFmdGVyIHVwZGF0ZSBpcyBjb21wbGV0ZS5cbiAgICogQGZpbmFsXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG5cblxuICBDb21wb25lbnQucHJvdG90eXBlLmZvcmNlVXBkYXRlID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdGhpcy51cGRhdGVyLmVucXVldWVGb3JjZVVwZGF0ZSh0aGlzLCBjYWxsYmFjaywgJ2ZvcmNlVXBkYXRlJyk7XG4gIH07XG4gIC8qKlxuICAgKiBEZXByZWNhdGVkIEFQSXMuIFRoZXNlIEFQSXMgdXNlZCB0byBleGlzdCBvbiBjbGFzc2ljIFJlYWN0IGNsYXNzZXMgYnV0IHNpbmNlXG4gICAqIHdlIHdvdWxkIGxpa2UgdG8gZGVwcmVjYXRlIHRoZW0sIHdlJ3JlIG5vdCBnb2luZyB0byBtb3ZlIHRoZW0gb3ZlciB0byB0aGlzXG4gICAqIG1vZGVybiBiYXNlIGNsYXNzLiBJbnN0ZWFkLCB3ZSBkZWZpbmUgYSBnZXR0ZXIgdGhhdCB3YXJucyBpZiBpdCdzIGFjY2Vzc2VkLlxuICAgKi9cblxuXG4gIHtcbiAgICB2YXIgZGVwcmVjYXRlZEFQSXMgPSB7XG4gICAgICBpc01vdW50ZWQ6IFsnaXNNb3VudGVkJywgJ0luc3RlYWQsIG1ha2Ugc3VyZSB0byBjbGVhbiB1cCBzdWJzY3JpcHRpb25zIGFuZCBwZW5kaW5nIHJlcXVlc3RzIGluICcgKyAnY29tcG9uZW50V2lsbFVubW91bnQgdG8gcHJldmVudCBtZW1vcnkgbGVha3MuJ10sXG4gICAgICByZXBsYWNlU3RhdGU6IFsncmVwbGFjZVN0YXRlJywgJ1JlZmFjdG9yIHlvdXIgY29kZSB0byB1c2Ugc2V0U3RhdGUgaW5zdGVhZCAoc2VlICcgKyAnaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2lzc3Vlcy8zMjM2KS4nXVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lRGVwcmVjYXRpb25XYXJuaW5nID0gZnVuY3Rpb24gKG1ldGhvZE5hbWUsIGluZm8pIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb21wb25lbnQucHJvdG90eXBlLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHdhcm4oJyVzKC4uLikgaXMgZGVwcmVjYXRlZCBpbiBwbGFpbiBKYXZhU2NyaXB0IFJlYWN0IGNsYXNzZXMuICVzJywgaW5mb1swXSwgaW5mb1sxXSk7XG5cbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZm9yICh2YXIgZm5OYW1lIGluIGRlcHJlY2F0ZWRBUElzKSB7XG4gICAgICBpZiAoZGVwcmVjYXRlZEFQSXMuaGFzT3duUHJvcGVydHkoZm5OYW1lKSkge1xuICAgICAgICBkZWZpbmVEZXByZWNhdGlvbldhcm5pbmcoZm5OYW1lLCBkZXByZWNhdGVkQVBJc1tmbk5hbWVdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBDb21wb25lbnREdW1teSgpIHt9XG5cbiAgQ29tcG9uZW50RHVtbXkucHJvdG90eXBlID0gQ29tcG9uZW50LnByb3RvdHlwZTtcbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGNvbXBvbmVudCB3aXRoIGRlZmF1bHQgc2hhbGxvdyBlcXVhbGl0eSBjaGVjayBmb3Igc0NVLlxuICAgKi9cblxuICBmdW5jdGlvbiBQdXJlQ29tcG9uZW50KHByb3BzLCBjb250ZXh0LCB1cGRhdGVyKSB7XG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7IC8vIElmIGEgY29tcG9uZW50IGhhcyBzdHJpbmcgcmVmcywgd2Ugd2lsbCBhc3NpZ24gYSBkaWZmZXJlbnQgb2JqZWN0IGxhdGVyLlxuXG4gICAgdGhpcy5yZWZzID0gZW1wdHlPYmplY3Q7XG4gICAgdGhpcy51cGRhdGVyID0gdXBkYXRlciB8fCBSZWFjdE5vb3BVcGRhdGVRdWV1ZTtcbiAgfVxuXG4gIHZhciBwdXJlQ29tcG9uZW50UHJvdG90eXBlID0gUHVyZUNvbXBvbmVudC5wcm90b3R5cGUgPSBuZXcgQ29tcG9uZW50RHVtbXkoKTtcbiAgcHVyZUNvbXBvbmVudFByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFB1cmVDb21wb25lbnQ7IC8vIEF2b2lkIGFuIGV4dHJhIHByb3RvdHlwZSBqdW1wIGZvciB0aGVzZSBtZXRob2RzLlxuXG4gIG9iamVjdEFzc2lnbihwdXJlQ29tcG9uZW50UHJvdG90eXBlLCBDb21wb25lbnQucHJvdG90eXBlKTtcblxuICBwdXJlQ29tcG9uZW50UHJvdG90eXBlLmlzUHVyZVJlYWN0Q29tcG9uZW50ID0gdHJ1ZTtcblxuICAvLyBhbiBpbW11dGFibGUgb2JqZWN0IHdpdGggYSBzaW5nbGUgbXV0YWJsZSB2YWx1ZVxuICBmdW5jdGlvbiBjcmVhdGVSZWYoKSB7XG4gICAgdmFyIHJlZk9iamVjdCA9IHtcbiAgICAgIGN1cnJlbnQ6IG51bGxcbiAgICB9O1xuXG4gICAge1xuICAgICAgT2JqZWN0LnNlYWwocmVmT2JqZWN0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVmT2JqZWN0O1xuICB9XG5cbiAgdmFyIGhhc093blByb3BlcnR5JDEgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgUkVTRVJWRURfUFJPUFMgPSB7XG4gICAga2V5OiB0cnVlLFxuICAgIHJlZjogdHJ1ZSxcbiAgICBfX3NlbGY6IHRydWUsXG4gICAgX19zb3VyY2U6IHRydWVcbiAgfTtcbiAgdmFyIHNwZWNpYWxQcm9wS2V5V2FybmluZ1Nob3duLCBzcGVjaWFsUHJvcFJlZldhcm5pbmdTaG93biwgZGlkV2FybkFib3V0U3RyaW5nUmVmcztcblxuICB7XG4gICAgZGlkV2FybkFib3V0U3RyaW5nUmVmcyA9IHt9O1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzVmFsaWRSZWYoY29uZmlnKSB7XG4gICAge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5JDEuY2FsbChjb25maWcsICdyZWYnKSkge1xuICAgICAgICB2YXIgZ2V0dGVyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihjb25maWcsICdyZWYnKS5nZXQ7XG5cbiAgICAgICAgaWYgKGdldHRlciAmJiBnZXR0ZXIuaXNSZWFjdFdhcm5pbmcpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnLnJlZiAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzVmFsaWRLZXkoY29uZmlnKSB7XG4gICAge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5JDEuY2FsbChjb25maWcsICdrZXknKSkge1xuICAgICAgICB2YXIgZ2V0dGVyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihjb25maWcsICdrZXknKS5nZXQ7XG5cbiAgICAgICAgaWYgKGdldHRlciAmJiBnZXR0ZXIuaXNSZWFjdFdhcm5pbmcpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnLmtleSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVmaW5lS2V5UHJvcFdhcm5pbmdHZXR0ZXIocHJvcHMsIGRpc3BsYXlOYW1lKSB7XG4gICAgdmFyIHdhcm5BYm91dEFjY2Vzc2luZ0tleSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHtcbiAgICAgICAgaWYgKCFzcGVjaWFsUHJvcEtleVdhcm5pbmdTaG93bikge1xuICAgICAgICAgIHNwZWNpYWxQcm9wS2V5V2FybmluZ1Nob3duID0gdHJ1ZTtcblxuICAgICAgICAgIGVycm9yKCclczogYGtleWAgaXMgbm90IGEgcHJvcC4gVHJ5aW5nIHRvIGFjY2VzcyBpdCB3aWxsIHJlc3VsdCAnICsgJ2luIGB1bmRlZmluZWRgIGJlaW5nIHJldHVybmVkLiBJZiB5b3UgbmVlZCB0byBhY2Nlc3MgdGhlIHNhbWUgJyArICd2YWx1ZSB3aXRoaW4gdGhlIGNoaWxkIGNvbXBvbmVudCwgeW91IHNob3VsZCBwYXNzIGl0IGFzIGEgZGlmZmVyZW50ICcgKyAncHJvcC4gKGh0dHBzOi8vZmIubWUvcmVhY3Qtc3BlY2lhbC1wcm9wcyknLCBkaXNwbGF5TmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2FybkFib3V0QWNjZXNzaW5nS2V5LmlzUmVhY3RXYXJuaW5nID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvcHMsICdrZXknLCB7XG4gICAgICBnZXQ6IHdhcm5BYm91dEFjY2Vzc2luZ0tleSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVmaW5lUmVmUHJvcFdhcm5pbmdHZXR0ZXIocHJvcHMsIGRpc3BsYXlOYW1lKSB7XG4gICAgdmFyIHdhcm5BYm91dEFjY2Vzc2luZ1JlZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHtcbiAgICAgICAgaWYgKCFzcGVjaWFsUHJvcFJlZldhcm5pbmdTaG93bikge1xuICAgICAgICAgIHNwZWNpYWxQcm9wUmVmV2FybmluZ1Nob3duID0gdHJ1ZTtcblxuICAgICAgICAgIGVycm9yKCclczogYHJlZmAgaXMgbm90IGEgcHJvcC4gVHJ5aW5nIHRvIGFjY2VzcyBpdCB3aWxsIHJlc3VsdCAnICsgJ2luIGB1bmRlZmluZWRgIGJlaW5nIHJldHVybmVkLiBJZiB5b3UgbmVlZCB0byBhY2Nlc3MgdGhlIHNhbWUgJyArICd2YWx1ZSB3aXRoaW4gdGhlIGNoaWxkIGNvbXBvbmVudCwgeW91IHNob3VsZCBwYXNzIGl0IGFzIGEgZGlmZmVyZW50ICcgKyAncHJvcC4gKGh0dHBzOi8vZmIubWUvcmVhY3Qtc3BlY2lhbC1wcm9wcyknLCBkaXNwbGF5TmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2FybkFib3V0QWNjZXNzaW5nUmVmLmlzUmVhY3RXYXJuaW5nID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvcHMsICdyZWYnLCB7XG4gICAgICBnZXQ6IHdhcm5BYm91dEFjY2Vzc2luZ1JlZixcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gd2FybklmU3RyaW5nUmVmQ2Fubm90QmVBdXRvQ29udmVydGVkKGNvbmZpZykge1xuICAgIHtcbiAgICAgIGlmICh0eXBlb2YgY29uZmlnLnJlZiA9PT0gJ3N0cmluZycgJiYgUmVhY3RDdXJyZW50T3duZXIuY3VycmVudCAmJiBjb25maWcuX19zZWxmICYmIFJlYWN0Q3VycmVudE93bmVyLmN1cnJlbnQuc3RhdGVOb2RlICE9PSBjb25maWcuX19zZWxmKSB7XG4gICAgICAgIHZhciBjb21wb25lbnROYW1lID0gZ2V0Q29tcG9uZW50TmFtZShSZWFjdEN1cnJlbnRPd25lci5jdXJyZW50LnR5cGUpO1xuXG4gICAgICAgIGlmICghZGlkV2FybkFib3V0U3RyaW5nUmVmc1tjb21wb25lbnROYW1lXSkge1xuICAgICAgICAgIGVycm9yKCdDb21wb25lbnQgXCIlc1wiIGNvbnRhaW5zIHRoZSBzdHJpbmcgcmVmIFwiJXNcIi4gJyArICdTdXBwb3J0IGZvciBzdHJpbmcgcmVmcyB3aWxsIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgbWFqb3IgcmVsZWFzZS4gJyArICdUaGlzIGNhc2UgY2Fubm90IGJlIGF1dG9tYXRpY2FsbHkgY29udmVydGVkIHRvIGFuIGFycm93IGZ1bmN0aW9uLiAnICsgJ1dlIGFzayB5b3UgdG8gbWFudWFsbHkgZml4IHRoaXMgY2FzZSBieSB1c2luZyB1c2VSZWYoKSBvciBjcmVhdGVSZWYoKSBpbnN0ZWFkLiAnICsgJ0xlYXJuIG1vcmUgYWJvdXQgdXNpbmcgcmVmcyBzYWZlbHkgaGVyZTogJyArICdodHRwczovL2ZiLm1lL3JlYWN0LXN0cmljdC1tb2RlLXN0cmluZy1yZWYnLCBnZXRDb21wb25lbnROYW1lKFJlYWN0Q3VycmVudE93bmVyLmN1cnJlbnQudHlwZSksIGNvbmZpZy5yZWYpO1xuXG4gICAgICAgICAgZGlkV2FybkFib3V0U3RyaW5nUmVmc1tjb21wb25lbnROYW1lXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhIG5ldyBSZWFjdCBlbGVtZW50LiBUaGlzIG5vIGxvbmdlciBhZGhlcmVzIHRvXG4gICAqIHRoZSBjbGFzcyBwYXR0ZXJuLCBzbyBkbyBub3QgdXNlIG5ldyB0byBjYWxsIGl0LiBBbHNvLCBpbnN0YW5jZW9mIGNoZWNrXG4gICAqIHdpbGwgbm90IHdvcmsuIEluc3RlYWQgdGVzdCAkJHR5cGVvZiBmaWVsZCBhZ2FpbnN0IFN5bWJvbC5mb3IoJ3JlYWN0LmVsZW1lbnQnKSB0byBjaGVja1xuICAgKiBpZiBzb21ldGhpbmcgaXMgYSBSZWFjdCBFbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0geyp9IHR5cGVcbiAgICogQHBhcmFtIHsqfSBwcm9wc1xuICAgKiBAcGFyYW0geyp9IGtleVxuICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IHJlZlxuICAgKiBAcGFyYW0geyp9IG93bmVyXG4gICAqIEBwYXJhbSB7Kn0gc2VsZiBBICp0ZW1wb3JhcnkqIGhlbHBlciB0byBkZXRlY3QgcGxhY2VzIHdoZXJlIGB0aGlzYCBpc1xuICAgKiBkaWZmZXJlbnQgZnJvbSB0aGUgYG93bmVyYCB3aGVuIFJlYWN0LmNyZWF0ZUVsZW1lbnQgaXMgY2FsbGVkLCBzbyB0aGF0IHdlXG4gICAqIGNhbiB3YXJuLiBXZSB3YW50IHRvIGdldCByaWQgb2Ygb3duZXIgYW5kIHJlcGxhY2Ugc3RyaW5nIGByZWZgcyB3aXRoIGFycm93XG4gICAqIGZ1bmN0aW9ucywgYW5kIGFzIGxvbmcgYXMgYHRoaXNgIGFuZCBvd25lciBhcmUgdGhlIHNhbWUsIHRoZXJlIHdpbGwgYmUgbm9cbiAgICogY2hhbmdlIGluIGJlaGF2aW9yLlxuICAgKiBAcGFyYW0geyp9IHNvdXJjZSBBbiBhbm5vdGF0aW9uIG9iamVjdCAoYWRkZWQgYnkgYSB0cmFuc3BpbGVyIG9yIG90aGVyd2lzZSlcbiAgICogaW5kaWNhdGluZyBmaWxlbmFtZSwgbGluZSBudW1iZXIsIGFuZC9vciBvdGhlciBpbmZvcm1hdGlvbi5cbiAgICogQGludGVybmFsXG4gICAqL1xuXG5cbiAgdmFyIFJlYWN0RWxlbWVudCA9IGZ1bmN0aW9uICh0eXBlLCBrZXksIHJlZiwgc2VsZiwgc291cmNlLCBvd25lciwgcHJvcHMpIHtcbiAgICB2YXIgZWxlbWVudCA9IHtcbiAgICAgIC8vIFRoaXMgdGFnIGFsbG93cyB1cyB0byB1bmlxdWVseSBpZGVudGlmeSB0aGlzIGFzIGEgUmVhY3QgRWxlbWVudFxuICAgICAgJCR0eXBlb2Y6IFJFQUNUX0VMRU1FTlRfVFlQRSxcbiAgICAgIC8vIEJ1aWx0LWluIHByb3BlcnRpZXMgdGhhdCBiZWxvbmcgb24gdGhlIGVsZW1lbnRcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBrZXk6IGtleSxcbiAgICAgIHJlZjogcmVmLFxuICAgICAgcHJvcHM6IHByb3BzLFxuICAgICAgLy8gUmVjb3JkIHRoZSBjb21wb25lbnQgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIHRoaXMgZWxlbWVudC5cbiAgICAgIF9vd25lcjogb3duZXJcbiAgICB9O1xuXG4gICAge1xuICAgICAgLy8gVGhlIHZhbGlkYXRpb24gZmxhZyBpcyBjdXJyZW50bHkgbXV0YXRpdmUuIFdlIHB1dCBpdCBvblxuICAgICAgLy8gYW4gZXh0ZXJuYWwgYmFja2luZyBzdG9yZSBzbyB0aGF0IHdlIGNhbiBmcmVlemUgdGhlIHdob2xlIG9iamVjdC5cbiAgICAgIC8vIFRoaXMgY2FuIGJlIHJlcGxhY2VkIHdpdGggYSBXZWFrTWFwIG9uY2UgdGhleSBhcmUgaW1wbGVtZW50ZWQgaW5cbiAgICAgIC8vIGNvbW1vbmx5IHVzZWQgZGV2ZWxvcG1lbnQgZW52aXJvbm1lbnRzLlxuICAgICAgZWxlbWVudC5fc3RvcmUgPSB7fTsgLy8gVG8gbWFrZSBjb21wYXJpbmcgUmVhY3RFbGVtZW50cyBlYXNpZXIgZm9yIHRlc3RpbmcgcHVycG9zZXMsIHdlIG1ha2VcbiAgICAgIC8vIHRoZSB2YWxpZGF0aW9uIGZsYWcgbm9uLWVudW1lcmFibGUgKHdoZXJlIHBvc3NpYmxlLCB3aGljaCBzaG91bGRcbiAgICAgIC8vIGluY2x1ZGUgZXZlcnkgZW52aXJvbm1lbnQgd2UgcnVuIHRlc3RzIGluKSwgc28gdGhlIHRlc3QgZnJhbWV3b3JrXG4gICAgICAvLyBpZ25vcmVzIGl0LlxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWxlbWVudC5fc3RvcmUsICd2YWxpZGF0ZWQnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9KTsgLy8gc2VsZiBhbmQgc291cmNlIGFyZSBERVYgb25seSBwcm9wZXJ0aWVzLlxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWxlbWVudCwgJ19zZWxmJywge1xuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogc2VsZlxuICAgICAgfSk7IC8vIFR3byBlbGVtZW50cyBjcmVhdGVkIGluIHR3byBkaWZmZXJlbnQgcGxhY2VzIHNob3VsZCBiZSBjb25zaWRlcmVkXG4gICAgICAvLyBlcXVhbCBmb3IgdGVzdGluZyBwdXJwb3NlcyBhbmQgdGhlcmVmb3JlIHdlIGhpZGUgaXQgZnJvbSBlbnVtZXJhdGlvbi5cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdfc291cmNlJywge1xuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogc291cmNlXG4gICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5mcmVlemUpIHtcbiAgICAgICAgT2JqZWN0LmZyZWV6ZShlbGVtZW50LnByb3BzKTtcbiAgICAgICAgT2JqZWN0LmZyZWV6ZShlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfTtcbiAgLyoqXG4gICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgbmV3IFJlYWN0RWxlbWVudCBvZiB0aGUgZ2l2ZW4gdHlwZS5cbiAgICogU2VlIGh0dHBzOi8vcmVhY3Rqcy5vcmcvZG9jcy9yZWFjdC1hcGkuaHRtbCNjcmVhdGVlbGVtZW50XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodHlwZSwgY29uZmlnLCBjaGlsZHJlbikge1xuICAgIHZhciBwcm9wTmFtZTsgLy8gUmVzZXJ2ZWQgbmFtZXMgYXJlIGV4dHJhY3RlZFxuXG4gICAgdmFyIHByb3BzID0ge307XG4gICAgdmFyIGtleSA9IG51bGw7XG4gICAgdmFyIHJlZiA9IG51bGw7XG4gICAgdmFyIHNlbGYgPSBudWxsO1xuICAgIHZhciBzb3VyY2UgPSBudWxsO1xuXG4gICAgaWYgKGNvbmZpZyAhPSBudWxsKSB7XG4gICAgICBpZiAoaGFzVmFsaWRSZWYoY29uZmlnKSkge1xuICAgICAgICByZWYgPSBjb25maWcucmVmO1xuXG4gICAgICAgIHtcbiAgICAgICAgICB3YXJuSWZTdHJpbmdSZWZDYW5ub3RCZUF1dG9Db252ZXJ0ZWQoY29uZmlnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaGFzVmFsaWRLZXkoY29uZmlnKSkge1xuICAgICAgICBrZXkgPSAnJyArIGNvbmZpZy5rZXk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYgPSBjb25maWcuX19zZWxmID09PSB1bmRlZmluZWQgPyBudWxsIDogY29uZmlnLl9fc2VsZjtcbiAgICAgIHNvdXJjZSA9IGNvbmZpZy5fX3NvdXJjZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGNvbmZpZy5fX3NvdXJjZTsgLy8gUmVtYWluaW5nIHByb3BlcnRpZXMgYXJlIGFkZGVkIHRvIGEgbmV3IHByb3BzIG9iamVjdFxuXG4gICAgICBmb3IgKHByb3BOYW1lIGluIGNvbmZpZykge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkkMS5jYWxsKGNvbmZpZywgcHJvcE5hbWUpICYmICFSRVNFUlZFRF9QUk9QUy5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpIHtcbiAgICAgICAgICBwcm9wc1twcm9wTmFtZV0gPSBjb25maWdbcHJvcE5hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSAvLyBDaGlsZHJlbiBjYW4gYmUgbW9yZSB0aGFuIG9uZSBhcmd1bWVudCwgYW5kIHRob3NlIGFyZSB0cmFuc2ZlcnJlZCBvbnRvXG4gICAgLy8gdGhlIG5ld2x5IGFsbG9jYXRlZCBwcm9wcyBvYmplY3QuXG5cblxuICAgIHZhciBjaGlsZHJlbkxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGggLSAyO1xuXG4gICAgaWYgKGNoaWxkcmVuTGVuZ3RoID09PSAxKSB7XG4gICAgICBwcm9wcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIH0gZWxzZSBpZiAoY2hpbGRyZW5MZW5ndGggPiAxKSB7XG4gICAgICB2YXIgY2hpbGRBcnJheSA9IEFycmF5KGNoaWxkcmVuTGVuZ3RoKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbkxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNoaWxkQXJyYXlbaV0gPSBhcmd1bWVudHNbaSArIDJdO1xuICAgICAgfVxuXG4gICAgICB7XG4gICAgICAgIGlmIChPYmplY3QuZnJlZXplKSB7XG4gICAgICAgICAgT2JqZWN0LmZyZWV6ZShjaGlsZEFycmF5KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9wcy5jaGlsZHJlbiA9IGNoaWxkQXJyYXk7XG4gICAgfSAvLyBSZXNvbHZlIGRlZmF1bHQgcHJvcHNcblxuXG4gICAgaWYgKHR5cGUgJiYgdHlwZS5kZWZhdWx0UHJvcHMpIHtcbiAgICAgIHZhciBkZWZhdWx0UHJvcHMgPSB0eXBlLmRlZmF1bHRQcm9wcztcblxuICAgICAgZm9yIChwcm9wTmFtZSBpbiBkZWZhdWx0UHJvcHMpIHtcbiAgICAgICAgaWYgKHByb3BzW3Byb3BOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcHJvcHNbcHJvcE5hbWVdID0gZGVmYXVsdFByb3BzW3Byb3BOYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHtcbiAgICAgIGlmIChrZXkgfHwgcmVmKSB7XG4gICAgICAgIHZhciBkaXNwbGF5TmFtZSA9IHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nID8gdHlwZS5kaXNwbGF5TmFtZSB8fCB0eXBlLm5hbWUgfHwgJ1Vua25vd24nIDogdHlwZTtcblxuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgZGVmaW5lS2V5UHJvcFdhcm5pbmdHZXR0ZXIocHJvcHMsIGRpc3BsYXlOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWYpIHtcbiAgICAgICAgICBkZWZpbmVSZWZQcm9wV2FybmluZ0dldHRlcihwcm9wcywgZGlzcGxheU5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFJlYWN0RWxlbWVudCh0eXBlLCBrZXksIHJlZiwgc2VsZiwgc291cmNlLCBSZWFjdEN1cnJlbnRPd25lci5jdXJyZW50LCBwcm9wcyk7XG4gIH1cbiAgZnVuY3Rpb24gY2xvbmVBbmRSZXBsYWNlS2V5KG9sZEVsZW1lbnQsIG5ld0tleSkge1xuICAgIHZhciBuZXdFbGVtZW50ID0gUmVhY3RFbGVtZW50KG9sZEVsZW1lbnQudHlwZSwgbmV3S2V5LCBvbGRFbGVtZW50LnJlZiwgb2xkRWxlbWVudC5fc2VsZiwgb2xkRWxlbWVudC5fc291cmNlLCBvbGRFbGVtZW50Ll9vd25lciwgb2xkRWxlbWVudC5wcm9wcyk7XG4gICAgcmV0dXJuIG5ld0VsZW1lbnQ7XG4gIH1cbiAgLyoqXG4gICAqIENsb25lIGFuZCByZXR1cm4gYSBuZXcgUmVhY3RFbGVtZW50IHVzaW5nIGVsZW1lbnQgYXMgdGhlIHN0YXJ0aW5nIHBvaW50LlxuICAgKiBTZWUgaHR0cHM6Ly9yZWFjdGpzLm9yZy9kb2NzL3JlYWN0LWFwaS5odG1sI2Nsb25lZWxlbWVudFxuICAgKi9cblxuICBmdW5jdGlvbiBjbG9uZUVsZW1lbnQoZWxlbWVudCwgY29uZmlnLCBjaGlsZHJlbikge1xuICAgIGlmICghIShlbGVtZW50ID09PSBudWxsIHx8IGVsZW1lbnQgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoIFwiUmVhY3QuY2xvbmVFbGVtZW50KC4uLik6IFRoZSBhcmd1bWVudCBtdXN0IGJlIGEgUmVhY3QgZWxlbWVudCwgYnV0IHlvdSBwYXNzZWQgXCIgKyBlbGVtZW50ICsgXCIuXCIgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJvcE5hbWU7IC8vIE9yaWdpbmFsIHByb3BzIGFyZSBjb3BpZWRcblxuICAgIHZhciBwcm9wcyA9IG9iamVjdEFzc2lnbih7fSwgZWxlbWVudC5wcm9wcyk7IC8vIFJlc2VydmVkIG5hbWVzIGFyZSBleHRyYWN0ZWRcblxuXG4gICAgdmFyIGtleSA9IGVsZW1lbnQua2V5O1xuICAgIHZhciByZWYgPSBlbGVtZW50LnJlZjsgLy8gU2VsZiBpcyBwcmVzZXJ2ZWQgc2luY2UgdGhlIG93bmVyIGlzIHByZXNlcnZlZC5cblxuICAgIHZhciBzZWxmID0gZWxlbWVudC5fc2VsZjsgLy8gU291cmNlIGlzIHByZXNlcnZlZCBzaW5jZSBjbG9uZUVsZW1lbnQgaXMgdW5saWtlbHkgdG8gYmUgdGFyZ2V0ZWQgYnkgYVxuICAgIC8vIHRyYW5zcGlsZXIsIGFuZCB0aGUgb3JpZ2luYWwgc291cmNlIGlzIHByb2JhYmx5IGEgYmV0dGVyIGluZGljYXRvciBvZiB0aGVcbiAgICAvLyB0cnVlIG93bmVyLlxuXG4gICAgdmFyIHNvdXJjZSA9IGVsZW1lbnQuX3NvdXJjZTsgLy8gT3duZXIgd2lsbCBiZSBwcmVzZXJ2ZWQsIHVubGVzcyByZWYgaXMgb3ZlcnJpZGRlblxuXG4gICAgdmFyIG93bmVyID0gZWxlbWVudC5fb3duZXI7XG5cbiAgICBpZiAoY29uZmlnICE9IG51bGwpIHtcbiAgICAgIGlmIChoYXNWYWxpZFJlZihjb25maWcpKSB7XG4gICAgICAgIC8vIFNpbGVudGx5IHN0ZWFsIHRoZSByZWYgZnJvbSB0aGUgcGFyZW50LlxuICAgICAgICByZWYgPSBjb25maWcucmVmO1xuICAgICAgICBvd25lciA9IFJlYWN0Q3VycmVudE93bmVyLmN1cnJlbnQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNWYWxpZEtleShjb25maWcpKSB7XG4gICAgICAgIGtleSA9ICcnICsgY29uZmlnLmtleTtcbiAgICAgIH0gLy8gUmVtYWluaW5nIHByb3BlcnRpZXMgb3ZlcnJpZGUgZXhpc3RpbmcgcHJvcHNcblxuXG4gICAgICB2YXIgZGVmYXVsdFByb3BzO1xuXG4gICAgICBpZiAoZWxlbWVudC50eXBlICYmIGVsZW1lbnQudHlwZS5kZWZhdWx0UHJvcHMpIHtcbiAgICAgICAgZGVmYXVsdFByb3BzID0gZWxlbWVudC50eXBlLmRlZmF1bHRQcm9wcztcbiAgICAgIH1cblxuICAgICAgZm9yIChwcm9wTmFtZSBpbiBjb25maWcpIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5JDEuY2FsbChjb25maWcsIHByb3BOYW1lKSAmJiAhUkVTRVJWRURfUFJPUFMuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpKSB7XG4gICAgICAgICAgaWYgKGNvbmZpZ1twcm9wTmFtZV0gPT09IHVuZGVmaW5lZCAmJiBkZWZhdWx0UHJvcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gUmVzb2x2ZSBkZWZhdWx0IHByb3BzXG4gICAgICAgICAgICBwcm9wc1twcm9wTmFtZV0gPSBkZWZhdWx0UHJvcHNbcHJvcE5hbWVdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9wc1twcm9wTmFtZV0gPSBjb25maWdbcHJvcE5hbWVdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gLy8gQ2hpbGRyZW4gY2FuIGJlIG1vcmUgdGhhbiBvbmUgYXJndW1lbnQsIGFuZCB0aG9zZSBhcmUgdHJhbnNmZXJyZWQgb250b1xuICAgIC8vIHRoZSBuZXdseSBhbGxvY2F0ZWQgcHJvcHMgb2JqZWN0LlxuXG5cbiAgICB2YXIgY2hpbGRyZW5MZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoIC0gMjtcblxuICAgIGlmIChjaGlsZHJlbkxlbmd0aCA9PT0gMSkge1xuICAgICAgcHJvcHMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB9IGVsc2UgaWYgKGNoaWxkcmVuTGVuZ3RoID4gMSkge1xuICAgICAgdmFyIGNoaWxkQXJyYXkgPSBBcnJheShjaGlsZHJlbkxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW5MZW5ndGg7IGkrKykge1xuICAgICAgICBjaGlsZEFycmF5W2ldID0gYXJndW1lbnRzW2kgKyAyXTtcbiAgICAgIH1cblxuICAgICAgcHJvcHMuY2hpbGRyZW4gPSBjaGlsZEFycmF5O1xuICAgIH1cblxuICAgIHJldHVybiBSZWFjdEVsZW1lbnQoZWxlbWVudC50eXBlLCBrZXksIHJlZiwgc2VsZiwgc291cmNlLCBvd25lciwgcHJvcHMpO1xuICB9XG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGUgb2JqZWN0IGlzIGEgUmVhY3RFbGVtZW50LlxuICAgKiBTZWUgaHR0cHM6Ly9yZWFjdGpzLm9yZy9kb2NzL3JlYWN0LWFwaS5odG1sI2lzdmFsaWRlbGVtZW50XG4gICAqIEBwYXJhbSB7P29iamVjdH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgYG9iamVjdGAgaXMgYSBSZWFjdEVsZW1lbnQuXG4gICAqIEBmaW5hbFxuICAgKi9cblxuICBmdW5jdGlvbiBpc1ZhbGlkRWxlbWVudChvYmplY3QpIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0ICE9PSBudWxsICYmIG9iamVjdC4kJHR5cGVvZiA9PT0gUkVBQ1RfRUxFTUVOVF9UWVBFO1xuICB9XG5cbiAgdmFyIFNFUEFSQVRPUiA9ICcuJztcbiAgdmFyIFNVQlNFUEFSQVRPUiA9ICc6JztcbiAgLyoqXG4gICAqIEVzY2FwZSBhbmQgd3JhcCBrZXkgc28gaXQgaXMgc2FmZSB0byB1c2UgYXMgYSByZWFjdGlkXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgdG8gYmUgZXNjYXBlZC5cbiAgICogQHJldHVybiB7c3RyaW5nfSB0aGUgZXNjYXBlZCBrZXkuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGVzY2FwZShrZXkpIHtcbiAgICB2YXIgZXNjYXBlUmVnZXggPSAvWz06XS9nO1xuICAgIHZhciBlc2NhcGVyTG9va3VwID0ge1xuICAgICAgJz0nOiAnPTAnLFxuICAgICAgJzonOiAnPTInXG4gICAgfTtcbiAgICB2YXIgZXNjYXBlZFN0cmluZyA9ICgnJyArIGtleSkucmVwbGFjZShlc2NhcGVSZWdleCwgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICByZXR1cm4gZXNjYXBlckxvb2t1cFttYXRjaF07XG4gICAgfSk7XG4gICAgcmV0dXJuICckJyArIGVzY2FwZWRTdHJpbmc7XG4gIH1cbiAgLyoqXG4gICAqIFRPRE86IFRlc3QgdGhhdCBhIHNpbmdsZSBjaGlsZCBhbmQgYW4gYXJyYXkgd2l0aCBvbmUgaXRlbSBoYXZlIHRoZSBzYW1lIGtleVxuICAgKiBwYXR0ZXJuLlxuICAgKi9cblxuXG4gIHZhciBkaWRXYXJuQWJvdXRNYXBzID0gZmFsc2U7XG4gIHZhciB1c2VyUHJvdmlkZWRLZXlFc2NhcGVSZWdleCA9IC9cXC8rL2c7XG5cbiAgZnVuY3Rpb24gZXNjYXBlVXNlclByb3ZpZGVkS2V5KHRleHQpIHtcbiAgICByZXR1cm4gKCcnICsgdGV4dCkucmVwbGFjZSh1c2VyUHJvdmlkZWRLZXlFc2NhcGVSZWdleCwgJyQmLycpO1xuICB9XG5cbiAgdmFyIFBPT0xfU0laRSA9IDEwO1xuICB2YXIgdHJhdmVyc2VDb250ZXh0UG9vbCA9IFtdO1xuXG4gIGZ1bmN0aW9uIGdldFBvb2xlZFRyYXZlcnNlQ29udGV4dChtYXBSZXN1bHQsIGtleVByZWZpeCwgbWFwRnVuY3Rpb24sIG1hcENvbnRleHQpIHtcbiAgICBpZiAodHJhdmVyc2VDb250ZXh0UG9vbC5sZW5ndGgpIHtcbiAgICAgIHZhciB0cmF2ZXJzZUNvbnRleHQgPSB0cmF2ZXJzZUNvbnRleHRQb29sLnBvcCgpO1xuICAgICAgdHJhdmVyc2VDb250ZXh0LnJlc3VsdCA9IG1hcFJlc3VsdDtcbiAgICAgIHRyYXZlcnNlQ29udGV4dC5rZXlQcmVmaXggPSBrZXlQcmVmaXg7XG4gICAgICB0cmF2ZXJzZUNvbnRleHQuZnVuYyA9IG1hcEZ1bmN0aW9uO1xuICAgICAgdHJhdmVyc2VDb250ZXh0LmNvbnRleHQgPSBtYXBDb250ZXh0O1xuICAgICAgdHJhdmVyc2VDb250ZXh0LmNvdW50ID0gMDtcbiAgICAgIHJldHVybiB0cmF2ZXJzZUNvbnRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlc3VsdDogbWFwUmVzdWx0LFxuICAgICAgICBrZXlQcmVmaXg6IGtleVByZWZpeCxcbiAgICAgICAgZnVuYzogbWFwRnVuY3Rpb24sXG4gICAgICAgIGNvbnRleHQ6IG1hcENvbnRleHQsXG4gICAgICAgIGNvdW50OiAwXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbGVhc2VUcmF2ZXJzZUNvbnRleHQodHJhdmVyc2VDb250ZXh0KSB7XG4gICAgdHJhdmVyc2VDb250ZXh0LnJlc3VsdCA9IG51bGw7XG4gICAgdHJhdmVyc2VDb250ZXh0LmtleVByZWZpeCA9IG51bGw7XG4gICAgdHJhdmVyc2VDb250ZXh0LmZ1bmMgPSBudWxsO1xuICAgIHRyYXZlcnNlQ29udGV4dC5jb250ZXh0ID0gbnVsbDtcbiAgICB0cmF2ZXJzZUNvbnRleHQuY291bnQgPSAwO1xuXG4gICAgaWYgKHRyYXZlcnNlQ29udGV4dFBvb2wubGVuZ3RoIDwgUE9PTF9TSVpFKSB7XG4gICAgICB0cmF2ZXJzZUNvbnRleHRQb29sLnB1c2godHJhdmVyc2VDb250ZXh0KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7Pyp9IGNoaWxkcmVuIENoaWxkcmVuIHRyZWUgY29udGFpbmVyLlxuICAgKiBAcGFyYW0geyFzdHJpbmd9IG5hbWVTb0ZhciBOYW1lIG9mIHRoZSBrZXkgcGF0aCBzbyBmYXIuXG4gICAqIEBwYXJhbSB7IWZ1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBpbnZva2Ugd2l0aCBlYWNoIGNoaWxkIGZvdW5kLlxuICAgKiBAcGFyYW0gez8qfSB0cmF2ZXJzZUNvbnRleHQgVXNlZCB0byBwYXNzIGluZm9ybWF0aW9uIHRocm91Z2hvdXQgdGhlIHRyYXZlcnNhbFxuICAgKiBwcm9jZXNzLlxuICAgKiBAcmV0dXJuIHshbnVtYmVyfSBUaGUgbnVtYmVyIG9mIGNoaWxkcmVuIGluIHRoaXMgc3VidHJlZS5cbiAgICovXG5cblxuICBmdW5jdGlvbiB0cmF2ZXJzZUFsbENoaWxkcmVuSW1wbChjaGlsZHJlbiwgbmFtZVNvRmFyLCBjYWxsYmFjaywgdHJhdmVyc2VDb250ZXh0KSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgY2hpbGRyZW47XG5cbiAgICBpZiAodHlwZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAvLyBBbGwgb2YgdGhlIGFib3ZlIGFyZSBwZXJjZWl2ZWQgYXMgbnVsbC5cbiAgICAgIGNoaWxkcmVuID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgaW52b2tlQ2FsbGJhY2sgPSBmYWxzZTtcblxuICAgIGlmIChjaGlsZHJlbiA9PT0gbnVsbCkge1xuICAgICAgaW52b2tlQ2FsbGJhY2sgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICBpbnZva2VDYWxsYmFjayA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICBzd2l0Y2ggKGNoaWxkcmVuLiQkdHlwZW9mKSB7XG4gICAgICAgICAgICBjYXNlIFJFQUNUX0VMRU1FTlRfVFlQRTpcbiAgICAgICAgICAgIGNhc2UgUkVBQ1RfUE9SVEFMX1RZUEU6XG4gICAgICAgICAgICAgIGludm9rZUNhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW52b2tlQ2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKHRyYXZlcnNlQ29udGV4dCwgY2hpbGRyZW4sIC8vIElmIGl0J3MgdGhlIG9ubHkgY2hpbGQsIHRyZWF0IHRoZSBuYW1lIGFzIGlmIGl0IHdhcyB3cmFwcGVkIGluIGFuIGFycmF5XG4gICAgICAvLyBzbyB0aGF0IGl0J3MgY29uc2lzdGVudCBpZiB0aGUgbnVtYmVyIG9mIGNoaWxkcmVuIGdyb3dzLlxuICAgICAgbmFtZVNvRmFyID09PSAnJyA/IFNFUEFSQVRPUiArIGdldENvbXBvbmVudEtleShjaGlsZHJlbiwgMCkgOiBuYW1lU29GYXIpO1xuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgdmFyIGNoaWxkO1xuICAgIHZhciBuZXh0TmFtZTtcbiAgICB2YXIgc3VidHJlZUNvdW50ID0gMDsgLy8gQ291bnQgb2YgY2hpbGRyZW4gZm91bmQgaW4gdGhlIGN1cnJlbnQgc3VidHJlZS5cblxuICAgIHZhciBuZXh0TmFtZVByZWZpeCA9IG5hbWVTb0ZhciA9PT0gJycgPyBTRVBBUkFUT1IgOiBuYW1lU29GYXIgKyBTVUJTRVBBUkFUT1I7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgbmV4dE5hbWUgPSBuZXh0TmFtZVByZWZpeCArIGdldENvbXBvbmVudEtleShjaGlsZCwgaSk7XG4gICAgICAgIHN1YnRyZWVDb3VudCArPSB0cmF2ZXJzZUFsbENoaWxkcmVuSW1wbChjaGlsZCwgbmV4dE5hbWUsIGNhbGxiYWNrLCB0cmF2ZXJzZUNvbnRleHQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaXRlcmF0b3JGbiA9IGdldEl0ZXJhdG9yRm4oY2hpbGRyZW4pO1xuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhdG9yRm4gPT09ICdmdW5jdGlvbicpIHtcblxuICAgICAgICB7XG4gICAgICAgICAgLy8gV2FybiBhYm91dCB1c2luZyBNYXBzIGFzIGNoaWxkcmVuXG4gICAgICAgICAgaWYgKGl0ZXJhdG9yRm4gPT09IGNoaWxkcmVuLmVudHJpZXMpIHtcbiAgICAgICAgICAgIGlmICghZGlkV2FybkFib3V0TWFwcykge1xuICAgICAgICAgICAgICB3YXJuKCdVc2luZyBNYXBzIGFzIGNoaWxkcmVuIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiAnICsgJ2EgZnV0dXJlIG1ham9yIHJlbGVhc2UuIENvbnNpZGVyIGNvbnZlcnRpbmcgY2hpbGRyZW4gdG8gJyArICdhbiBhcnJheSBvZiBrZXllZCBSZWFjdEVsZW1lbnRzIGluc3RlYWQuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRpZFdhcm5BYm91dE1hcHMgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpdGVyYXRvciA9IGl0ZXJhdG9yRm4uY2FsbChjaGlsZHJlbik7XG4gICAgICAgIHZhciBzdGVwO1xuICAgICAgICB2YXIgaWkgPSAwO1xuXG4gICAgICAgIHdoaWxlICghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpIHtcbiAgICAgICAgICBjaGlsZCA9IHN0ZXAudmFsdWU7XG4gICAgICAgICAgbmV4dE5hbWUgPSBuZXh0TmFtZVByZWZpeCArIGdldENvbXBvbmVudEtleShjaGlsZCwgaWkrKyk7XG4gICAgICAgICAgc3VidHJlZUNvdW50ICs9IHRyYXZlcnNlQWxsQ2hpbGRyZW5JbXBsKGNoaWxkLCBuZXh0TmFtZSwgY2FsbGJhY2ssIHRyYXZlcnNlQ29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdmFyIGFkZGVuZHVtID0gJyc7XG5cbiAgICAgICAge1xuICAgICAgICAgIGFkZGVuZHVtID0gJyBJZiB5b3UgbWVhbnQgdG8gcmVuZGVyIGEgY29sbGVjdGlvbiBvZiBjaGlsZHJlbiwgdXNlIGFuIGFycmF5ICcgKyAnaW5zdGVhZC4nICsgUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZS5nZXRTdGFja0FkZGVuZHVtKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2hpbGRyZW5TdHJpbmcgPSAnJyArIGNoaWxkcmVuO1xuXG4gICAgICAgIHtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvciggXCJPYmplY3RzIGFyZSBub3QgdmFsaWQgYXMgYSBSZWFjdCBjaGlsZCAoZm91bmQ6IFwiICsgKGNoaWxkcmVuU3RyaW5nID09PSAnW29iamVjdCBPYmplY3RdJyA/ICdvYmplY3Qgd2l0aCBrZXlzIHsnICsgT2JqZWN0LmtleXMoY2hpbGRyZW4pLmpvaW4oJywgJykgKyAnfScgOiBjaGlsZHJlblN0cmluZykgKyBcIikuXCIgKyBhZGRlbmR1bSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdWJ0cmVlQ291bnQ7XG4gIH1cbiAgLyoqXG4gICAqIFRyYXZlcnNlcyBjaGlsZHJlbiB0aGF0IGFyZSB0eXBpY2FsbHkgc3BlY2lmaWVkIGFzIGBwcm9wcy5jaGlsZHJlbmAsIGJ1dFxuICAgKiBtaWdodCBhbHNvIGJlIHNwZWNpZmllZCB0aHJvdWdoIGF0dHJpYnV0ZXM6XG4gICAqXG4gICAqIC0gYHRyYXZlcnNlQWxsQ2hpbGRyZW4odGhpcy5wcm9wcy5jaGlsZHJlbiwgLi4uKWBcbiAgICogLSBgdHJhdmVyc2VBbGxDaGlsZHJlbih0aGlzLnByb3BzLmxlZnRQYW5lbENoaWxkcmVuLCAuLi4pYFxuICAgKlxuICAgKiBUaGUgYHRyYXZlcnNlQ29udGV4dGAgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgdGhhdCBpcyBwYXNzZWQgdGhyb3VnaCB0aGVcbiAgICogZW50aXJlIHRyYXZlcnNhbC4gSXQgY2FuIGJlIHVzZWQgdG8gc3RvcmUgYWNjdW11bGF0aW9ucyBvciBhbnl0aGluZyBlbHNlIHRoYXRcbiAgICogdGhlIGNhbGxiYWNrIG1pZ2h0IGZpbmQgcmVsZXZhbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7Pyp9IGNoaWxkcmVuIENoaWxkcmVuIHRyZWUgb2JqZWN0LlxuICAgKiBAcGFyYW0geyFmdW5jdGlvbn0gY2FsbGJhY2sgVG8gaW52b2tlIHVwb24gdHJhdmVyc2luZyBlYWNoIGNoaWxkLlxuICAgKiBAcGFyYW0gez8qfSB0cmF2ZXJzZUNvbnRleHQgQ29udGV4dCBmb3IgdHJhdmVyc2FsLlxuICAgKiBAcmV0dXJuIHshbnVtYmVyfSBUaGUgbnVtYmVyIG9mIGNoaWxkcmVuIGluIHRoaXMgc3VidHJlZS5cbiAgICovXG5cblxuICBmdW5jdGlvbiB0cmF2ZXJzZUFsbENoaWxkcmVuKGNoaWxkcmVuLCBjYWxsYmFjaywgdHJhdmVyc2VDb250ZXh0KSB7XG4gICAgaWYgKGNoaWxkcmVuID09IG51bGwpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHJldHVybiB0cmF2ZXJzZUFsbENoaWxkcmVuSW1wbChjaGlsZHJlbiwgJycsIGNhbGxiYWNrLCB0cmF2ZXJzZUNvbnRleHQpO1xuICB9XG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIGtleSBzdHJpbmcgdGhhdCBpZGVudGlmaWVzIGEgY29tcG9uZW50IHdpdGhpbiBhIHNldC5cbiAgICpcbiAgICogQHBhcmFtIHsqfSBjb21wb25lbnQgQSBjb21wb25lbnQgdGhhdCBjb3VsZCBjb250YWluIGEgbWFudWFsIGtleS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IEluZGV4IHRoYXQgaXMgdXNlZCBpZiBhIG1hbnVhbCBrZXkgaXMgbm90IHByb3ZpZGVkLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gZ2V0Q29tcG9uZW50S2V5KGNvbXBvbmVudCwgaW5kZXgpIHtcbiAgICAvLyBEbyBzb21lIHR5cGVjaGVja2luZyBoZXJlIHNpbmNlIHdlIGNhbGwgdGhpcyBibGluZGx5LiBXZSB3YW50IHRvIGVuc3VyZVxuICAgIC8vIHRoYXQgd2UgZG9uJ3QgYmxvY2sgcG90ZW50aWFsIGZ1dHVyZSBFUyBBUElzLlxuICAgIGlmICh0eXBlb2YgY29tcG9uZW50ID09PSAnb2JqZWN0JyAmJiBjb21wb25lbnQgIT09IG51bGwgJiYgY29tcG9uZW50LmtleSAhPSBudWxsKSB7XG4gICAgICAvLyBFeHBsaWNpdCBrZXlcbiAgICAgIHJldHVybiBlc2NhcGUoY29tcG9uZW50LmtleSk7XG4gICAgfSAvLyBJbXBsaWNpdCBrZXkgZGV0ZXJtaW5lZCBieSB0aGUgaW5kZXggaW4gdGhlIHNldFxuXG5cbiAgICByZXR1cm4gaW5kZXgudG9TdHJpbmcoMzYpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9yRWFjaFNpbmdsZUNoaWxkKGJvb2tLZWVwaW5nLCBjaGlsZCwgbmFtZSkge1xuICAgIHZhciBmdW5jID0gYm9va0tlZXBpbmcuZnVuYyxcbiAgICAgICAgY29udGV4dCA9IGJvb2tLZWVwaW5nLmNvbnRleHQ7XG4gICAgZnVuYy5jYWxsKGNvbnRleHQsIGNoaWxkLCBib29rS2VlcGluZy5jb3VudCsrKTtcbiAgfVxuICAvKipcbiAgICogSXRlcmF0ZXMgdGhyb3VnaCBjaGlsZHJlbiB0aGF0IGFyZSB0eXBpY2FsbHkgc3BlY2lmaWVkIGFzIGBwcm9wcy5jaGlsZHJlbmAuXG4gICAqXG4gICAqIFNlZSBodHRwczovL3JlYWN0anMub3JnL2RvY3MvcmVhY3QtYXBpLmh0bWwjcmVhY3RjaGlsZHJlbmZvcmVhY2hcbiAgICpcbiAgICogVGhlIHByb3ZpZGVkIGZvckVhY2hGdW5jKGNoaWxkLCBpbmRleCkgd2lsbCBiZSBjYWxsZWQgZm9yIGVhY2hcbiAgICogbGVhZiBjaGlsZC5cbiAgICpcbiAgICogQHBhcmFtIHs/Kn0gY2hpbGRyZW4gQ2hpbGRyZW4gdHJlZSBjb250YWluZXIuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKiwgaW50KX0gZm9yRWFjaEZ1bmNcbiAgICogQHBhcmFtIHsqfSBmb3JFYWNoQ29udGV4dCBDb250ZXh0IGZvciBmb3JFYWNoQ29udGV4dC5cbiAgICovXG5cblxuICBmdW5jdGlvbiBmb3JFYWNoQ2hpbGRyZW4oY2hpbGRyZW4sIGZvckVhY2hGdW5jLCBmb3JFYWNoQ29udGV4dCkge1xuICAgIGlmIChjaGlsZHJlbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gY2hpbGRyZW47XG4gICAgfVxuXG4gICAgdmFyIHRyYXZlcnNlQ29udGV4dCA9IGdldFBvb2xlZFRyYXZlcnNlQ29udGV4dChudWxsLCBudWxsLCBmb3JFYWNoRnVuYywgZm9yRWFjaENvbnRleHQpO1xuICAgIHRyYXZlcnNlQWxsQ2hpbGRyZW4oY2hpbGRyZW4sIGZvckVhY2hTaW5nbGVDaGlsZCwgdHJhdmVyc2VDb250ZXh0KTtcbiAgICByZWxlYXNlVHJhdmVyc2VDb250ZXh0KHRyYXZlcnNlQ29udGV4dCk7XG4gIH1cblxuICBmdW5jdGlvbiBtYXBTaW5nbGVDaGlsZEludG9Db250ZXh0KGJvb2tLZWVwaW5nLCBjaGlsZCwgY2hpbGRLZXkpIHtcbiAgICB2YXIgcmVzdWx0ID0gYm9va0tlZXBpbmcucmVzdWx0LFxuICAgICAgICBrZXlQcmVmaXggPSBib29rS2VlcGluZy5rZXlQcmVmaXgsXG4gICAgICAgIGZ1bmMgPSBib29rS2VlcGluZy5mdW5jLFxuICAgICAgICBjb250ZXh0ID0gYm9va0tlZXBpbmcuY29udGV4dDtcbiAgICB2YXIgbWFwcGVkQ2hpbGQgPSBmdW5jLmNhbGwoY29udGV4dCwgY2hpbGQsIGJvb2tLZWVwaW5nLmNvdW50KyspO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWFwcGVkQ2hpbGQpKSB7XG4gICAgICBtYXBJbnRvV2l0aEtleVByZWZpeEludGVybmFsKG1hcHBlZENoaWxkLCByZXN1bHQsIGNoaWxkS2V5LCBmdW5jdGlvbiAoYykge1xuICAgICAgICByZXR1cm4gYztcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAobWFwcGVkQ2hpbGQgIT0gbnVsbCkge1xuICAgICAgaWYgKGlzVmFsaWRFbGVtZW50KG1hcHBlZENoaWxkKSkge1xuICAgICAgICBtYXBwZWRDaGlsZCA9IGNsb25lQW5kUmVwbGFjZUtleShtYXBwZWRDaGlsZCwgLy8gS2VlcCBib3RoIHRoZSAobWFwcGVkKSBhbmQgb2xkIGtleXMgaWYgdGhleSBkaWZmZXIsIGp1c3QgYXNcbiAgICAgICAgLy8gdHJhdmVyc2VBbGxDaGlsZHJlbiB1c2VkIHRvIGRvIGZvciBvYmplY3RzIGFzIGNoaWxkcmVuXG4gICAgICAgIGtleVByZWZpeCArIChtYXBwZWRDaGlsZC5rZXkgJiYgKCFjaGlsZCB8fCBjaGlsZC5rZXkgIT09IG1hcHBlZENoaWxkLmtleSkgPyBlc2NhcGVVc2VyUHJvdmlkZWRLZXkobWFwcGVkQ2hpbGQua2V5KSArICcvJyA6ICcnKSArIGNoaWxkS2V5KTtcbiAgICAgIH1cblxuICAgICAgcmVzdWx0LnB1c2gobWFwcGVkQ2hpbGQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1hcEludG9XaXRoS2V5UHJlZml4SW50ZXJuYWwoY2hpbGRyZW4sIGFycmF5LCBwcmVmaXgsIGZ1bmMsIGNvbnRleHQpIHtcbiAgICB2YXIgZXNjYXBlZFByZWZpeCA9ICcnO1xuXG4gICAgaWYgKHByZWZpeCAhPSBudWxsKSB7XG4gICAgICBlc2NhcGVkUHJlZml4ID0gZXNjYXBlVXNlclByb3ZpZGVkS2V5KHByZWZpeCkgKyAnLyc7XG4gICAgfVxuXG4gICAgdmFyIHRyYXZlcnNlQ29udGV4dCA9IGdldFBvb2xlZFRyYXZlcnNlQ29udGV4dChhcnJheSwgZXNjYXBlZFByZWZpeCwgZnVuYywgY29udGV4dCk7XG4gICAgdHJhdmVyc2VBbGxDaGlsZHJlbihjaGlsZHJlbiwgbWFwU2luZ2xlQ2hpbGRJbnRvQ29udGV4dCwgdHJhdmVyc2VDb250ZXh0KTtcbiAgICByZWxlYXNlVHJhdmVyc2VDb250ZXh0KHRyYXZlcnNlQ29udGV4dCk7XG4gIH1cbiAgLyoqXG4gICAqIE1hcHMgY2hpbGRyZW4gdGhhdCBhcmUgdHlwaWNhbGx5IHNwZWNpZmllZCBhcyBgcHJvcHMuY2hpbGRyZW5gLlxuICAgKlxuICAgKiBTZWUgaHR0cHM6Ly9yZWFjdGpzLm9yZy9kb2NzL3JlYWN0LWFwaS5odG1sI3JlYWN0Y2hpbGRyZW5tYXBcbiAgICpcbiAgICogVGhlIHByb3ZpZGVkIG1hcEZ1bmN0aW9uKGNoaWxkLCBrZXksIGluZGV4KSB3aWxsIGJlIGNhbGxlZCBmb3IgZWFjaFxuICAgKiBsZWFmIGNoaWxkLlxuICAgKlxuICAgKiBAcGFyYW0gez8qfSBjaGlsZHJlbiBDaGlsZHJlbiB0cmVlIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIHtmdW5jdGlvbigqLCBpbnQpfSBmdW5jIFRoZSBtYXAgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7Kn0gY29udGV4dCBDb250ZXh0IGZvciBtYXBGdW5jdGlvbi5cbiAgICogQHJldHVybiB7b2JqZWN0fSBPYmplY3QgY29udGFpbmluZyB0aGUgb3JkZXJlZCBtYXAgb2YgcmVzdWx0cy5cbiAgICovXG5cblxuICBmdW5jdGlvbiBtYXBDaGlsZHJlbihjaGlsZHJlbiwgZnVuYywgY29udGV4dCkge1xuICAgIGlmIChjaGlsZHJlbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gY2hpbGRyZW47XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIG1hcEludG9XaXRoS2V5UHJlZml4SW50ZXJuYWwoY2hpbGRyZW4sIHJlc3VsdCwgbnVsbCwgZnVuYywgY29udGV4dCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICAvKipcbiAgICogQ291bnQgdGhlIG51bWJlciBvZiBjaGlsZHJlbiB0aGF0IGFyZSB0eXBpY2FsbHkgc3BlY2lmaWVkIGFzXG4gICAqIGBwcm9wcy5jaGlsZHJlbmAuXG4gICAqXG4gICAqIFNlZSBodHRwczovL3JlYWN0anMub3JnL2RvY3MvcmVhY3QtYXBpLmh0bWwjcmVhY3RjaGlsZHJlbmNvdW50XG4gICAqXG4gICAqIEBwYXJhbSB7Pyp9IGNoaWxkcmVuIENoaWxkcmVuIHRyZWUgY29udGFpbmVyLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBudW1iZXIgb2YgY2hpbGRyZW4uXG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gY291bnRDaGlsZHJlbihjaGlsZHJlbikge1xuICAgIHJldHVybiB0cmF2ZXJzZUFsbENoaWxkcmVuKGNoaWxkcmVuLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LCBudWxsKTtcbiAgfVxuICAvKipcbiAgICogRmxhdHRlbiBhIGNoaWxkcmVuIG9iamVjdCAodHlwaWNhbGx5IHNwZWNpZmllZCBhcyBgcHJvcHMuY2hpbGRyZW5gKSBhbmRcbiAgICogcmV0dXJuIGFuIGFycmF5IHdpdGggYXBwcm9wcmlhdGVseSByZS1rZXllZCBjaGlsZHJlbi5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vcmVhY3Rqcy5vcmcvZG9jcy9yZWFjdC1hcGkuaHRtbCNyZWFjdGNoaWxkcmVudG9hcnJheVxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIHRvQXJyYXkoY2hpbGRyZW4pIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgbWFwSW50b1dpdGhLZXlQcmVmaXhJbnRlcm5hbChjaGlsZHJlbiwgcmVzdWx0LCBudWxsLCBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBjaGlsZCBpbiBhIGNvbGxlY3Rpb24gb2YgY2hpbGRyZW4gYW5kIHZlcmlmaWVzIHRoYXQgdGhlcmVcbiAgICogaXMgb25seSBvbmUgY2hpbGQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gICAqXG4gICAqIFNlZSBodHRwczovL3JlYWN0anMub3JnL2RvY3MvcmVhY3QtYXBpLmh0bWwjcmVhY3RjaGlsZHJlbm9ubHlcbiAgICpcbiAgICogVGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgYSBzaW5nbGUgY2hpbGQgZ2V0c1xuICAgKiBwYXNzZWQgd2l0aG91dCBhIHdyYXBwZXIsIGJ1dCB0aGUgcHVycG9zZSBvZiB0aGlzIGhlbHBlciBmdW5jdGlvbiBpcyB0b1xuICAgKiBhYnN0cmFjdCBhd2F5IHRoZSBwYXJ0aWN1bGFyIHN0cnVjdHVyZSBvZiBjaGlsZHJlbi5cbiAgICpcbiAgICogQHBhcmFtIHs/b2JqZWN0fSBjaGlsZHJlbiBDaGlsZCBjb2xsZWN0aW9uIHN0cnVjdHVyZS5cbiAgICogQHJldHVybiB7UmVhY3RFbGVtZW50fSBUaGUgZmlyc3QgYW5kIG9ubHkgYFJlYWN0RWxlbWVudGAgY29udGFpbmVkIGluIHRoZVxuICAgKiBzdHJ1Y3R1cmUuXG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gb25seUNoaWxkKGNoaWxkcmVuKSB7XG4gICAgaWYgKCFpc1ZhbGlkRWxlbWVudChjaGlsZHJlbikpIHtcbiAgICAgIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoIFwiUmVhY3QuQ2hpbGRyZW4ub25seSBleHBlY3RlZCB0byByZWNlaXZlIGEgc2luZ2xlIFJlYWN0IGVsZW1lbnQgY2hpbGQuXCIgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGRyZW47XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDb250ZXh0KGRlZmF1bHRWYWx1ZSwgY2FsY3VsYXRlQ2hhbmdlZEJpdHMpIHtcbiAgICBpZiAoY2FsY3VsYXRlQ2hhbmdlZEJpdHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY2FsY3VsYXRlQ2hhbmdlZEJpdHMgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB7XG4gICAgICAgIGlmIChjYWxjdWxhdGVDaGFuZ2VkQml0cyAhPT0gbnVsbCAmJiB0eXBlb2YgY2FsY3VsYXRlQ2hhbmdlZEJpdHMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBlcnJvcignY3JlYXRlQ29udGV4dDogRXhwZWN0ZWQgdGhlIG9wdGlvbmFsIHNlY29uZCBhcmd1bWVudCB0byBiZSBhICcgKyAnZnVuY3Rpb24uIEluc3RlYWQgcmVjZWl2ZWQ6ICVzJywgY2FsY3VsYXRlQ2hhbmdlZEJpdHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGNvbnRleHQgPSB7XG4gICAgICAkJHR5cGVvZjogUkVBQ1RfQ09OVEVYVF9UWVBFLFxuICAgICAgX2NhbGN1bGF0ZUNoYW5nZWRCaXRzOiBjYWxjdWxhdGVDaGFuZ2VkQml0cyxcbiAgICAgIC8vIEFzIGEgd29ya2Fyb3VuZCB0byBzdXBwb3J0IG11bHRpcGxlIGNvbmN1cnJlbnQgcmVuZGVyZXJzLCB3ZSBjYXRlZ29yaXplXG4gICAgICAvLyBzb21lIHJlbmRlcmVycyBhcyBwcmltYXJ5IGFuZCBvdGhlcnMgYXMgc2Vjb25kYXJ5LiBXZSBvbmx5IGV4cGVjdFxuICAgICAgLy8gdGhlcmUgdG8gYmUgdHdvIGNvbmN1cnJlbnQgcmVuZGVyZXJzIGF0IG1vc3Q6IFJlYWN0IE5hdGl2ZSAocHJpbWFyeSkgYW5kXG4gICAgICAvLyBGYWJyaWMgKHNlY29uZGFyeSk7IFJlYWN0IERPTSAocHJpbWFyeSkgYW5kIFJlYWN0IEFSVCAoc2Vjb25kYXJ5KS5cbiAgICAgIC8vIFNlY29uZGFyeSByZW5kZXJlcnMgc3RvcmUgdGhlaXIgY29udGV4dCB2YWx1ZXMgb24gc2VwYXJhdGUgZmllbGRzLlxuICAgICAgX2N1cnJlbnRWYWx1ZTogZGVmYXVsdFZhbHVlLFxuICAgICAgX2N1cnJlbnRWYWx1ZTI6IGRlZmF1bHRWYWx1ZSxcbiAgICAgIC8vIFVzZWQgdG8gdHJhY2sgaG93IG1hbnkgY29uY3VycmVudCByZW5kZXJlcnMgdGhpcyBjb250ZXh0IGN1cnJlbnRseVxuICAgICAgLy8gc3VwcG9ydHMgd2l0aGluIGluIGEgc2luZ2xlIHJlbmRlcmVyLiBTdWNoIGFzIHBhcmFsbGVsIHNlcnZlciByZW5kZXJpbmcuXG4gICAgICBfdGhyZWFkQ291bnQ6IDAsXG4gICAgICAvLyBUaGVzZSBhcmUgY2lyY3VsYXJcbiAgICAgIFByb3ZpZGVyOiBudWxsLFxuICAgICAgQ29uc3VtZXI6IG51bGxcbiAgICB9O1xuICAgIGNvbnRleHQuUHJvdmlkZXIgPSB7XG4gICAgICAkJHR5cGVvZjogUkVBQ1RfUFJPVklERVJfVFlQRSxcbiAgICAgIF9jb250ZXh0OiBjb250ZXh0XG4gICAgfTtcbiAgICB2YXIgaGFzV2FybmVkQWJvdXRVc2luZ05lc3RlZENvbnRleHRDb25zdW1lcnMgPSBmYWxzZTtcbiAgICB2YXIgaGFzV2FybmVkQWJvdXRVc2luZ0NvbnN1bWVyUHJvdmlkZXIgPSBmYWxzZTtcblxuICAgIHtcbiAgICAgIC8vIEEgc2VwYXJhdGUgb2JqZWN0LCBidXQgcHJveGllcyBiYWNrIHRvIHRoZSBvcmlnaW5hbCBjb250ZXh0IG9iamVjdCBmb3JcbiAgICAgIC8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LiBJdCBoYXMgYSBkaWZmZXJlbnQgJCR0eXBlb2YsIHNvIHdlIGNhbiBwcm9wZXJseVxuICAgICAgLy8gd2FybiBmb3IgdGhlIGluY29ycmVjdCB1c2FnZSBvZiBDb250ZXh0IGFzIGEgQ29uc3VtZXIuXG4gICAgICB2YXIgQ29uc3VtZXIgPSB7XG4gICAgICAgICQkdHlwZW9mOiBSRUFDVF9DT05URVhUX1RZUEUsXG4gICAgICAgIF9jb250ZXh0OiBjb250ZXh0LFxuICAgICAgICBfY2FsY3VsYXRlQ2hhbmdlZEJpdHM6IGNvbnRleHQuX2NhbGN1bGF0ZUNoYW5nZWRCaXRzXG4gICAgICB9OyAvLyAkRmxvd0ZpeE1lOiBGbG93IGNvbXBsYWlucyBhYm91dCBub3Qgc2V0dGluZyBhIHZhbHVlLCB3aGljaCBpcyBpbnRlbnRpb25hbCBoZXJlXG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKENvbnN1bWVyLCB7XG4gICAgICAgIFByb3ZpZGVyOiB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWhhc1dhcm5lZEFib3V0VXNpbmdDb25zdW1lclByb3ZpZGVyKSB7XG4gICAgICAgICAgICAgIGhhc1dhcm5lZEFib3V0VXNpbmdDb25zdW1lclByb3ZpZGVyID0gdHJ1ZTtcblxuICAgICAgICAgICAgICBlcnJvcignUmVuZGVyaW5nIDxDb250ZXh0LkNvbnN1bWVyLlByb3ZpZGVyPiBpcyBub3Qgc3VwcG9ydGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gJyArICdhIGZ1dHVyZSBtYWpvciByZWxlYXNlLiBEaWQgeW91IG1lYW4gdG8gcmVuZGVyIDxDb250ZXh0LlByb3ZpZGVyPiBpbnN0ZWFkPycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5Qcm92aWRlcjtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24gKF9Qcm92aWRlcikge1xuICAgICAgICAgICAgY29udGV4dC5Qcm92aWRlciA9IF9Qcm92aWRlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9jdXJyZW50VmFsdWU6IHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0Ll9jdXJyZW50VmFsdWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChfY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICBjb250ZXh0Ll9jdXJyZW50VmFsdWUgPSBfY3VycmVudFZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX2N1cnJlbnRWYWx1ZTI6IHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0Ll9jdXJyZW50VmFsdWUyO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbiAoX2N1cnJlbnRWYWx1ZTIpIHtcbiAgICAgICAgICAgIGNvbnRleHQuX2N1cnJlbnRWYWx1ZTIgPSBfY3VycmVudFZhbHVlMjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF90aHJlYWRDb3VudDoge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQuX3RocmVhZENvdW50O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbiAoX3RocmVhZENvdW50KSB7XG4gICAgICAgICAgICBjb250ZXh0Ll90aHJlYWRDb3VudCA9IF90aHJlYWRDb3VudDtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIENvbnN1bWVyOiB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWhhc1dhcm5lZEFib3V0VXNpbmdOZXN0ZWRDb250ZXh0Q29uc3VtZXJzKSB7XG4gICAgICAgICAgICAgIGhhc1dhcm5lZEFib3V0VXNpbmdOZXN0ZWRDb250ZXh0Q29uc3VtZXJzID0gdHJ1ZTtcblxuICAgICAgICAgICAgICBlcnJvcignUmVuZGVyaW5nIDxDb250ZXh0LkNvbnN1bWVyLkNvbnN1bWVyPiBpcyBub3Qgc3VwcG9ydGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gJyArICdhIGZ1dHVyZSBtYWpvciByZWxlYXNlLiBEaWQgeW91IG1lYW4gdG8gcmVuZGVyIDxDb250ZXh0LkNvbnN1bWVyPiBpbnN0ZWFkPycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5Db25zdW1lcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pOyAvLyAkRmxvd0ZpeE1lOiBGbG93IGNvbXBsYWlucyBhYm91dCBtaXNzaW5nIHByb3BlcnRpZXMgYmVjYXVzZSBpdCBkb2Vzbid0IHVuZGVyc3RhbmQgZGVmaW5lUHJvcGVydHlcblxuICAgICAgY29udGV4dC5Db25zdW1lciA9IENvbnN1bWVyO1xuICAgIH1cblxuICAgIHtcbiAgICAgIGNvbnRleHQuX2N1cnJlbnRSZW5kZXJlciA9IG51bGw7XG4gICAgICBjb250ZXh0Ll9jdXJyZW50UmVuZGVyZXIyID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGV4dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxhenkoY3Rvcikge1xuICAgIHZhciBsYXp5VHlwZSA9IHtcbiAgICAgICQkdHlwZW9mOiBSRUFDVF9MQVpZX1RZUEUsXG4gICAgICBfY3RvcjogY3RvcixcbiAgICAgIC8vIFJlYWN0IHVzZXMgdGhlc2UgZmllbGRzIHRvIHN0b3JlIHRoZSByZXN1bHQuXG4gICAgICBfc3RhdHVzOiAtMSxcbiAgICAgIF9yZXN1bHQ6IG51bGxcbiAgICB9O1xuXG4gICAge1xuICAgICAgLy8gSW4gcHJvZHVjdGlvbiwgdGhpcyB3b3VsZCBqdXN0IHNldCBpdCBvbiB0aGUgb2JqZWN0LlxuICAgICAgdmFyIGRlZmF1bHRQcm9wcztcbiAgICAgIHZhciBwcm9wVHlwZXM7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhsYXp5VHlwZSwge1xuICAgICAgICBkZWZhdWx0UHJvcHM6IHtcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdFByb3BzO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbiAobmV3RGVmYXVsdFByb3BzKSB7XG4gICAgICAgICAgICBlcnJvcignUmVhY3QubGF6eSguLi4pOiBJdCBpcyBub3Qgc3VwcG9ydGVkIHRvIGFzc2lnbiBgZGVmYXVsdFByb3BzYCB0byAnICsgJ2EgbGF6eSBjb21wb25lbnQgaW1wb3J0LiBFaXRoZXIgc3BlY2lmeSB0aGVtIHdoZXJlIHRoZSBjb21wb25lbnQgJyArICdpcyBkZWZpbmVkLCBvciBjcmVhdGUgYSB3cmFwcGluZyBjb21wb25lbnQgYXJvdW5kIGl0LicpO1xuXG4gICAgICAgICAgICBkZWZhdWx0UHJvcHMgPSBuZXdEZWZhdWx0UHJvcHM7IC8vIE1hdGNoIHByb2R1Y3Rpb24gYmVoYXZpb3IgbW9yZSBjbG9zZWx5OlxuXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobGF6eVR5cGUsICdkZWZhdWx0UHJvcHMnLCB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcFR5cGVzOiB7XG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BUeXBlcztcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24gKG5ld1Byb3BUeXBlcykge1xuICAgICAgICAgICAgZXJyb3IoJ1JlYWN0LmxhenkoLi4uKTogSXQgaXMgbm90IHN1cHBvcnRlZCB0byBhc3NpZ24gYHByb3BUeXBlc2AgdG8gJyArICdhIGxhenkgY29tcG9uZW50IGltcG9ydC4gRWl0aGVyIHNwZWNpZnkgdGhlbSB3aGVyZSB0aGUgY29tcG9uZW50ICcgKyAnaXMgZGVmaW5lZCwgb3IgY3JlYXRlIGEgd3JhcHBpbmcgY29tcG9uZW50IGFyb3VuZCBpdC4nKTtcblxuICAgICAgICAgICAgcHJvcFR5cGVzID0gbmV3UHJvcFR5cGVzOyAvLyBNYXRjaCBwcm9kdWN0aW9uIGJlaGF2aW9yIG1vcmUgY2xvc2VseTpcblxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxhenlUeXBlLCAncHJvcFR5cGVzJywge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBsYXp5VHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcndhcmRSZWYocmVuZGVyKSB7XG4gICAge1xuICAgICAgaWYgKHJlbmRlciAhPSBudWxsICYmIHJlbmRlci4kJHR5cGVvZiA9PT0gUkVBQ1RfTUVNT19UWVBFKSB7XG4gICAgICAgIGVycm9yKCdmb3J3YXJkUmVmIHJlcXVpcmVzIGEgcmVuZGVyIGZ1bmN0aW9uIGJ1dCByZWNlaXZlZCBhIGBtZW1vYCAnICsgJ2NvbXBvbmVudC4gSW5zdGVhZCBvZiBmb3J3YXJkUmVmKG1lbW8oLi4uKSksIHVzZSAnICsgJ21lbW8oZm9yd2FyZFJlZiguLi4pKS4nKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlbmRlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBlcnJvcignZm9yd2FyZFJlZiByZXF1aXJlcyBhIHJlbmRlciBmdW5jdGlvbiBidXQgd2FzIGdpdmVuICVzLicsIHJlbmRlciA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZiByZW5kZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlbmRlci5sZW5ndGggIT09IDAgJiYgcmVuZGVyLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgIGVycm9yKCdmb3J3YXJkUmVmIHJlbmRlciBmdW5jdGlvbnMgYWNjZXB0IGV4YWN0bHkgdHdvIHBhcmFtZXRlcnM6IHByb3BzIGFuZCByZWYuICVzJywgcmVuZGVyLmxlbmd0aCA9PT0gMSA/ICdEaWQgeW91IGZvcmdldCB0byB1c2UgdGhlIHJlZiBwYXJhbWV0ZXI/JyA6ICdBbnkgYWRkaXRpb25hbCBwYXJhbWV0ZXIgd2lsbCBiZSB1bmRlZmluZWQuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHJlbmRlciAhPSBudWxsKSB7XG4gICAgICAgIGlmIChyZW5kZXIuZGVmYXVsdFByb3BzICE9IG51bGwgfHwgcmVuZGVyLnByb3BUeXBlcyAhPSBudWxsKSB7XG4gICAgICAgICAgZXJyb3IoJ2ZvcndhcmRSZWYgcmVuZGVyIGZ1bmN0aW9ucyBkbyBub3Qgc3VwcG9ydCBwcm9wVHlwZXMgb3IgZGVmYXVsdFByb3BzLiAnICsgJ0RpZCB5b3UgYWNjaWRlbnRhbGx5IHBhc3MgYSBSZWFjdCBjb21wb25lbnQ/Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgJCR0eXBlb2Y6IFJFQUNUX0ZPUldBUkRfUkVGX1RZUEUsXG4gICAgICByZW5kZXI6IHJlbmRlclxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBpc1ZhbGlkRWxlbWVudFR5cGUodHlwZSkge1xuICAgIHJldHVybiB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgLy8gTm90ZTogaXRzIHR5cGVvZiBtaWdodCBiZSBvdGhlciB0aGFuICdzeW1ib2wnIG9yICdudW1iZXInIGlmIGl0J3MgYSBwb2x5ZmlsbC5cbiAgICB0eXBlID09PSBSRUFDVF9GUkFHTUVOVF9UWVBFIHx8IHR5cGUgPT09IFJFQUNUX0NPTkNVUlJFTlRfTU9ERV9UWVBFIHx8IHR5cGUgPT09IFJFQUNUX1BST0ZJTEVSX1RZUEUgfHwgdHlwZSA9PT0gUkVBQ1RfU1RSSUNUX01PREVfVFlQRSB8fCB0eXBlID09PSBSRUFDVF9TVVNQRU5TRV9UWVBFIHx8IHR5cGUgPT09IFJFQUNUX1NVU1BFTlNFX0xJU1RfVFlQRSB8fCB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgJiYgdHlwZSAhPT0gbnVsbCAmJiAodHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfTEFaWV9UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX01FTU9fVFlQRSB8fCB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9QUk9WSURFUl9UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0NPTlRFWFRfVFlQRSB8fCB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0ZVTkRBTUVOVEFMX1RZUEUgfHwgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfUkVTUE9OREVSX1RZUEUgfHwgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfU0NPUEVfVFlQRSB8fCB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9CTE9DS19UWVBFKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lbW8odHlwZSwgY29tcGFyZSkge1xuICAgIHtcbiAgICAgIGlmICghaXNWYWxpZEVsZW1lbnRUeXBlKHR5cGUpKSB7XG4gICAgICAgIGVycm9yKCdtZW1vOiBUaGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIGNvbXBvbmVudC4gSW5zdGVhZCAnICsgJ3JlY2VpdmVkOiAlcycsIHR5cGUgPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YgdHlwZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICQkdHlwZW9mOiBSRUFDVF9NRU1PX1RZUEUsXG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgY29tcGFyZTogY29tcGFyZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGNvbXBhcmVcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZURpc3BhdGNoZXIoKSB7XG4gICAgdmFyIGRpc3BhdGNoZXIgPSBSZWFjdEN1cnJlbnREaXNwYXRjaGVyLmN1cnJlbnQ7XG5cbiAgICBpZiAoIShkaXNwYXRjaGVyICE9PSBudWxsKSkge1xuICAgICAge1xuICAgICAgICB0aHJvdyBFcnJvciggXCJJbnZhbGlkIGhvb2sgY2FsbC4gSG9va3MgY2FuIG9ubHkgYmUgY2FsbGVkIGluc2lkZSBvZiB0aGUgYm9keSBvZiBhIGZ1bmN0aW9uIGNvbXBvbmVudC4gVGhpcyBjb3VsZCBoYXBwZW4gZm9yIG9uZSBvZiB0aGUgZm9sbG93aW5nIHJlYXNvbnM6XFxuMS4gWW91IG1pZ2h0IGhhdmUgbWlzbWF0Y2hpbmcgdmVyc2lvbnMgb2YgUmVhY3QgYW5kIHRoZSByZW5kZXJlciAoc3VjaCBhcyBSZWFjdCBET00pXFxuMi4gWW91IG1pZ2h0IGJlIGJyZWFraW5nIHRoZSBSdWxlcyBvZiBIb29rc1xcbjMuIFlvdSBtaWdodCBoYXZlIG1vcmUgdGhhbiBvbmUgY29weSBvZiBSZWFjdCBpbiB0aGUgc2FtZSBhcHBcXG5TZWUgaHR0cHM6Ly9mYi5tZS9yZWFjdC1pbnZhbGlkLWhvb2stY2FsbCBmb3IgdGlwcyBhYm91dCBob3cgdG8gZGVidWcgYW5kIGZpeCB0aGlzIHByb2JsZW0uXCIgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlzcGF0Y2hlcjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVzZUNvbnRleHQoQ29udGV4dCwgdW5zdGFibGVfb2JzZXJ2ZWRCaXRzKSB7XG4gICAgdmFyIGRpc3BhdGNoZXIgPSByZXNvbHZlRGlzcGF0Y2hlcigpO1xuXG4gICAge1xuICAgICAgaWYgKHVuc3RhYmxlX29ic2VydmVkQml0cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVycm9yKCd1c2VDb250ZXh0KCkgc2Vjb25kIGFyZ3VtZW50IGlzIHJlc2VydmVkIGZvciBmdXR1cmUgJyArICd1c2UgaW4gUmVhY3QuIFBhc3NpbmcgaXQgaXMgbm90IHN1cHBvcnRlZC4gJyArICdZb3UgcGFzc2VkOiAlcy4lcycsIHVuc3RhYmxlX29ic2VydmVkQml0cywgdHlwZW9mIHVuc3RhYmxlX29ic2VydmVkQml0cyA9PT0gJ251bWJlcicgJiYgQXJyYXkuaXNBcnJheShhcmd1bWVudHNbMl0pID8gJ1xcblxcbkRpZCB5b3UgY2FsbCBhcnJheS5tYXAodXNlQ29udGV4dCk/ICcgKyAnQ2FsbGluZyBIb29rcyBpbnNpZGUgYSBsb29wIGlzIG5vdCBzdXBwb3J0ZWQuICcgKyAnTGVhcm4gbW9yZSBhdCBodHRwczovL2ZiLm1lL3J1bGVzLW9mLWhvb2tzJyA6ICcnKTtcbiAgICAgIH0gLy8gVE9ETzogYWRkIGEgbW9yZSBnZW5lcmljIHdhcm5pbmcgZm9yIGludmFsaWQgdmFsdWVzLlxuXG5cbiAgICAgIGlmIChDb250ZXh0Ll9jb250ZXh0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIHJlYWxDb250ZXh0ID0gQ29udGV4dC5fY29udGV4dDsgLy8gRG9uJ3QgZGVkdXBsaWNhdGUgYmVjYXVzZSB0aGlzIGxlZ2l0aW1hdGVseSBjYXVzZXMgYnVnc1xuICAgICAgICAvLyBhbmQgbm9ib2R5IHNob3VsZCBiZSB1c2luZyB0aGlzIGluIGV4aXN0aW5nIGNvZGUuXG5cbiAgICAgICAgaWYgKHJlYWxDb250ZXh0LkNvbnN1bWVyID09PSBDb250ZXh0KSB7XG4gICAgICAgICAgZXJyb3IoJ0NhbGxpbmcgdXNlQ29udGV4dChDb250ZXh0LkNvbnN1bWVyKSBpcyBub3Qgc3VwcG9ydGVkLCBtYXkgY2F1c2UgYnVncywgYW5kIHdpbGwgYmUgJyArICdyZW1vdmVkIGluIGEgZnV0dXJlIG1ham9yIHJlbGVhc2UuIERpZCB5b3UgbWVhbiB0byBjYWxsIHVzZUNvbnRleHQoQ29udGV4dCkgaW5zdGVhZD8nKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZWFsQ29udGV4dC5Qcm92aWRlciA9PT0gQ29udGV4dCkge1xuICAgICAgICAgIGVycm9yKCdDYWxsaW5nIHVzZUNvbnRleHQoQ29udGV4dC5Qcm92aWRlcikgaXMgbm90IHN1cHBvcnRlZC4gJyArICdEaWQgeW91IG1lYW4gdG8gY2FsbCB1c2VDb250ZXh0KENvbnRleHQpIGluc3RlYWQ/Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlzcGF0Y2hlci51c2VDb250ZXh0KENvbnRleHQsIHVuc3RhYmxlX29ic2VydmVkQml0cyk7XG4gIH1cbiAgZnVuY3Rpb24gdXNlU3RhdGUoaW5pdGlhbFN0YXRlKSB7XG4gICAgdmFyIGRpc3BhdGNoZXIgPSByZXNvbHZlRGlzcGF0Y2hlcigpO1xuICAgIHJldHVybiBkaXNwYXRjaGVyLnVzZVN0YXRlKGluaXRpYWxTdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gdXNlUmVkdWNlcihyZWR1Y2VyLCBpbml0aWFsQXJnLCBpbml0KSB7XG4gICAgdmFyIGRpc3BhdGNoZXIgPSByZXNvbHZlRGlzcGF0Y2hlcigpO1xuICAgIHJldHVybiBkaXNwYXRjaGVyLnVzZVJlZHVjZXIocmVkdWNlciwgaW5pdGlhbEFyZywgaW5pdCk7XG4gIH1cbiAgZnVuY3Rpb24gdXNlUmVmKGluaXRpYWxWYWx1ZSkge1xuICAgIHZhciBkaXNwYXRjaGVyID0gcmVzb2x2ZURpc3BhdGNoZXIoKTtcbiAgICByZXR1cm4gZGlzcGF0Y2hlci51c2VSZWYoaW5pdGlhbFZhbHVlKTtcbiAgfVxuICBmdW5jdGlvbiB1c2VFZmZlY3QoY3JlYXRlLCBkZXBzKSB7XG4gICAgdmFyIGRpc3BhdGNoZXIgPSByZXNvbHZlRGlzcGF0Y2hlcigpO1xuICAgIHJldHVybiBkaXNwYXRjaGVyLnVzZUVmZmVjdChjcmVhdGUsIGRlcHMpO1xuICB9XG4gIGZ1bmN0aW9uIHVzZUxheW91dEVmZmVjdChjcmVhdGUsIGRlcHMpIHtcbiAgICB2YXIgZGlzcGF0Y2hlciA9IHJlc29sdmVEaXNwYXRjaGVyKCk7XG4gICAgcmV0dXJuIGRpc3BhdGNoZXIudXNlTGF5b3V0RWZmZWN0KGNyZWF0ZSwgZGVwcyk7XG4gIH1cbiAgZnVuY3Rpb24gdXNlQ2FsbGJhY2soY2FsbGJhY2ssIGRlcHMpIHtcbiAgICB2YXIgZGlzcGF0Y2hlciA9IHJlc29sdmVEaXNwYXRjaGVyKCk7XG4gICAgcmV0dXJuIGRpc3BhdGNoZXIudXNlQ2FsbGJhY2soY2FsbGJhY2ssIGRlcHMpO1xuICB9XG4gIGZ1bmN0aW9uIHVzZU1lbW8oY3JlYXRlLCBkZXBzKSB7XG4gICAgdmFyIGRpc3BhdGNoZXIgPSByZXNvbHZlRGlzcGF0Y2hlcigpO1xuICAgIHJldHVybiBkaXNwYXRjaGVyLnVzZU1lbW8oY3JlYXRlLCBkZXBzKTtcbiAgfVxuICBmdW5jdGlvbiB1c2VJbXBlcmF0aXZlSGFuZGxlKHJlZiwgY3JlYXRlLCBkZXBzKSB7XG4gICAgdmFyIGRpc3BhdGNoZXIgPSByZXNvbHZlRGlzcGF0Y2hlcigpO1xuICAgIHJldHVybiBkaXNwYXRjaGVyLnVzZUltcGVyYXRpdmVIYW5kbGUocmVmLCBjcmVhdGUsIGRlcHMpO1xuICB9XG4gIGZ1bmN0aW9uIHVzZURlYnVnVmFsdWUodmFsdWUsIGZvcm1hdHRlckZuKSB7XG4gICAge1xuICAgICAgdmFyIGRpc3BhdGNoZXIgPSByZXNvbHZlRGlzcGF0Y2hlcigpO1xuICAgICAgcmV0dXJuIGRpc3BhdGNoZXIudXNlRGVidWdWYWx1ZSh2YWx1ZSwgZm9ybWF0dGVyRm4pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb3B5cmlnaHQgKGMpIDIwMTMtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAgICpcbiAgICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gICAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAgICovXG5cbiAgdmFyIFJlYWN0UHJvcFR5cGVzU2VjcmV0ID0gJ1NFQ1JFVF9ET19OT1RfUEFTU19USElTX09SX1lPVV9XSUxMX0JFX0ZJUkVEJztcblxuICB2YXIgUmVhY3RQcm9wVHlwZXNTZWNyZXRfMSA9IFJlYWN0UHJvcFR5cGVzU2VjcmV0O1xuXG4gIHZhciBwcmludFdhcm5pbmckMSA9IGZ1bmN0aW9uKCkge307XG5cbiAge1xuICAgIHZhciBSZWFjdFByb3BUeXBlc1NlY3JldCQxID0gUmVhY3RQcm9wVHlwZXNTZWNyZXRfMTtcbiAgICB2YXIgbG9nZ2VkVHlwZUZhaWx1cmVzID0ge307XG4gICAgdmFyIGhhcyA9IEZ1bmN0aW9uLmNhbGwuYmluZChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcblxuICAgIHByaW50V2FybmluZyQxID0gZnVuY3Rpb24odGV4dCkge1xuICAgICAgdmFyIG1lc3NhZ2UgPSAnV2FybmluZzogJyArIHRleHQ7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICAvLyAtLS0gV2VsY29tZSB0byBkZWJ1Z2dpbmcgUmVhY3QgLS0tXG4gICAgICAgIC8vIFRoaXMgZXJyb3Igd2FzIHRocm93biBhcyBhIGNvbnZlbmllbmNlIHNvIHRoYXQgeW91IGNhbiB1c2UgdGhpcyBzdGFja1xuICAgICAgICAvLyB0byBmaW5kIHRoZSBjYWxsc2l0ZSB0aGF0IGNhdXNlZCB0aGlzIHdhcm5pbmcgdG8gZmlyZS5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoeCkge31cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGF0IHRoZSB2YWx1ZXMgbWF0Y2ggd2l0aCB0aGUgdHlwZSBzcGVjcy5cbiAgICogRXJyb3IgbWVzc2FnZXMgYXJlIG1lbW9yaXplZCBhbmQgd2lsbCBvbmx5IGJlIHNob3duIG9uY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSB0eXBlU3BlY3MgTWFwIG9mIG5hbWUgdG8gYSBSZWFjdFByb3BUeXBlXG4gICAqIEBwYXJhbSB7b2JqZWN0fSB2YWx1ZXMgUnVudGltZSB2YWx1ZXMgdGhhdCBuZWVkIHRvIGJlIHR5cGUtY2hlY2tlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYXRpb24gZS5nLiBcInByb3BcIiwgXCJjb250ZXh0XCIsIFwiY2hpbGQgY29udGV4dFwiXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb21wb25lbnROYW1lIE5hbWUgb2YgdGhlIGNvbXBvbmVudCBmb3IgZXJyb3IgbWVzc2FnZXMuXG4gICAqIEBwYXJhbSB7P0Z1bmN0aW9ufSBnZXRTdGFjayBSZXR1cm5zIHRoZSBjb21wb25lbnQgc3RhY2suXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBjaGVja1Byb3BUeXBlcyh0eXBlU3BlY3MsIHZhbHVlcywgbG9jYXRpb24sIGNvbXBvbmVudE5hbWUsIGdldFN0YWNrKSB7XG4gICAge1xuICAgICAgZm9yICh2YXIgdHlwZVNwZWNOYW1lIGluIHR5cGVTcGVjcykge1xuICAgICAgICBpZiAoaGFzKHR5cGVTcGVjcywgdHlwZVNwZWNOYW1lKSkge1xuICAgICAgICAgIHZhciBlcnJvcjtcbiAgICAgICAgICAvLyBQcm9wIHR5cGUgdmFsaWRhdGlvbiBtYXkgdGhyb3cuIEluIGNhc2UgdGhleSBkbywgd2UgZG9uJ3Qgd2FudCB0b1xuICAgICAgICAgIC8vIGZhaWwgdGhlIHJlbmRlciBwaGFzZSB3aGVyZSBpdCBkaWRuJ3QgZmFpbCBiZWZvcmUuIFNvIHdlIGxvZyBpdC5cbiAgICAgICAgICAvLyBBZnRlciB0aGVzZSBoYXZlIGJlZW4gY2xlYW5lZCB1cCwgd2UnbGwgbGV0IHRoZW0gdGhyb3cuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgaW50ZW50aW9uYWxseSBhbiBpbnZhcmlhbnQgdGhhdCBnZXRzIGNhdWdodC4gSXQncyB0aGUgc2FtZVxuICAgICAgICAgICAgLy8gYmVoYXZpb3IgYXMgd2l0aG91dCB0aGlzIHN0YXRlbWVudCBleGNlcHQgd2l0aCBhIGJldHRlciBtZXNzYWdlLlxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0eXBlU3BlY3NbdHlwZVNwZWNOYW1lXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICB2YXIgZXJyID0gRXJyb3IoXG4gICAgICAgICAgICAgICAgKGNvbXBvbmVudE5hbWUgfHwgJ1JlYWN0IGNsYXNzJykgKyAnOiAnICsgbG9jYXRpb24gKyAnIHR5cGUgYCcgKyB0eXBlU3BlY05hbWUgKyAnYCBpcyBpbnZhbGlkOyAnICtcbiAgICAgICAgICAgICAgICAnaXQgbXVzdCBiZSBhIGZ1bmN0aW9uLCB1c3VhbGx5IGZyb20gdGhlIGBwcm9wLXR5cGVzYCBwYWNrYWdlLCBidXQgcmVjZWl2ZWQgYCcgKyB0eXBlb2YgdHlwZVNwZWNzW3R5cGVTcGVjTmFtZV0gKyAnYC4nXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGVyci5uYW1lID0gJ0ludmFyaWFudCBWaW9sYXRpb24nO1xuICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlcnJvciA9IHR5cGVTcGVjc1t0eXBlU3BlY05hbWVdKHZhbHVlcywgdHlwZVNwZWNOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgbnVsbCwgUmVhY3RQcm9wVHlwZXNTZWNyZXQkMSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGVycm9yID0gZXg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlcnJvciAmJiAhKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpKSB7XG4gICAgICAgICAgICBwcmludFdhcm5pbmckMShcbiAgICAgICAgICAgICAgKGNvbXBvbmVudE5hbWUgfHwgJ1JlYWN0IGNsYXNzJykgKyAnOiB0eXBlIHNwZWNpZmljYXRpb24gb2YgJyArXG4gICAgICAgICAgICAgIGxvY2F0aW9uICsgJyBgJyArIHR5cGVTcGVjTmFtZSArICdgIGlzIGludmFsaWQ7IHRoZSB0eXBlIGNoZWNrZXIgJyArXG4gICAgICAgICAgICAgICdmdW5jdGlvbiBtdXN0IHJldHVybiBgbnVsbGAgb3IgYW4gYEVycm9yYCBidXQgcmV0dXJuZWQgYSAnICsgdHlwZW9mIGVycm9yICsgJy4gJyArXG4gICAgICAgICAgICAgICdZb3UgbWF5IGhhdmUgZm9yZ290dGVuIHRvIHBhc3MgYW4gYXJndW1lbnQgdG8gdGhlIHR5cGUgY2hlY2tlciAnICtcbiAgICAgICAgICAgICAgJ2NyZWF0b3IgKGFycmF5T2YsIGluc3RhbmNlT2YsIG9iamVjdE9mLCBvbmVPZiwgb25lT2ZUeXBlLCBhbmQgJyArXG4gICAgICAgICAgICAgICdzaGFwZSBhbGwgcmVxdWlyZSBhbiBhcmd1bWVudCkuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgIShlcnJvci5tZXNzYWdlIGluIGxvZ2dlZFR5cGVGYWlsdXJlcykpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgbW9uaXRvciB0aGlzIGZhaWx1cmUgb25jZSBiZWNhdXNlIHRoZXJlIHRlbmRzIHRvIGJlIGEgbG90IG9mIHRoZVxuICAgICAgICAgICAgLy8gc2FtZSBlcnJvci5cbiAgICAgICAgICAgIGxvZ2dlZFR5cGVGYWlsdXJlc1tlcnJvci5tZXNzYWdlXSA9IHRydWU7XG5cbiAgICAgICAgICAgIHZhciBzdGFjayA9IGdldFN0YWNrID8gZ2V0U3RhY2soKSA6ICcnO1xuXG4gICAgICAgICAgICBwcmludFdhcm5pbmckMShcbiAgICAgICAgICAgICAgJ0ZhaWxlZCAnICsgbG9jYXRpb24gKyAnIHR5cGU6ICcgKyBlcnJvci5tZXNzYWdlICsgKHN0YWNrICE9IG51bGwgPyBzdGFjayA6ICcnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHdhcm5pbmcgY2FjaGUgd2hlbiB0ZXN0aW5nLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tQcm9wVHlwZXMucmVzZXRXYXJuaW5nQ2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgICB7XG4gICAgICBsb2dnZWRUeXBlRmFpbHVyZXMgPSB7fTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNoZWNrUHJvcFR5cGVzXzEgPSBjaGVja1Byb3BUeXBlcztcblxuICB2YXIgcHJvcFR5cGVzTWlzc3BlbGxXYXJuaW5nU2hvd247XG5cbiAge1xuICAgIHByb3BUeXBlc01pc3NwZWxsV2FybmluZ1Nob3duID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBnZXREZWNsYXJhdGlvbkVycm9yQWRkZW5kdW0oKSB7XG4gICAgaWYgKFJlYWN0Q3VycmVudE93bmVyLmN1cnJlbnQpIHtcbiAgICAgIHZhciBuYW1lID0gZ2V0Q29tcG9uZW50TmFtZShSZWFjdEN1cnJlbnRPd25lci5jdXJyZW50LnR5cGUpO1xuXG4gICAgICBpZiAobmFtZSkge1xuICAgICAgICByZXR1cm4gJ1xcblxcbkNoZWNrIHRoZSByZW5kZXIgbWV0aG9kIG9mIGAnICsgbmFtZSArICdgLic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U291cmNlSW5mb0Vycm9yQWRkZW5kdW0oc291cmNlKSB7XG4gICAgaWYgKHNvdXJjZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgZmlsZU5hbWUgPSBzb3VyY2UuZmlsZU5hbWUucmVwbGFjZSgvXi4qW1xcXFxcXC9dLywgJycpO1xuICAgICAgdmFyIGxpbmVOdW1iZXIgPSBzb3VyY2UubGluZU51bWJlcjtcbiAgICAgIHJldHVybiAnXFxuXFxuQ2hlY2sgeW91ciBjb2RlIGF0ICcgKyBmaWxlTmFtZSArICc6JyArIGxpbmVOdW1iZXIgKyAnLic7XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U291cmNlSW5mb0Vycm9yQWRkZW5kdW1Gb3JQcm9wcyhlbGVtZW50UHJvcHMpIHtcbiAgICBpZiAoZWxlbWVudFByb3BzICE9PSBudWxsICYmIGVsZW1lbnRQcm9wcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZ2V0U291cmNlSW5mb0Vycm9yQWRkZW5kdW0oZWxlbWVudFByb3BzLl9fc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgLyoqXG4gICAqIFdhcm4gaWYgdGhlcmUncyBubyBrZXkgZXhwbGljaXRseSBzZXQgb24gZHluYW1pYyBhcnJheXMgb2YgY2hpbGRyZW4gb3JcbiAgICogb2JqZWN0IGtleXMgYXJlIG5vdCB2YWxpZC4gVGhpcyBhbGxvd3MgdXMgdG8ga2VlcCB0cmFjayBvZiBjaGlsZHJlbiBiZXR3ZWVuXG4gICAqIHVwZGF0ZXMuXG4gICAqL1xuXG5cbiAgdmFyIG93bmVySGFzS2V5VXNlV2FybmluZyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGdldEN1cnJlbnRDb21wb25lbnRFcnJvckluZm8ocGFyZW50VHlwZSkge1xuICAgIHZhciBpbmZvID0gZ2V0RGVjbGFyYXRpb25FcnJvckFkZGVuZHVtKCk7XG5cbiAgICBpZiAoIWluZm8pIHtcbiAgICAgIHZhciBwYXJlbnROYW1lID0gdHlwZW9mIHBhcmVudFR5cGUgPT09ICdzdHJpbmcnID8gcGFyZW50VHlwZSA6IHBhcmVudFR5cGUuZGlzcGxheU5hbWUgfHwgcGFyZW50VHlwZS5uYW1lO1xuXG4gICAgICBpZiAocGFyZW50TmFtZSkge1xuICAgICAgICBpbmZvID0gXCJcXG5cXG5DaGVjayB0aGUgdG9wLWxldmVsIHJlbmRlciBjYWxsIHVzaW5nIDxcIiArIHBhcmVudE5hbWUgKyBcIj4uXCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGluZm87XG4gIH1cbiAgLyoqXG4gICAqIFdhcm4gaWYgdGhlIGVsZW1lbnQgZG9lc24ndCBoYXZlIGFuIGV4cGxpY2l0IGtleSBhc3NpZ25lZCB0byBpdC5cbiAgICogVGhpcyBlbGVtZW50IGlzIGluIGFuIGFycmF5LiBUaGUgYXJyYXkgY291bGQgZ3JvdyBhbmQgc2hyaW5rIG9yIGJlXG4gICAqIHJlb3JkZXJlZC4gQWxsIGNoaWxkcmVuIHRoYXQgaGF2ZW4ndCBhbHJlYWR5IGJlZW4gdmFsaWRhdGVkIGFyZSByZXF1aXJlZCB0b1xuICAgKiBoYXZlIGEgXCJrZXlcIiBwcm9wZXJ0eSBhc3NpZ25lZCB0byBpdC4gRXJyb3Igc3RhdHVzZXMgYXJlIGNhY2hlZCBzbyBhIHdhcm5pbmdcbiAgICogd2lsbCBvbmx5IGJlIHNob3duIG9uY2UuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKiBAcGFyYW0ge1JlYWN0RWxlbWVudH0gZWxlbWVudCBFbGVtZW50IHRoYXQgcmVxdWlyZXMgYSBrZXkuXG4gICAqIEBwYXJhbSB7Kn0gcGFyZW50VHlwZSBlbGVtZW50J3MgcGFyZW50J3MgdHlwZS5cbiAgICovXG5cblxuICBmdW5jdGlvbiB2YWxpZGF0ZUV4cGxpY2l0S2V5KGVsZW1lbnQsIHBhcmVudFR5cGUpIHtcbiAgICBpZiAoIWVsZW1lbnQuX3N0b3JlIHx8IGVsZW1lbnQuX3N0b3JlLnZhbGlkYXRlZCB8fCBlbGVtZW50LmtleSAhPSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZWxlbWVudC5fc3RvcmUudmFsaWRhdGVkID0gdHJ1ZTtcbiAgICB2YXIgY3VycmVudENvbXBvbmVudEVycm9ySW5mbyA9IGdldEN1cnJlbnRDb21wb25lbnRFcnJvckluZm8ocGFyZW50VHlwZSk7XG5cbiAgICBpZiAob3duZXJIYXNLZXlVc2VXYXJuaW5nW2N1cnJlbnRDb21wb25lbnRFcnJvckluZm9dKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgb3duZXJIYXNLZXlVc2VXYXJuaW5nW2N1cnJlbnRDb21wb25lbnRFcnJvckluZm9dID0gdHJ1ZTsgLy8gVXN1YWxseSB0aGUgY3VycmVudCBvd25lciBpcyB0aGUgb2ZmZW5kZXIsIGJ1dCBpZiBpdCBhY2NlcHRzIGNoaWxkcmVuIGFzIGFcbiAgICAvLyBwcm9wZXJ0eSwgaXQgbWF5IGJlIHRoZSBjcmVhdG9yIG9mIHRoZSBjaGlsZCB0aGF0J3MgcmVzcG9uc2libGUgZm9yXG4gICAgLy8gYXNzaWduaW5nIGl0IGEga2V5LlxuXG4gICAgdmFyIGNoaWxkT3duZXIgPSAnJztcblxuICAgIGlmIChlbGVtZW50ICYmIGVsZW1lbnQuX293bmVyICYmIGVsZW1lbnQuX293bmVyICE9PSBSZWFjdEN1cnJlbnRPd25lci5jdXJyZW50KSB7XG4gICAgICAvLyBHaXZlIHRoZSBjb21wb25lbnQgdGhhdCBvcmlnaW5hbGx5IGNyZWF0ZWQgdGhpcyBjaGlsZC5cbiAgICAgIGNoaWxkT3duZXIgPSBcIiBJdCB3YXMgcGFzc2VkIGEgY2hpbGQgZnJvbSBcIiArIGdldENvbXBvbmVudE5hbWUoZWxlbWVudC5fb3duZXIudHlwZSkgKyBcIi5cIjtcbiAgICB9XG5cbiAgICBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudChlbGVtZW50KTtcblxuICAgIHtcbiAgICAgIGVycm9yKCdFYWNoIGNoaWxkIGluIGEgbGlzdCBzaG91bGQgaGF2ZSBhIHVuaXF1ZSBcImtleVwiIHByb3AuJyArICclcyVzIFNlZSBodHRwczovL2ZiLm1lL3JlYWN0LXdhcm5pbmcta2V5cyBmb3IgbW9yZSBpbmZvcm1hdGlvbi4nLCBjdXJyZW50Q29tcG9uZW50RXJyb3JJbmZvLCBjaGlsZE93bmVyKTtcbiAgICB9XG5cbiAgICBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudChudWxsKTtcbiAgfVxuICAvKipcbiAgICogRW5zdXJlIHRoYXQgZXZlcnkgZWxlbWVudCBlaXRoZXIgaXMgcGFzc2VkIGluIGEgc3RhdGljIGxvY2F0aW9uLCBpbiBhblxuICAgKiBhcnJheSB3aXRoIGFuIGV4cGxpY2l0IGtleXMgcHJvcGVydHkgZGVmaW5lZCwgb3IgaW4gYW4gb2JqZWN0IGxpdGVyYWxcbiAgICogd2l0aCB2YWxpZCBrZXkgcHJvcGVydHkuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKiBAcGFyYW0ge1JlYWN0Tm9kZX0gbm9kZSBTdGF0aWNhbGx5IHBhc3NlZCBjaGlsZCBvZiBhbnkgdHlwZS5cbiAgICogQHBhcmFtIHsqfSBwYXJlbnRUeXBlIG5vZGUncyBwYXJlbnQncyB0eXBlLlxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlQ2hpbGRLZXlzKG5vZGUsIHBhcmVudFR5cGUpIHtcbiAgICBpZiAodHlwZW9mIG5vZGUgIT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBub2RlW2ldO1xuXG4gICAgICAgIGlmIChpc1ZhbGlkRWxlbWVudChjaGlsZCkpIHtcbiAgICAgICAgICB2YWxpZGF0ZUV4cGxpY2l0S2V5KGNoaWxkLCBwYXJlbnRUeXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNWYWxpZEVsZW1lbnQobm9kZSkpIHtcbiAgICAgIC8vIFRoaXMgZWxlbWVudCB3YXMgcGFzc2VkIGluIGEgdmFsaWQgbG9jYXRpb24uXG4gICAgICBpZiAobm9kZS5fc3RvcmUpIHtcbiAgICAgICAgbm9kZS5fc3RvcmUudmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5vZGUpIHtcbiAgICAgIHZhciBpdGVyYXRvckZuID0gZ2V0SXRlcmF0b3JGbihub2RlKTtcblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYXRvckZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIEVudHJ5IGl0ZXJhdG9ycyB1c2VkIHRvIHByb3ZpZGUgaW1wbGljaXQga2V5cyxcbiAgICAgICAgLy8gYnV0IG5vdyB3ZSBwcmludCBhIHNlcGFyYXRlIHdhcm5pbmcgZm9yIHRoZW0gbGF0ZXIuXG4gICAgICAgIGlmIChpdGVyYXRvckZuICE9PSBub2RlLmVudHJpZXMpIHtcbiAgICAgICAgICB2YXIgaXRlcmF0b3IgPSBpdGVyYXRvckZuLmNhbGwobm9kZSk7XG4gICAgICAgICAgdmFyIHN0ZXA7XG5cbiAgICAgICAgICB3aGlsZSAoIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lKSB7XG4gICAgICAgICAgICBpZiAoaXNWYWxpZEVsZW1lbnQoc3RlcC52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgdmFsaWRhdGVFeHBsaWNpdEtleShzdGVwLnZhbHVlLCBwYXJlbnRUeXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEdpdmVuIGFuIGVsZW1lbnQsIHZhbGlkYXRlIHRoYXQgaXRzIHByb3BzIGZvbGxvdyB0aGUgcHJvcFR5cGVzIGRlZmluaXRpb24sXG4gICAqIHByb3ZpZGVkIGJ5IHRoZSB0eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge1JlYWN0RWxlbWVudH0gZWxlbWVudFxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlUHJvcFR5cGVzKGVsZW1lbnQpIHtcbiAgICB7XG4gICAgICB2YXIgdHlwZSA9IGVsZW1lbnQudHlwZTtcblxuICAgICAgaWYgKHR5cGUgPT09IG51bGwgfHwgdHlwZSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBuYW1lID0gZ2V0Q29tcG9uZW50TmFtZSh0eXBlKTtcbiAgICAgIHZhciBwcm9wVHlwZXM7XG5cbiAgICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcm9wVHlwZXMgPSB0eXBlLnByb3BUeXBlcztcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICYmICh0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFIHx8IC8vIE5vdGU6IE1lbW8gb25seSBjaGVja3Mgb3V0ZXIgcHJvcHMgaGVyZS5cbiAgICAgIC8vIElubmVyIHByb3BzIGFyZSBjaGVja2VkIGluIHRoZSByZWNvbmNpbGVyLlxuICAgICAgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfTUVNT19UWVBFKSkge1xuICAgICAgICBwcm9wVHlwZXMgPSB0eXBlLnByb3BUeXBlcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BUeXBlcykge1xuICAgICAgICBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgY2hlY2tQcm9wVHlwZXNfMShwcm9wVHlwZXMsIGVsZW1lbnQucHJvcHMsICdwcm9wJywgbmFtZSwgUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZS5nZXRTdGFja0FkZGVuZHVtKTtcbiAgICAgICAgc2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQobnVsbCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUuUHJvcFR5cGVzICE9PSB1bmRlZmluZWQgJiYgIXByb3BUeXBlc01pc3NwZWxsV2FybmluZ1Nob3duKSB7XG4gICAgICAgIHByb3BUeXBlc01pc3NwZWxsV2FybmluZ1Nob3duID0gdHJ1ZTtcblxuICAgICAgICBlcnJvcignQ29tcG9uZW50ICVzIGRlY2xhcmVkIGBQcm9wVHlwZXNgIGluc3RlYWQgb2YgYHByb3BUeXBlc2AuIERpZCB5b3UgbWlzc3BlbGwgdGhlIHByb3BlcnR5IGFzc2lnbm1lbnQ/JywgbmFtZSB8fCAnVW5rbm93bicpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHR5cGUuZ2V0RGVmYXVsdFByb3BzID09PSAnZnVuY3Rpb24nICYmICF0eXBlLmdldERlZmF1bHRQcm9wcy5pc1JlYWN0Q2xhc3NBcHByb3ZlZCkge1xuICAgICAgICBlcnJvcignZ2V0RGVmYXVsdFByb3BzIGlzIG9ubHkgdXNlZCBvbiBjbGFzc2ljIFJlYWN0LmNyZWF0ZUNsYXNzICcgKyAnZGVmaW5pdGlvbnMuIFVzZSBhIHN0YXRpYyBwcm9wZXJ0eSBuYW1lZCBgZGVmYXVsdFByb3BzYCBpbnN0ZWFkLicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogR2l2ZW4gYSBmcmFnbWVudCwgdmFsaWRhdGUgdGhhdCBpdCBjYW4gb25seSBiZSBwcm92aWRlZCB3aXRoIGZyYWdtZW50IHByb3BzXG4gICAqIEBwYXJhbSB7UmVhY3RFbGVtZW50fSBmcmFnbWVudFxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlRnJhZ21lbnRQcm9wcyhmcmFnbWVudCkge1xuICAgIHtcbiAgICAgIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50KGZyYWdtZW50KTtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZnJhZ21lbnQucHJvcHMpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG5cbiAgICAgICAgaWYgKGtleSAhPT0gJ2NoaWxkcmVuJyAmJiBrZXkgIT09ICdrZXknKSB7XG4gICAgICAgICAgZXJyb3IoJ0ludmFsaWQgcHJvcCBgJXNgIHN1cHBsaWVkIHRvIGBSZWFjdC5GcmFnbWVudGAuICcgKyAnUmVhY3QuRnJhZ21lbnQgY2FuIG9ubHkgaGF2ZSBga2V5YCBhbmQgYGNoaWxkcmVuYCBwcm9wcy4nLCBrZXkpO1xuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZyYWdtZW50LnJlZiAhPT0gbnVsbCkge1xuICAgICAgICBlcnJvcignSW52YWxpZCBhdHRyaWJ1dGUgYHJlZmAgc3VwcGxpZWQgdG8gYFJlYWN0LkZyYWdtZW50YC4nKTtcbiAgICAgIH1cblxuICAgICAgc2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQobnVsbCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRXaXRoVmFsaWRhdGlvbih0eXBlLCBwcm9wcywgY2hpbGRyZW4pIHtcbiAgICB2YXIgdmFsaWRUeXBlID0gaXNWYWxpZEVsZW1lbnRUeXBlKHR5cGUpOyAvLyBXZSB3YXJuIGluIHRoaXMgY2FzZSBidXQgZG9uJ3QgdGhyb3cuIFdlIGV4cGVjdCB0aGUgZWxlbWVudCBjcmVhdGlvbiB0b1xuICAgIC8vIHN1Y2NlZWQgYW5kIHRoZXJlIHdpbGwgbGlrZWx5IGJlIGVycm9ycyBpbiByZW5kZXIuXG5cbiAgICBpZiAoIXZhbGlkVHlwZSkge1xuICAgICAgdmFyIGluZm8gPSAnJztcblxuICAgICAgaWYgKHR5cGUgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgJiYgdHlwZSAhPT0gbnVsbCAmJiBPYmplY3Qua2V5cyh0eXBlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgaW5mbyArPSAnIFlvdSBsaWtlbHkgZm9yZ290IHRvIGV4cG9ydCB5b3VyIGNvbXBvbmVudCBmcm9tIHRoZSBmaWxlICcgKyBcIml0J3MgZGVmaW5lZCBpbiwgb3IgeW91IG1pZ2h0IGhhdmUgbWl4ZWQgdXAgZGVmYXVsdCBhbmQgbmFtZWQgaW1wb3J0cy5cIjtcbiAgICAgIH1cblxuICAgICAgdmFyIHNvdXJjZUluZm8gPSBnZXRTb3VyY2VJbmZvRXJyb3JBZGRlbmR1bUZvclByb3BzKHByb3BzKTtcblxuICAgICAgaWYgKHNvdXJjZUluZm8pIHtcbiAgICAgICAgaW5mbyArPSBzb3VyY2VJbmZvO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5mbyArPSBnZXREZWNsYXJhdGlvbkVycm9yQWRkZW5kdW0oKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHR5cGVTdHJpbmc7XG5cbiAgICAgIGlmICh0eXBlID09PSBudWxsKSB7XG4gICAgICAgIHR5cGVTdHJpbmcgPSAnbnVsbCc7XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodHlwZSkpIHtcbiAgICAgICAgdHlwZVN0cmluZyA9ICdhcnJheSc7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgIT09IHVuZGVmaW5lZCAmJiB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9FTEVNRU5UX1RZUEUpIHtcbiAgICAgICAgdHlwZVN0cmluZyA9IFwiPFwiICsgKGdldENvbXBvbmVudE5hbWUodHlwZS50eXBlKSB8fCAnVW5rbm93bicpICsgXCIgLz5cIjtcbiAgICAgICAgaW5mbyA9ICcgRGlkIHlvdSBhY2NpZGVudGFsbHkgZXhwb3J0IGEgSlNYIGxpdGVyYWwgaW5zdGVhZCBvZiBhIGNvbXBvbmVudD8nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZVN0cmluZyA9IHR5cGVvZiB0eXBlO1xuICAgICAgfVxuXG4gICAgICB7XG4gICAgICAgIGVycm9yKCdSZWFjdC5jcmVhdGVFbGVtZW50OiB0eXBlIGlzIGludmFsaWQgLS0gZXhwZWN0ZWQgYSBzdHJpbmcgKGZvciAnICsgJ2J1aWx0LWluIGNvbXBvbmVudHMpIG9yIGEgY2xhc3MvZnVuY3Rpb24gKGZvciBjb21wb3NpdGUgJyArICdjb21wb25lbnRzKSBidXQgZ290OiAlcy4lcycsIHR5cGVTdHJpbmcsIGluZm8pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBlbGVtZW50ID0gY3JlYXRlRWxlbWVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyAvLyBUaGUgcmVzdWx0IGNhbiBiZSBudWxsaXNoIGlmIGEgbW9jayBvciBhIGN1c3RvbSBmdW5jdGlvbiBpcyB1c2VkLlxuICAgIC8vIFRPRE86IERyb3AgdGhpcyB3aGVuIHRoZXNlIGFyZSBubyBsb25nZXIgYWxsb3dlZCBhcyB0aGUgdHlwZSBhcmd1bWVudC5cblxuICAgIGlmIChlbGVtZW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH0gLy8gU2tpcCBrZXkgd2FybmluZyBpZiB0aGUgdHlwZSBpc24ndCB2YWxpZCBzaW5jZSBvdXIga2V5IHZhbGlkYXRpb24gbG9naWNcbiAgICAvLyBkb2Vzbid0IGV4cGVjdCBhIG5vbi1zdHJpbmcvZnVuY3Rpb24gdHlwZSBhbmQgY2FuIHRocm93IGNvbmZ1c2luZyBlcnJvcnMuXG4gICAgLy8gV2UgZG9uJ3Qgd2FudCBleGNlcHRpb24gYmVoYXZpb3IgdG8gZGlmZmVyIGJldHdlZW4gZGV2IGFuZCBwcm9kLlxuICAgIC8vIChSZW5kZXJpbmcgd2lsbCB0aHJvdyB3aXRoIGEgaGVscGZ1bCBtZXNzYWdlIGFuZCBhcyBzb29uIGFzIHRoZSB0eXBlIGlzXG4gICAgLy8gZml4ZWQsIHRoZSBrZXkgd2FybmluZ3Mgd2lsbCBhcHBlYXIuKVxuXG5cbiAgICBpZiAodmFsaWRUeXBlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMjsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YWxpZGF0ZUNoaWxkS2V5cyhhcmd1bWVudHNbaV0sIHR5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlID09PSBSRUFDVF9GUkFHTUVOVF9UWVBFKSB7XG4gICAgICB2YWxpZGF0ZUZyYWdtZW50UHJvcHMoZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbGlkYXRlUHJvcFR5cGVzKGVsZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG4gIHZhciBkaWRXYXJuQWJvdXREZXByZWNhdGVkQ3JlYXRlRmFjdG9yeSA9IGZhbHNlO1xuICBmdW5jdGlvbiBjcmVhdGVGYWN0b3J5V2l0aFZhbGlkYXRpb24odHlwZSkge1xuICAgIHZhciB2YWxpZGF0ZWRGYWN0b3J5ID0gY3JlYXRlRWxlbWVudFdpdGhWYWxpZGF0aW9uLmJpbmQobnVsbCwgdHlwZSk7XG4gICAgdmFsaWRhdGVkRmFjdG9yeS50eXBlID0gdHlwZTtcblxuICAgIHtcbiAgICAgIGlmICghZGlkV2FybkFib3V0RGVwcmVjYXRlZENyZWF0ZUZhY3RvcnkpIHtcbiAgICAgICAgZGlkV2FybkFib3V0RGVwcmVjYXRlZENyZWF0ZUZhY3RvcnkgPSB0cnVlO1xuXG4gICAgICAgIHdhcm4oJ1JlYWN0LmNyZWF0ZUZhY3RvcnkoKSBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gJyArICdhIGZ1dHVyZSBtYWpvciByZWxlYXNlLiBDb25zaWRlciB1c2luZyBKU1ggJyArICdvciB1c2UgUmVhY3QuY3JlYXRlRWxlbWVudCgpIGRpcmVjdGx5IGluc3RlYWQuJyk7XG4gICAgICB9IC8vIExlZ2FjeSBob29rOiByZW1vdmUgaXRcblxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodmFsaWRhdGVkRmFjdG9yeSwgJ3R5cGUnLCB7XG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB3YXJuKCdGYWN0b3J5LnR5cGUgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHRoZSBjbGFzcyBkaXJlY3RseSAnICsgJ2JlZm9yZSBwYXNzaW5nIGl0IHRvIGNyZWF0ZUZhY3RvcnkuJyk7XG5cbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3R5cGUnLCB7XG4gICAgICAgICAgICB2YWx1ZTogdHlwZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0eXBlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdGVkRmFjdG9yeTtcbiAgfVxuICBmdW5jdGlvbiBjbG9uZUVsZW1lbnRXaXRoVmFsaWRhdGlvbihlbGVtZW50LCBwcm9wcywgY2hpbGRyZW4pIHtcbiAgICB2YXIgbmV3RWxlbWVudCA9IGNsb25lRWxlbWVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgZm9yICh2YXIgaSA9IDI7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbGlkYXRlQ2hpbGRLZXlzKGFyZ3VtZW50c1tpXSwgbmV3RWxlbWVudC50eXBlKTtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZVByb3BUeXBlcyhuZXdFbGVtZW50KTtcbiAgICByZXR1cm4gbmV3RWxlbWVudDtcbiAgfVxuXG4gIHZhciBlbmFibGVTY2hlZHVsZXJEZWJ1Z2dpbmcgPSBmYWxzZTtcbiAgdmFyIGVuYWJsZVByb2ZpbGluZyA9IHRydWU7XG5cbiAgdmFyIHJlcXVlc3RIb3N0Q2FsbGJhY2s7XG4gIHZhciByZXF1ZXN0SG9zdFRpbWVvdXQ7XG4gIHZhciBjYW5jZWxIb3N0VGltZW91dDtcbiAgdmFyIHNob3VsZFlpZWxkVG9Ib3N0O1xuICB2YXIgcmVxdWVzdFBhaW50O1xuICB2YXIgZ2V0Q3VycmVudFRpbWU7XG4gIHZhciBmb3JjZUZyYW1lUmF0ZTtcblxuICBpZiAoIC8vIElmIFNjaGVkdWxlciBydW5zIGluIGEgbm9uLURPTSBlbnZpcm9ubWVudCwgaXQgZmFsbHMgYmFjayB0byBhIG5haXZlXG4gIC8vIGltcGxlbWVudGF0aW9uIHVzaW5nIHNldFRpbWVvdXQuXG4gIHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8IC8vIENoZWNrIGlmIE1lc3NhZ2VDaGFubmVsIGlzIHN1cHBvcnRlZCwgdG9vLlxuICB0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBJZiB0aGlzIGFjY2lkZW50YWxseSBnZXRzIGltcG9ydGVkIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQsIGUuZy4gSmF2YVNjcmlwdENvcmUsXG4gICAgLy8gZmFsbGJhY2sgdG8gYSBuYWl2ZSBpbXBsZW1lbnRhdGlvbi5cbiAgICB2YXIgX2NhbGxiYWNrID0gbnVsbDtcbiAgICB2YXIgX3RpbWVvdXRJRCA9IG51bGw7XG5cbiAgICB2YXIgX2ZsdXNoQ2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoX2NhbGxiYWNrICE9PSBudWxsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZ2V0Q3VycmVudFRpbWUoKTtcbiAgICAgICAgICB2YXIgaGFzUmVtYWluaW5nVGltZSA9IHRydWU7XG5cbiAgICAgICAgICBfY2FsbGJhY2soaGFzUmVtYWluaW5nVGltZSwgY3VycmVudFRpbWUpO1xuXG4gICAgICAgICAgX2NhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHNldFRpbWVvdXQoX2ZsdXNoQ2FsbGJhY2ssIDApO1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGluaXRpYWxUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgIGdldEN1cnJlbnRUaW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBpbml0aWFsVGltZTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdEhvc3RDYWxsYmFjayA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgaWYgKF9jYWxsYmFjayAhPT0gbnVsbCkge1xuICAgICAgICAvLyBQcm90ZWN0IGFnYWluc3QgcmUtZW50cmFuY3kuXG4gICAgICAgIHNldFRpbWVvdXQocmVxdWVzdEhvc3RDYWxsYmFjaywgMCwgY2IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2NhbGxiYWNrID0gY2I7XG4gICAgICAgIHNldFRpbWVvdXQoX2ZsdXNoQ2FsbGJhY2ssIDApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0SG9zdFRpbWVvdXQgPSBmdW5jdGlvbiAoY2IsIG1zKSB7XG4gICAgICBfdGltZW91dElEID0gc2V0VGltZW91dChjYiwgbXMpO1xuICAgIH07XG5cbiAgICBjYW5jZWxIb3N0VGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNsZWFyVGltZW91dChfdGltZW91dElEKTtcbiAgICB9O1xuXG4gICAgc2hvdWxkWWllbGRUb0hvc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHJlcXVlc3RQYWludCA9IGZvcmNlRnJhbWVSYXRlID0gZnVuY3Rpb24gKCkge307XG4gIH0gZWxzZSB7XG4gICAgLy8gQ2FwdHVyZSBsb2NhbCByZWZlcmVuY2VzIHRvIG5hdGl2ZSBBUElzLCBpbiBjYXNlIGEgcG9seWZpbGwgb3ZlcnJpZGVzIHRoZW0uXG4gICAgdmFyIHBlcmZvcm1hbmNlID0gd2luZG93LnBlcmZvcm1hbmNlO1xuICAgIHZhciBfRGF0ZSA9IHdpbmRvdy5EYXRlO1xuICAgIHZhciBfc2V0VGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0O1xuICAgIHZhciBfY2xlYXJUaW1lb3V0ID0gd2luZG93LmNsZWFyVGltZW91dDtcblxuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFRPRE86IFNjaGVkdWxlciBubyBsb25nZXIgcmVxdWlyZXMgdGhlc2UgbWV0aG9kcyB0byBiZSBwb2x5ZmlsbGVkLiBCdXRcbiAgICAgIC8vIG1heWJlIHdlIHdhbnQgdG8gY29udGludWUgd2FybmluZyBpZiB0aGV5IGRvbid0IGV4aXN0LCB0byBwcmVzZXJ2ZSB0aGVcbiAgICAgIC8vIG9wdGlvbiB0byByZWx5IG9uIGl0IGluIHRoZSBmdXR1cmU/XG4gICAgICB2YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgIHZhciBjYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZTsgLy8gVE9ETzogUmVtb3ZlIGZiLm1lIGxpbmtcblxuICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gVXNpbmcgY29uc29sZVsnZXJyb3InXSB0byBldmFkZSBCYWJlbCBhbmQgRVNMaW50XG4gICAgICAgIGNvbnNvbGVbJ2Vycm9yJ10oXCJUaGlzIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHJlcXVlc3RBbmltYXRpb25GcmFtZS4gXCIgKyAnTWFrZSBzdXJlIHRoYXQgeW91IGxvYWQgYSAnICsgJ3BvbHlmaWxsIGluIG9sZGVyIGJyb3dzZXJzLiBodHRwczovL2ZiLm1lL3JlYWN0LXBvbHlmaWxscycpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGNhbmNlbEFuaW1hdGlvbkZyYW1lICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIFVzaW5nIGNvbnNvbGVbJ2Vycm9yJ10gdG8gZXZhZGUgQmFiZWwgYW5kIEVTTGludFxuICAgICAgICBjb25zb2xlWydlcnJvciddKFwiVGhpcyBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBjYW5jZWxBbmltYXRpb25GcmFtZS4gXCIgKyAnTWFrZSBzdXJlIHRoYXQgeW91IGxvYWQgYSAnICsgJ3BvbHlmaWxsIGluIG9sZGVyIGJyb3dzZXJzLiBodHRwczovL2ZiLm1lL3JlYWN0LXBvbHlmaWxscycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGVyZm9ybWFuY2UgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGdldEN1cnJlbnRUaW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgX2luaXRpYWxUaW1lID0gX0RhdGUubm93KCk7XG5cbiAgICAgIGdldEN1cnJlbnRUaW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX0RhdGUubm93KCkgLSBfaW5pdGlhbFRpbWU7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBpc01lc3NhZ2VMb29wUnVubmluZyA9IGZhbHNlO1xuICAgIHZhciBzY2hlZHVsZWRIb3N0Q2FsbGJhY2sgPSBudWxsO1xuICAgIHZhciB0YXNrVGltZW91dElEID0gLTE7IC8vIFNjaGVkdWxlciBwZXJpb2RpY2FsbHkgeWllbGRzIGluIGNhc2UgdGhlcmUgaXMgb3RoZXIgd29yayBvbiB0aGUgbWFpblxuICAgIC8vIHRocmVhZCwgbGlrZSB1c2VyIGV2ZW50cy4gQnkgZGVmYXVsdCwgaXQgeWllbGRzIG11bHRpcGxlIHRpbWVzIHBlciBmcmFtZS5cbiAgICAvLyBJdCBkb2VzIG5vdCBhdHRlbXB0IHRvIGFsaWduIHdpdGggZnJhbWUgYm91bmRhcmllcywgc2luY2UgbW9zdCB0YXNrcyBkb24ndFxuICAgIC8vIG5lZWQgdG8gYmUgZnJhbWUgYWxpZ25lZDsgZm9yIHRob3NlIHRoYXQgZG8sIHVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUuXG5cbiAgICB2YXIgeWllbGRJbnRlcnZhbCA9IDU7XG4gICAgdmFyIGRlYWRsaW5lID0gMDsgLy8gVE9ETzogTWFrZSB0aGlzIGNvbmZpZ3VyYWJsZVxuXG4gICAge1xuICAgICAgLy8gYGlzSW5wdXRQZW5kaW5nYCBpcyBub3QgYXZhaWxhYmxlLiBTaW5jZSB3ZSBoYXZlIG5vIHdheSBvZiBrbm93aW5nIGlmXG4gICAgICAvLyB0aGVyZSdzIHBlbmRpbmcgaW5wdXQsIGFsd2F5cyB5aWVsZCBhdCB0aGUgZW5kIG9mIHRoZSBmcmFtZS5cbiAgICAgIHNob3VsZFlpZWxkVG9Ib3N0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZ2V0Q3VycmVudFRpbWUoKSA+PSBkZWFkbGluZTtcbiAgICAgIH07IC8vIFNpbmNlIHdlIHlpZWxkIGV2ZXJ5IGZyYW1lIHJlZ2FyZGxlc3MsIGByZXF1ZXN0UGFpbnRgIGhhcyBubyBlZmZlY3QuXG5cblxuICAgICAgcmVxdWVzdFBhaW50ID0gZnVuY3Rpb24gKCkge307XG4gICAgfVxuXG4gICAgZm9yY2VGcmFtZVJhdGUgPSBmdW5jdGlvbiAoZnBzKSB7XG4gICAgICBpZiAoZnBzIDwgMCB8fCBmcHMgPiAxMjUpIHtcbiAgICAgICAgLy8gVXNpbmcgY29uc29sZVsnZXJyb3InXSB0byBldmFkZSBCYWJlbCBhbmQgRVNMaW50XG4gICAgICAgIGNvbnNvbGVbJ2Vycm9yJ10oJ2ZvcmNlRnJhbWVSYXRlIHRha2VzIGEgcG9zaXRpdmUgaW50IGJldHdlZW4gMCBhbmQgMTI1LCAnICsgJ2ZvcmNpbmcgZnJhbWVyYXRlcyBoaWdoZXIgdGhhbiAxMjUgZnBzIGlzIG5vdCB1bnN1cHBvcnRlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChmcHMgPiAwKSB7XG4gICAgICAgIHlpZWxkSW50ZXJ2YWwgPSBNYXRoLmZsb29yKDEwMDAgLyBmcHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVzZXQgdGhlIGZyYW1lcmF0ZVxuICAgICAgICB5aWVsZEludGVydmFsID0gNTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHBlcmZvcm1Xb3JrVW50aWxEZWFkbGluZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzY2hlZHVsZWRIb3N0Q2FsbGJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZ2V0Q3VycmVudFRpbWUoKTsgLy8gWWllbGQgYWZ0ZXIgYHlpZWxkSW50ZXJ2YWxgIG1zLCByZWdhcmRsZXNzIG9mIHdoZXJlIHdlIGFyZSBpbiB0aGUgdnN5bmNcbiAgICAgICAgLy8gY3ljbGUuIFRoaXMgbWVhbnMgdGhlcmUncyBhbHdheXMgdGltZSByZW1haW5pbmcgYXQgdGhlIGJlZ2lubmluZyBvZlxuICAgICAgICAvLyB0aGUgbWVzc2FnZSBldmVudC5cblxuICAgICAgICBkZWFkbGluZSA9IGN1cnJlbnRUaW1lICsgeWllbGRJbnRlcnZhbDtcbiAgICAgICAgdmFyIGhhc1RpbWVSZW1haW5pbmcgPSB0cnVlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIGhhc01vcmVXb3JrID0gc2NoZWR1bGVkSG9zdENhbGxiYWNrKGhhc1RpbWVSZW1haW5pbmcsIGN1cnJlbnRUaW1lKTtcblxuICAgICAgICAgIGlmICghaGFzTW9yZVdvcmspIHtcbiAgICAgICAgICAgIGlzTWVzc2FnZUxvb3BSdW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBzY2hlZHVsZWRIb3N0Q2FsbGJhY2sgPSBudWxsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG1vcmUgd29yaywgc2NoZWR1bGUgdGhlIG5leHQgbWVzc2FnZSBldmVudCBhdCB0aGUgZW5kXG4gICAgICAgICAgICAvLyBvZiB0aGUgcHJlY2VkaW5nIG9uZS5cbiAgICAgICAgICAgIHBvcnQucG9zdE1lc3NhZ2UobnVsbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIC8vIElmIGEgc2NoZWR1bGVyIHRhc2sgdGhyb3dzLCBleGl0IHRoZSBjdXJyZW50IGJyb3dzZXIgdGFzayBzbyB0aGVcbiAgICAgICAgICAvLyBlcnJvciBjYW4gYmUgb2JzZXJ2ZWQuXG4gICAgICAgICAgcG9ydC5wb3N0TWVzc2FnZShudWxsKTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNNZXNzYWdlTG9vcFJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIH0gLy8gWWllbGRpbmcgdG8gdGhlIGJyb3dzZXIgd2lsbCBnaXZlIGl0IGEgY2hhbmNlIHRvIHBhaW50LCBzbyB3ZSBjYW5cbiAgICB9O1xuXG4gICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICB2YXIgcG9ydCA9IGNoYW5uZWwucG9ydDI7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBwZXJmb3JtV29ya1VudGlsRGVhZGxpbmU7XG5cbiAgICByZXF1ZXN0SG9zdENhbGxiYWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICBzY2hlZHVsZWRIb3N0Q2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgaWYgKCFpc01lc3NhZ2VMb29wUnVubmluZykge1xuICAgICAgICBpc01lc3NhZ2VMb29wUnVubmluZyA9IHRydWU7XG4gICAgICAgIHBvcnQucG9zdE1lc3NhZ2UobnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3RIb3N0VGltZW91dCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgbXMpIHtcbiAgICAgIHRhc2tUaW1lb3V0SUQgPSBfc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbGxiYWNrKGdldEN1cnJlbnRUaW1lKCkpO1xuICAgICAgfSwgbXMpO1xuICAgIH07XG5cbiAgICBjYW5jZWxIb3N0VGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIF9jbGVhclRpbWVvdXQodGFza1RpbWVvdXRJRCk7XG5cbiAgICAgIHRhc2tUaW1lb3V0SUQgPSAtMTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gcHVzaChoZWFwLCBub2RlKSB7XG4gICAgdmFyIGluZGV4ID0gaGVhcC5sZW5ndGg7XG4gICAgaGVhcC5wdXNoKG5vZGUpO1xuICAgIHNpZnRVcChoZWFwLCBub2RlLCBpbmRleCk7XG4gIH1cbiAgZnVuY3Rpb24gcGVlayhoZWFwKSB7XG4gICAgdmFyIGZpcnN0ID0gaGVhcFswXTtcbiAgICByZXR1cm4gZmlyc3QgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBmaXJzdDtcbiAgfVxuICBmdW5jdGlvbiBwb3AoaGVhcCkge1xuICAgIHZhciBmaXJzdCA9IGhlYXBbMF07XG5cbiAgICBpZiAoZmlyc3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGxhc3QgPSBoZWFwLnBvcCgpO1xuXG4gICAgICBpZiAobGFzdCAhPT0gZmlyc3QpIHtcbiAgICAgICAgaGVhcFswXSA9IGxhc3Q7XG4gICAgICAgIHNpZnREb3duKGhlYXAsIGxhc3QsIDApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmlyc3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNpZnRVcChoZWFwLCBub2RlLCBpKSB7XG4gICAgdmFyIGluZGV4ID0gaTtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB2YXIgcGFyZW50SW5kZXggPSBpbmRleCAtIDEgPj4+IDE7XG4gICAgICB2YXIgcGFyZW50ID0gaGVhcFtwYXJlbnRJbmRleF07XG5cbiAgICAgIGlmIChwYXJlbnQgIT09IHVuZGVmaW5lZCAmJiBjb21wYXJlKHBhcmVudCwgbm9kZSkgPiAwKSB7XG4gICAgICAgIC8vIFRoZSBwYXJlbnQgaXMgbGFyZ2VyLiBTd2FwIHBvc2l0aW9ucy5cbiAgICAgICAgaGVhcFtwYXJlbnRJbmRleF0gPSBub2RlO1xuICAgICAgICBoZWFwW2luZGV4XSA9IHBhcmVudDtcbiAgICAgICAgaW5kZXggPSBwYXJlbnRJbmRleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBwYXJlbnQgaXMgc21hbGxlci4gRXhpdC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNpZnREb3duKGhlYXAsIG5vZGUsIGkpIHtcbiAgICB2YXIgaW5kZXggPSBpO1xuICAgIHZhciBsZW5ndGggPSBoZWFwLmxlbmd0aDtcblxuICAgIHdoaWxlIChpbmRleCA8IGxlbmd0aCkge1xuICAgICAgdmFyIGxlZnRJbmRleCA9IChpbmRleCArIDEpICogMiAtIDE7XG4gICAgICB2YXIgbGVmdCA9IGhlYXBbbGVmdEluZGV4XTtcbiAgICAgIHZhciByaWdodEluZGV4ID0gbGVmdEluZGV4ICsgMTtcbiAgICAgIHZhciByaWdodCA9IGhlYXBbcmlnaHRJbmRleF07IC8vIElmIHRoZSBsZWZ0IG9yIHJpZ2h0IG5vZGUgaXMgc21hbGxlciwgc3dhcCB3aXRoIHRoZSBzbWFsbGVyIG9mIHRob3NlLlxuXG4gICAgICBpZiAobGVmdCAhPT0gdW5kZWZpbmVkICYmIGNvbXBhcmUobGVmdCwgbm9kZSkgPCAwKSB7XG4gICAgICAgIGlmIChyaWdodCAhPT0gdW5kZWZpbmVkICYmIGNvbXBhcmUocmlnaHQsIGxlZnQpIDwgMCkge1xuICAgICAgICAgIGhlYXBbaW5kZXhdID0gcmlnaHQ7XG4gICAgICAgICAgaGVhcFtyaWdodEluZGV4XSA9IG5vZGU7XG4gICAgICAgICAgaW5kZXggPSByaWdodEluZGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhlYXBbaW5kZXhdID0gbGVmdDtcbiAgICAgICAgICBoZWFwW2xlZnRJbmRleF0gPSBub2RlO1xuICAgICAgICAgIGluZGV4ID0gbGVmdEluZGV4O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHJpZ2h0ICE9PSB1bmRlZmluZWQgJiYgY29tcGFyZShyaWdodCwgbm9kZSkgPCAwKSB7XG4gICAgICAgIGhlYXBbaW5kZXhdID0gcmlnaHQ7XG4gICAgICAgIGhlYXBbcmlnaHRJbmRleF0gPSBub2RlO1xuICAgICAgICBpbmRleCA9IHJpZ2h0SW5kZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOZWl0aGVyIGNoaWxkIGlzIHNtYWxsZXIuIEV4aXQuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcbiAgICAvLyBDb21wYXJlIHNvcnQgaW5kZXggZmlyc3QsIHRoZW4gdGFzayBpZC5cbiAgICB2YXIgZGlmZiA9IGEuc29ydEluZGV4IC0gYi5zb3J0SW5kZXg7XG4gICAgcmV0dXJuIGRpZmYgIT09IDAgPyBkaWZmIDogYS5pZCAtIGIuaWQ7XG4gIH1cblxuICAvLyBUT0RPOiBVc2Ugc3ltYm9scz9cbiAgdmFyIE5vUHJpb3JpdHkgPSAwO1xuICB2YXIgSW1tZWRpYXRlUHJpb3JpdHkgPSAxO1xuICB2YXIgVXNlckJsb2NraW5nUHJpb3JpdHkgPSAyO1xuICB2YXIgTm9ybWFsUHJpb3JpdHkgPSAzO1xuICB2YXIgTG93UHJpb3JpdHkgPSA0O1xuICB2YXIgSWRsZVByaW9yaXR5ID0gNTtcblxuICB2YXIgcnVuSWRDb3VudGVyID0gMDtcbiAgdmFyIG1haW5UaHJlYWRJZENvdW50ZXIgPSAwO1xuICB2YXIgcHJvZmlsaW5nU3RhdGVTaXplID0gNDtcbiAgdmFyIHNoYXJlZFByb2ZpbGluZ0J1ZmZlciA9ICAvLyAkRmxvd0ZpeE1lIEZsb3cgZG9lc24ndCBrbm93IGFib3V0IFNoYXJlZEFycmF5QnVmZmVyXG4gIHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciA9PT0gJ2Z1bmN0aW9uJyA/IG5ldyBTaGFyZWRBcnJheUJ1ZmZlcihwcm9maWxpbmdTdGF0ZVNpemUgKiBJbnQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UKSA6IC8vICRGbG93Rml4TWUgRmxvdyBkb2Vzbid0IGtub3cgYWJvdXQgQXJyYXlCdWZmZXJcbiAgdHlwZW9mIEFycmF5QnVmZmVyID09PSAnZnVuY3Rpb24nID8gbmV3IEFycmF5QnVmZmVyKHByb2ZpbGluZ1N0YXRlU2l6ZSAqIEludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpIDogbnVsbCAvLyBEb24ndCBjcmFzaCB0aGUgaW5pdCBwYXRoIG9uIElFOVxuICA7XG4gIHZhciBwcm9maWxpbmdTdGF0ZSA9ICBzaGFyZWRQcm9maWxpbmdCdWZmZXIgIT09IG51bGwgPyBuZXcgSW50MzJBcnJheShzaGFyZWRQcm9maWxpbmdCdWZmZXIpIDogW107IC8vIFdlIGNhbid0IHJlYWQgdGhpcyBidXQgaXQgaGVscHMgc2F2ZSBieXRlcyBmb3IgbnVsbCBjaGVja3NcblxuICB2YXIgUFJJT1JJVFkgPSAwO1xuICB2YXIgQ1VSUkVOVF9UQVNLX0lEID0gMTtcbiAgdmFyIENVUlJFTlRfUlVOX0lEID0gMjtcbiAgdmFyIFFVRVVFX1NJWkUgPSAzO1xuXG4gIHtcbiAgICBwcm9maWxpbmdTdGF0ZVtQUklPUklUWV0gPSBOb1ByaW9yaXR5OyAvLyBUaGlzIGlzIG1haW50YWluZWQgd2l0aCBhIGNvdW50ZXIsIGJlY2F1c2UgdGhlIHNpemUgb2YgdGhlIHByaW9yaXR5IHF1ZXVlXG4gICAgLy8gYXJyYXkgbWlnaHQgaW5jbHVkZSBjYW5jZWxlZCB0YXNrcy5cblxuICAgIHByb2ZpbGluZ1N0YXRlW1FVRVVFX1NJWkVdID0gMDtcbiAgICBwcm9maWxpbmdTdGF0ZVtDVVJSRU5UX1RBU0tfSURdID0gMDtcbiAgfSAvLyBCeXRlcyBwZXIgZWxlbWVudCBpcyA0XG5cblxuICB2YXIgSU5JVElBTF9FVkVOVF9MT0dfU0laRSA9IDEzMTA3MjtcbiAgdmFyIE1BWF9FVkVOVF9MT0dfU0laRSA9IDUyNDI4ODsgLy8gRXF1aXZhbGVudCB0byAyIG1lZ2FieXRlc1xuXG4gIHZhciBldmVudExvZ1NpemUgPSAwO1xuICB2YXIgZXZlbnRMb2dCdWZmZXIgPSBudWxsO1xuICB2YXIgZXZlbnRMb2cgPSBudWxsO1xuICB2YXIgZXZlbnRMb2dJbmRleCA9IDA7XG4gIHZhciBUYXNrU3RhcnRFdmVudCA9IDE7XG4gIHZhciBUYXNrQ29tcGxldGVFdmVudCA9IDI7XG4gIHZhciBUYXNrRXJyb3JFdmVudCA9IDM7XG4gIHZhciBUYXNrQ2FuY2VsRXZlbnQgPSA0O1xuICB2YXIgVGFza1J1bkV2ZW50ID0gNTtcbiAgdmFyIFRhc2tZaWVsZEV2ZW50ID0gNjtcbiAgdmFyIFNjaGVkdWxlclN1c3BlbmRFdmVudCA9IDc7XG4gIHZhciBTY2hlZHVsZXJSZXN1bWVFdmVudCA9IDg7XG5cbiAgZnVuY3Rpb24gbG9nRXZlbnQoZW50cmllcykge1xuICAgIGlmIChldmVudExvZyAhPT0gbnVsbCkge1xuICAgICAgdmFyIG9mZnNldCA9IGV2ZW50TG9nSW5kZXg7XG4gICAgICBldmVudExvZ0luZGV4ICs9IGVudHJpZXMubGVuZ3RoO1xuXG4gICAgICBpZiAoZXZlbnRMb2dJbmRleCArIDEgPiBldmVudExvZ1NpemUpIHtcbiAgICAgICAgZXZlbnRMb2dTaXplICo9IDI7XG5cbiAgICAgICAgaWYgKGV2ZW50TG9nU2l6ZSA+IE1BWF9FVkVOVF9MT0dfU0laRSkge1xuICAgICAgICAgIC8vIFVzaW5nIGNvbnNvbGVbJ2Vycm9yJ10gdG8gZXZhZGUgQmFiZWwgYW5kIEVTTGludFxuICAgICAgICAgIGNvbnNvbGVbJ2Vycm9yJ10oXCJTY2hlZHVsZXIgUHJvZmlsaW5nOiBFdmVudCBsb2cgZXhjZWVkZWQgbWF4aW11bSBzaXplLiBEb24ndCBcIiArICdmb3JnZXQgdG8gY2FsbCBgc3RvcExvZ2dpbmdQcm9maWxpbmdFdmVudHMoKWAuJyk7XG4gICAgICAgICAgc3RvcExvZ2dpbmdQcm9maWxpbmdFdmVudHMoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV3RXZlbnRMb2cgPSBuZXcgSW50MzJBcnJheShldmVudExvZ1NpemUgKiA0KTtcbiAgICAgICAgbmV3RXZlbnRMb2cuc2V0KGV2ZW50TG9nKTtcbiAgICAgICAgZXZlbnRMb2dCdWZmZXIgPSBuZXdFdmVudExvZy5idWZmZXI7XG4gICAgICAgIGV2ZW50TG9nID0gbmV3RXZlbnRMb2c7XG4gICAgICB9XG5cbiAgICAgIGV2ZW50TG9nLnNldChlbnRyaWVzLCBvZmZzZXQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0TG9nZ2luZ1Byb2ZpbGluZ0V2ZW50cygpIHtcbiAgICBldmVudExvZ1NpemUgPSBJTklUSUFMX0VWRU5UX0xPR19TSVpFO1xuICAgIGV2ZW50TG9nQnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGV2ZW50TG9nU2l6ZSAqIDQpO1xuICAgIGV2ZW50TG9nID0gbmV3IEludDMyQXJyYXkoZXZlbnRMb2dCdWZmZXIpO1xuICAgIGV2ZW50TG9nSW5kZXggPSAwO1xuICB9XG4gIGZ1bmN0aW9uIHN0b3BMb2dnaW5nUHJvZmlsaW5nRXZlbnRzKCkge1xuICAgIHZhciBidWZmZXIgPSBldmVudExvZ0J1ZmZlcjtcbiAgICBldmVudExvZ1NpemUgPSAwO1xuICAgIGV2ZW50TG9nQnVmZmVyID0gbnVsbDtcbiAgICBldmVudExvZyA9IG51bGw7XG4gICAgZXZlbnRMb2dJbmRleCA9IDA7XG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuICBmdW5jdGlvbiBtYXJrVGFza1N0YXJ0KHRhc2ssIG1zKSB7XG4gICAge1xuICAgICAgcHJvZmlsaW5nU3RhdGVbUVVFVUVfU0laRV0rKztcblxuICAgICAgaWYgKGV2ZW50TG9nICE9PSBudWxsKSB7XG4gICAgICAgIC8vIHBlcmZvcm1hbmNlLm5vdyByZXR1cm5zIGEgZmxvYXQsIHJlcHJlc2VudGluZyBtaWxsaXNlY29uZHMuIFdoZW4gdGhlXG4gICAgICAgIC8vIGV2ZW50IGlzIGxvZ2dlZCwgaXQncyBjb2VyY2VkIHRvIGFuIGludC4gQ29udmVydCB0byBtaWNyb3NlY29uZHMgdG9cbiAgICAgICAgLy8gbWFpbnRhaW4gZXh0cmEgZGVncmVlcyBvZiBwcmVjaXNpb24uXG4gICAgICAgIGxvZ0V2ZW50KFtUYXNrU3RhcnRFdmVudCwgbXMgKiAxMDAwLCB0YXNrLmlkLCB0YXNrLnByaW9yaXR5TGV2ZWxdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWFya1Rhc2tDb21wbGV0ZWQodGFzaywgbXMpIHtcbiAgICB7XG4gICAgICBwcm9maWxpbmdTdGF0ZVtQUklPUklUWV0gPSBOb1ByaW9yaXR5O1xuICAgICAgcHJvZmlsaW5nU3RhdGVbQ1VSUkVOVF9UQVNLX0lEXSA9IDA7XG4gICAgICBwcm9maWxpbmdTdGF0ZVtRVUVVRV9TSVpFXS0tO1xuXG4gICAgICBpZiAoZXZlbnRMb2cgIT09IG51bGwpIHtcbiAgICAgICAgbG9nRXZlbnQoW1Rhc2tDb21wbGV0ZUV2ZW50LCBtcyAqIDEwMDAsIHRhc2suaWRdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWFya1Rhc2tDYW5jZWxlZCh0YXNrLCBtcykge1xuICAgIHtcbiAgICAgIHByb2ZpbGluZ1N0YXRlW1FVRVVFX1NJWkVdLS07XG5cbiAgICAgIGlmIChldmVudExvZyAhPT0gbnVsbCkge1xuICAgICAgICBsb2dFdmVudChbVGFza0NhbmNlbEV2ZW50LCBtcyAqIDEwMDAsIHRhc2suaWRdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWFya1Rhc2tFcnJvcmVkKHRhc2ssIG1zKSB7XG4gICAge1xuICAgICAgcHJvZmlsaW5nU3RhdGVbUFJJT1JJVFldID0gTm9Qcmlvcml0eTtcbiAgICAgIHByb2ZpbGluZ1N0YXRlW0NVUlJFTlRfVEFTS19JRF0gPSAwO1xuICAgICAgcHJvZmlsaW5nU3RhdGVbUVVFVUVfU0laRV0tLTtcblxuICAgICAgaWYgKGV2ZW50TG9nICE9PSBudWxsKSB7XG4gICAgICAgIGxvZ0V2ZW50KFtUYXNrRXJyb3JFdmVudCwgbXMgKiAxMDAwLCB0YXNrLmlkXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1hcmtUYXNrUnVuKHRhc2ssIG1zKSB7XG4gICAge1xuICAgICAgcnVuSWRDb3VudGVyKys7XG4gICAgICBwcm9maWxpbmdTdGF0ZVtQUklPUklUWV0gPSB0YXNrLnByaW9yaXR5TGV2ZWw7XG4gICAgICBwcm9maWxpbmdTdGF0ZVtDVVJSRU5UX1RBU0tfSURdID0gdGFzay5pZDtcbiAgICAgIHByb2ZpbGluZ1N0YXRlW0NVUlJFTlRfUlVOX0lEXSA9IHJ1bklkQ291bnRlcjtcblxuICAgICAgaWYgKGV2ZW50TG9nICE9PSBudWxsKSB7XG4gICAgICAgIGxvZ0V2ZW50KFtUYXNrUnVuRXZlbnQsIG1zICogMTAwMCwgdGFzay5pZCwgcnVuSWRDb3VudGVyXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1hcmtUYXNrWWllbGQodGFzaywgbXMpIHtcbiAgICB7XG4gICAgICBwcm9maWxpbmdTdGF0ZVtQUklPUklUWV0gPSBOb1ByaW9yaXR5O1xuICAgICAgcHJvZmlsaW5nU3RhdGVbQ1VSUkVOVF9UQVNLX0lEXSA9IDA7XG4gICAgICBwcm9maWxpbmdTdGF0ZVtDVVJSRU5UX1JVTl9JRF0gPSAwO1xuXG4gICAgICBpZiAoZXZlbnRMb2cgIT09IG51bGwpIHtcbiAgICAgICAgbG9nRXZlbnQoW1Rhc2tZaWVsZEV2ZW50LCBtcyAqIDEwMDAsIHRhc2suaWQsIHJ1bklkQ291bnRlcl0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBtYXJrU2NoZWR1bGVyU3VzcGVuZGVkKG1zKSB7XG4gICAge1xuICAgICAgbWFpblRocmVhZElkQ291bnRlcisrO1xuXG4gICAgICBpZiAoZXZlbnRMb2cgIT09IG51bGwpIHtcbiAgICAgICAgbG9nRXZlbnQoW1NjaGVkdWxlclN1c3BlbmRFdmVudCwgbXMgKiAxMDAwLCBtYWluVGhyZWFkSWRDb3VudGVyXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1hcmtTY2hlZHVsZXJVbnN1c3BlbmRlZChtcykge1xuICAgIHtcbiAgICAgIGlmIChldmVudExvZyAhPT0gbnVsbCkge1xuICAgICAgICBsb2dFdmVudChbU2NoZWR1bGVyUmVzdW1lRXZlbnQsIG1zICogMTAwMCwgbWFpblRocmVhZElkQ291bnRlcl0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXZhciAqL1xuICAvLyBNYXRoLnBvdygyLCAzMCkgLSAxXG4gIC8vIDBiMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExXG5cbiAgdmFyIG1heFNpZ25lZDMxQml0SW50ID0gMTA3Mzc0MTgyMzsgLy8gVGltZXMgb3V0IGltbWVkaWF0ZWx5XG5cbiAgdmFyIElNTUVESUFURV9QUklPUklUWV9USU1FT1VUID0gLTE7IC8vIEV2ZW50dWFsbHkgdGltZXMgb3V0XG5cbiAgdmFyIFVTRVJfQkxPQ0tJTkdfUFJJT1JJVFkgPSAyNTA7XG4gIHZhciBOT1JNQUxfUFJJT1JJVFlfVElNRU9VVCA9IDUwMDA7XG4gIHZhciBMT1dfUFJJT1JJVFlfVElNRU9VVCA9IDEwMDAwOyAvLyBOZXZlciB0aW1lcyBvdXRcblxuICB2YXIgSURMRV9QUklPUklUWSA9IG1heFNpZ25lZDMxQml0SW50OyAvLyBUYXNrcyBhcmUgc3RvcmVkIG9uIGEgbWluIGhlYXBcblxuICB2YXIgdGFza1F1ZXVlID0gW107XG4gIHZhciB0aW1lclF1ZXVlID0gW107IC8vIEluY3JlbWVudGluZyBpZCBjb3VudGVyLiBVc2VkIHRvIG1haW50YWluIGluc2VydGlvbiBvcmRlci5cblxuICB2YXIgdGFza0lkQ291bnRlciA9IDE7IC8vIFBhdXNpbmcgdGhlIHNjaGVkdWxlciBpcyB1c2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAgdmFyIGN1cnJlbnRUYXNrID0gbnVsbDtcbiAgdmFyIGN1cnJlbnRQcmlvcml0eUxldmVsID0gTm9ybWFsUHJpb3JpdHk7IC8vIFRoaXMgaXMgc2V0IHdoaWxlIHBlcmZvcm1pbmcgd29yaywgdG8gcHJldmVudCByZS1lbnRyYW5jeS5cblxuICB2YXIgaXNQZXJmb3JtaW5nV29yayA9IGZhbHNlO1xuICB2YXIgaXNIb3N0Q2FsbGJhY2tTY2hlZHVsZWQgPSBmYWxzZTtcbiAgdmFyIGlzSG9zdFRpbWVvdXRTY2hlZHVsZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBhZHZhbmNlVGltZXJzKGN1cnJlbnRUaW1lKSB7XG4gICAgLy8gQ2hlY2sgZm9yIHRhc2tzIHRoYXQgYXJlIG5vIGxvbmdlciBkZWxheWVkIGFuZCBhZGQgdGhlbSB0byB0aGUgcXVldWUuXG4gICAgdmFyIHRpbWVyID0gcGVlayh0aW1lclF1ZXVlKTtcblxuICAgIHdoaWxlICh0aW1lciAhPT0gbnVsbCkge1xuICAgICAgaWYgKHRpbWVyLmNhbGxiYWNrID09PSBudWxsKSB7XG4gICAgICAgIC8vIFRpbWVyIHdhcyBjYW5jZWxsZWQuXG4gICAgICAgIHBvcCh0aW1lclF1ZXVlKTtcbiAgICAgIH0gZWxzZSBpZiAodGltZXIuc3RhcnRUaW1lIDw9IGN1cnJlbnRUaW1lKSB7XG4gICAgICAgIC8vIFRpbWVyIGZpcmVkLiBUcmFuc2ZlciB0byB0aGUgdGFzayBxdWV1ZS5cbiAgICAgICAgcG9wKHRpbWVyUXVldWUpO1xuICAgICAgICB0aW1lci5zb3J0SW5kZXggPSB0aW1lci5leHBpcmF0aW9uVGltZTtcbiAgICAgICAgcHVzaCh0YXNrUXVldWUsIHRpbWVyKTtcblxuICAgICAgICB7XG4gICAgICAgICAgbWFya1Rhc2tTdGFydCh0aW1lciwgY3VycmVudFRpbWUpO1xuICAgICAgICAgIHRpbWVyLmlzUXVldWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUmVtYWluaW5nIHRpbWVycyBhcmUgcGVuZGluZy5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aW1lciA9IHBlZWsodGltZXJRdWV1ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlVGltZW91dChjdXJyZW50VGltZSkge1xuICAgIGlzSG9zdFRpbWVvdXRTY2hlZHVsZWQgPSBmYWxzZTtcbiAgICBhZHZhbmNlVGltZXJzKGN1cnJlbnRUaW1lKTtcblxuICAgIGlmICghaXNIb3N0Q2FsbGJhY2tTY2hlZHVsZWQpIHtcbiAgICAgIGlmIChwZWVrKHRhc2tRdWV1ZSkgIT09IG51bGwpIHtcbiAgICAgICAgaXNIb3N0Q2FsbGJhY2tTY2hlZHVsZWQgPSB0cnVlO1xuICAgICAgICByZXF1ZXN0SG9zdENhbGxiYWNrKGZsdXNoV29yayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZmlyc3RUaW1lciA9IHBlZWsodGltZXJRdWV1ZSk7XG5cbiAgICAgICAgaWYgKGZpcnN0VGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgICByZXF1ZXN0SG9zdFRpbWVvdXQoaGFuZGxlVGltZW91dCwgZmlyc3RUaW1lci5zdGFydFRpbWUgLSBjdXJyZW50VGltZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaFdvcmsoaGFzVGltZVJlbWFpbmluZywgaW5pdGlhbFRpbWUpIHtcbiAgICB7XG4gICAgICBtYXJrU2NoZWR1bGVyVW5zdXNwZW5kZWQoaW5pdGlhbFRpbWUpO1xuICAgIH0gLy8gV2UnbGwgbmVlZCBhIGhvc3QgY2FsbGJhY2sgdGhlIG5leHQgdGltZSB3b3JrIGlzIHNjaGVkdWxlZC5cblxuXG4gICAgaXNIb3N0Q2FsbGJhY2tTY2hlZHVsZWQgPSBmYWxzZTtcblxuICAgIGlmIChpc0hvc3RUaW1lb3V0U2NoZWR1bGVkKSB7XG4gICAgICAvLyBXZSBzY2hlZHVsZWQgYSB0aW1lb3V0IGJ1dCBpdCdzIG5vIGxvbmdlciBuZWVkZWQuIENhbmNlbCBpdC5cbiAgICAgIGlzSG9zdFRpbWVvdXRTY2hlZHVsZWQgPSBmYWxzZTtcbiAgICAgIGNhbmNlbEhvc3RUaW1lb3V0KCk7XG4gICAgfVxuXG4gICAgaXNQZXJmb3JtaW5nV29yayA9IHRydWU7XG4gICAgdmFyIHByZXZpb3VzUHJpb3JpdHlMZXZlbCA9IGN1cnJlbnRQcmlvcml0eUxldmVsO1xuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChlbmFibGVQcm9maWxpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gd29ya0xvb3AoaGFzVGltZVJlbWFpbmluZywgaW5pdGlhbFRpbWUpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmIChjdXJyZW50VGFzayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZ2V0Q3VycmVudFRpbWUoKTtcbiAgICAgICAgICAgIG1hcmtUYXNrRXJyb3JlZChjdXJyZW50VGFzaywgY3VycmVudFRpbWUpO1xuICAgICAgICAgICAgY3VycmVudFRhc2suaXNRdWV1ZWQgPSBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTm8gY2F0Y2ggaW4gcHJvZCBjb2RlcGF0aC5cbiAgICAgICAgcmV0dXJuIHdvcmtMb29wKGhhc1RpbWVSZW1haW5pbmcsIGluaXRpYWxUaW1lKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgY3VycmVudFRhc2sgPSBudWxsO1xuICAgICAgY3VycmVudFByaW9yaXR5TGV2ZWwgPSBwcmV2aW91c1ByaW9yaXR5TGV2ZWw7XG4gICAgICBpc1BlcmZvcm1pbmdXb3JrID0gZmFsc2U7XG5cbiAgICAgIHtcbiAgICAgICAgdmFyIF9jdXJyZW50VGltZSA9IGdldEN1cnJlbnRUaW1lKCk7XG5cbiAgICAgICAgbWFya1NjaGVkdWxlclN1c3BlbmRlZChfY3VycmVudFRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHdvcmtMb29wKGhhc1RpbWVSZW1haW5pbmcsIGluaXRpYWxUaW1lKSB7XG4gICAgdmFyIGN1cnJlbnRUaW1lID0gaW5pdGlhbFRpbWU7XG4gICAgYWR2YW5jZVRpbWVycyhjdXJyZW50VGltZSk7XG4gICAgY3VycmVudFRhc2sgPSBwZWVrKHRhc2tRdWV1ZSk7XG5cbiAgICB3aGlsZSAoY3VycmVudFRhc2sgIT09IG51bGwgJiYgIShlbmFibGVTY2hlZHVsZXJEZWJ1Z2dpbmcgKSkge1xuICAgICAgaWYgKGN1cnJlbnRUYXNrLmV4cGlyYXRpb25UaW1lID4gY3VycmVudFRpbWUgJiYgKCFoYXNUaW1lUmVtYWluaW5nIHx8IHNob3VsZFlpZWxkVG9Ib3N0KCkpKSB7XG4gICAgICAgIC8vIFRoaXMgY3VycmVudFRhc2sgaGFzbid0IGV4cGlyZWQsIGFuZCB3ZSd2ZSByZWFjaGVkIHRoZSBkZWFkbGluZS5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHZhciBjYWxsYmFjayA9IGN1cnJlbnRUYXNrLmNhbGxiYWNrO1xuXG4gICAgICBpZiAoY2FsbGJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgY3VycmVudFRhc2suY2FsbGJhY2sgPSBudWxsO1xuICAgICAgICBjdXJyZW50UHJpb3JpdHlMZXZlbCA9IGN1cnJlbnRUYXNrLnByaW9yaXR5TGV2ZWw7XG4gICAgICAgIHZhciBkaWRVc2VyQ2FsbGJhY2tUaW1lb3V0ID0gY3VycmVudFRhc2suZXhwaXJhdGlvblRpbWUgPD0gY3VycmVudFRpbWU7XG4gICAgICAgIG1hcmtUYXNrUnVuKGN1cnJlbnRUYXNrLCBjdXJyZW50VGltZSk7XG4gICAgICAgIHZhciBjb250aW51YXRpb25DYWxsYmFjayA9IGNhbGxiYWNrKGRpZFVzZXJDYWxsYmFja1RpbWVvdXQpO1xuICAgICAgICBjdXJyZW50VGltZSA9IGdldEN1cnJlbnRUaW1lKCk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjb250aW51YXRpb25DYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGN1cnJlbnRUYXNrLmNhbGxiYWNrID0gY29udGludWF0aW9uQ2FsbGJhY2s7XG4gICAgICAgICAgbWFya1Rhc2tZaWVsZChjdXJyZW50VGFzaywgY3VycmVudFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1hcmtUYXNrQ29tcGxldGVkKGN1cnJlbnRUYXNrLCBjdXJyZW50VGltZSk7XG4gICAgICAgICAgICBjdXJyZW50VGFzay5pc1F1ZXVlZCA9IGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjdXJyZW50VGFzayA9PT0gcGVlayh0YXNrUXVldWUpKSB7XG4gICAgICAgICAgICBwb3AodGFza1F1ZXVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhZHZhbmNlVGltZXJzKGN1cnJlbnRUaW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvcCh0YXNrUXVldWUpO1xuICAgICAgfVxuXG4gICAgICBjdXJyZW50VGFzayA9IHBlZWsodGFza1F1ZXVlKTtcbiAgICB9IC8vIFJldHVybiB3aGV0aGVyIHRoZXJlJ3MgYWRkaXRpb25hbCB3b3JrXG5cblxuICAgIGlmIChjdXJyZW50VGFzayAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBmaXJzdFRpbWVyID0gcGVlayh0aW1lclF1ZXVlKTtcblxuICAgICAgaWYgKGZpcnN0VGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgcmVxdWVzdEhvc3RUaW1lb3V0KGhhbmRsZVRpbWVvdXQsIGZpcnN0VGltZXIuc3RhcnRUaW1lIC0gY3VycmVudFRpbWUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdW5zdGFibGVfcnVuV2l0aFByaW9yaXR5KHByaW9yaXR5TGV2ZWwsIGV2ZW50SGFuZGxlcikge1xuICAgIHN3aXRjaCAocHJpb3JpdHlMZXZlbCkge1xuICAgICAgY2FzZSBJbW1lZGlhdGVQcmlvcml0eTpcbiAgICAgIGNhc2UgVXNlckJsb2NraW5nUHJpb3JpdHk6XG4gICAgICBjYXNlIE5vcm1hbFByaW9yaXR5OlxuICAgICAgY2FzZSBMb3dQcmlvcml0eTpcbiAgICAgIGNhc2UgSWRsZVByaW9yaXR5OlxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcHJpb3JpdHlMZXZlbCA9IE5vcm1hbFByaW9yaXR5O1xuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1ByaW9yaXR5TGV2ZWwgPSBjdXJyZW50UHJpb3JpdHlMZXZlbDtcbiAgICBjdXJyZW50UHJpb3JpdHlMZXZlbCA9IHByaW9yaXR5TGV2ZWw7XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGV2ZW50SGFuZGxlcigpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjdXJyZW50UHJpb3JpdHlMZXZlbCA9IHByZXZpb3VzUHJpb3JpdHlMZXZlbDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bnN0YWJsZV9uZXh0KGV2ZW50SGFuZGxlcikge1xuICAgIHZhciBwcmlvcml0eUxldmVsO1xuXG4gICAgc3dpdGNoIChjdXJyZW50UHJpb3JpdHlMZXZlbCkge1xuICAgICAgY2FzZSBJbW1lZGlhdGVQcmlvcml0eTpcbiAgICAgIGNhc2UgVXNlckJsb2NraW5nUHJpb3JpdHk6XG4gICAgICBjYXNlIE5vcm1hbFByaW9yaXR5OlxuICAgICAgICAvLyBTaGlmdCBkb3duIHRvIG5vcm1hbCBwcmlvcml0eVxuICAgICAgICBwcmlvcml0eUxldmVsID0gTm9ybWFsUHJpb3JpdHk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBBbnl0aGluZyBsb3dlciB0aGFuIG5vcm1hbCBwcmlvcml0eSBzaG91bGQgcmVtYWluIGF0IHRoZSBjdXJyZW50IGxldmVsLlxuICAgICAgICBwcmlvcml0eUxldmVsID0gY3VycmVudFByaW9yaXR5TGV2ZWw7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1ByaW9yaXR5TGV2ZWwgPSBjdXJyZW50UHJpb3JpdHlMZXZlbDtcbiAgICBjdXJyZW50UHJpb3JpdHlMZXZlbCA9IHByaW9yaXR5TGV2ZWw7XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGV2ZW50SGFuZGxlcigpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjdXJyZW50UHJpb3JpdHlMZXZlbCA9IHByZXZpb3VzUHJpb3JpdHlMZXZlbDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bnN0YWJsZV93cmFwQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICB2YXIgcGFyZW50UHJpb3JpdHlMZXZlbCA9IGN1cnJlbnRQcmlvcml0eUxldmVsO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgZm9yayBvZiBydW5XaXRoUHJpb3JpdHksIGlubGluZWQgZm9yIHBlcmZvcm1hbmNlLlxuICAgICAgdmFyIHByZXZpb3VzUHJpb3JpdHlMZXZlbCA9IGN1cnJlbnRQcmlvcml0eUxldmVsO1xuICAgICAgY3VycmVudFByaW9yaXR5TGV2ZWwgPSBwYXJlbnRQcmlvcml0eUxldmVsO1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGN1cnJlbnRQcmlvcml0eUxldmVsID0gcHJldmlvdXNQcmlvcml0eUxldmVsO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lb3V0Rm9yUHJpb3JpdHlMZXZlbChwcmlvcml0eUxldmVsKSB7XG4gICAgc3dpdGNoIChwcmlvcml0eUxldmVsKSB7XG4gICAgICBjYXNlIEltbWVkaWF0ZVByaW9yaXR5OlxuICAgICAgICByZXR1cm4gSU1NRURJQVRFX1BSSU9SSVRZX1RJTUVPVVQ7XG5cbiAgICAgIGNhc2UgVXNlckJsb2NraW5nUHJpb3JpdHk6XG4gICAgICAgIHJldHVybiBVU0VSX0JMT0NLSU5HX1BSSU9SSVRZO1xuXG4gICAgICBjYXNlIElkbGVQcmlvcml0eTpcbiAgICAgICAgcmV0dXJuIElETEVfUFJJT1JJVFk7XG5cbiAgICAgIGNhc2UgTG93UHJpb3JpdHk6XG4gICAgICAgIHJldHVybiBMT1dfUFJJT1JJVFlfVElNRU9VVDtcblxuICAgICAgY2FzZSBOb3JtYWxQcmlvcml0eTpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBOT1JNQUxfUFJJT1JJVFlfVElNRU9VVDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bnN0YWJsZV9zY2hlZHVsZUNhbGxiYWNrKHByaW9yaXR5TGV2ZWwsIGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgdmFyIGN1cnJlbnRUaW1lID0gZ2V0Q3VycmVudFRpbWUoKTtcbiAgICB2YXIgc3RhcnRUaW1lO1xuICAgIHZhciB0aW1lb3V0O1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICB2YXIgZGVsYXkgPSBvcHRpb25zLmRlbGF5O1xuXG4gICAgICBpZiAodHlwZW9mIGRlbGF5ID09PSAnbnVtYmVyJyAmJiBkZWxheSA+IDApIHtcbiAgICAgICAgc3RhcnRUaW1lID0gY3VycmVudFRpbWUgKyBkZWxheTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgfVxuXG4gICAgICB0aW1lb3V0ID0gdHlwZW9mIG9wdGlvbnMudGltZW91dCA9PT0gJ251bWJlcicgPyBvcHRpb25zLnRpbWVvdXQgOiB0aW1lb3V0Rm9yUHJpb3JpdHlMZXZlbChwcmlvcml0eUxldmVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZW91dCA9IHRpbWVvdXRGb3JQcmlvcml0eUxldmVsKHByaW9yaXR5TGV2ZWwpO1xuICAgICAgc3RhcnRUaW1lID0gY3VycmVudFRpbWU7XG4gICAgfVxuXG4gICAgdmFyIGV4cGlyYXRpb25UaW1lID0gc3RhcnRUaW1lICsgdGltZW91dDtcbiAgICB2YXIgbmV3VGFzayA9IHtcbiAgICAgIGlkOiB0YXNrSWRDb3VudGVyKyssXG4gICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICBwcmlvcml0eUxldmVsOiBwcmlvcml0eUxldmVsLFxuICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUsXG4gICAgICBleHBpcmF0aW9uVGltZTogZXhwaXJhdGlvblRpbWUsXG4gICAgICBzb3J0SW5kZXg6IC0xXG4gICAgfTtcblxuICAgIHtcbiAgICAgIG5ld1Rhc2suaXNRdWV1ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc3RhcnRUaW1lID4gY3VycmVudFRpbWUpIHtcbiAgICAgIC8vIFRoaXMgaXMgYSBkZWxheWVkIHRhc2suXG4gICAgICBuZXdUYXNrLnNvcnRJbmRleCA9IHN0YXJ0VGltZTtcbiAgICAgIHB1c2godGltZXJRdWV1ZSwgbmV3VGFzayk7XG5cbiAgICAgIGlmIChwZWVrKHRhc2tRdWV1ZSkgPT09IG51bGwgJiYgbmV3VGFzayA9PT0gcGVlayh0aW1lclF1ZXVlKSkge1xuICAgICAgICAvLyBBbGwgdGFza3MgYXJlIGRlbGF5ZWQsIGFuZCB0aGlzIGlzIHRoZSB0YXNrIHdpdGggdGhlIGVhcmxpZXN0IGRlbGF5LlxuICAgICAgICBpZiAoaXNIb3N0VGltZW91dFNjaGVkdWxlZCkge1xuICAgICAgICAgIC8vIENhbmNlbCBhbiBleGlzdGluZyB0aW1lb3V0LlxuICAgICAgICAgIGNhbmNlbEhvc3RUaW1lb3V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNIb3N0VGltZW91dFNjaGVkdWxlZCA9IHRydWU7XG4gICAgICAgIH0gLy8gU2NoZWR1bGUgYSB0aW1lb3V0LlxuXG5cbiAgICAgICAgcmVxdWVzdEhvc3RUaW1lb3V0KGhhbmRsZVRpbWVvdXQsIHN0YXJ0VGltZSAtIGN1cnJlbnRUaW1lKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbmV3VGFzay5zb3J0SW5kZXggPSBleHBpcmF0aW9uVGltZTtcbiAgICAgIHB1c2godGFza1F1ZXVlLCBuZXdUYXNrKTtcblxuICAgICAge1xuICAgICAgICBtYXJrVGFza1N0YXJ0KG5ld1Rhc2ssIGN1cnJlbnRUaW1lKTtcbiAgICAgICAgbmV3VGFzay5pc1F1ZXVlZCA9IHRydWU7XG4gICAgICB9IC8vIFNjaGVkdWxlIGEgaG9zdCBjYWxsYmFjaywgaWYgbmVlZGVkLiBJZiB3ZSdyZSBhbHJlYWR5IHBlcmZvcm1pbmcgd29yayxcbiAgICAgIC8vIHdhaXQgdW50aWwgdGhlIG5leHQgdGltZSB3ZSB5aWVsZC5cblxuXG4gICAgICBpZiAoIWlzSG9zdENhbGxiYWNrU2NoZWR1bGVkICYmICFpc1BlcmZvcm1pbmdXb3JrKSB7XG4gICAgICAgIGlzSG9zdENhbGxiYWNrU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgICAgcmVxdWVzdEhvc3RDYWxsYmFjayhmbHVzaFdvcmspO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXdUYXNrO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5zdGFibGVfcGF1c2VFeGVjdXRpb24oKSB7XG4gIH1cblxuICBmdW5jdGlvbiB1bnN0YWJsZV9jb250aW51ZUV4ZWN1dGlvbigpIHtcblxuICAgIGlmICghaXNIb3N0Q2FsbGJhY2tTY2hlZHVsZWQgJiYgIWlzUGVyZm9ybWluZ1dvcmspIHtcbiAgICAgIGlzSG9zdENhbGxiYWNrU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgIHJlcXVlc3RIb3N0Q2FsbGJhY2soZmx1c2hXb3JrKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bnN0YWJsZV9nZXRGaXJzdENhbGxiYWNrTm9kZSgpIHtcbiAgICByZXR1cm4gcGVlayh0YXNrUXVldWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5zdGFibGVfY2FuY2VsQ2FsbGJhY2sodGFzaykge1xuICAgIHtcbiAgICAgIGlmICh0YXNrLmlzUXVldWVkKSB7XG4gICAgICAgIHZhciBjdXJyZW50VGltZSA9IGdldEN1cnJlbnRUaW1lKCk7XG4gICAgICAgIG1hcmtUYXNrQ2FuY2VsZWQodGFzaywgY3VycmVudFRpbWUpO1xuICAgICAgICB0YXNrLmlzUXVldWVkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSAvLyBOdWxsIG91dCB0aGUgY2FsbGJhY2sgdG8gaW5kaWNhdGUgdGhlIHRhc2sgaGFzIGJlZW4gY2FuY2VsZWQuIChDYW4ndFxuICAgIC8vIHJlbW92ZSBmcm9tIHRoZSBxdWV1ZSBiZWNhdXNlIHlvdSBjYW4ndCByZW1vdmUgYXJiaXRyYXJ5IG5vZGVzIGZyb20gYW5cbiAgICAvLyBhcnJheSBiYXNlZCBoZWFwLCBvbmx5IHRoZSBmaXJzdCBvbmUuKVxuXG5cbiAgICB0YXNrLmNhbGxiYWNrID0gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuc3RhYmxlX2dldEN1cnJlbnRQcmlvcml0eUxldmVsKCkge1xuICAgIHJldHVybiBjdXJyZW50UHJpb3JpdHlMZXZlbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuc3RhYmxlX3Nob3VsZFlpZWxkKCkge1xuICAgIHZhciBjdXJyZW50VGltZSA9IGdldEN1cnJlbnRUaW1lKCk7XG4gICAgYWR2YW5jZVRpbWVycyhjdXJyZW50VGltZSk7XG4gICAgdmFyIGZpcnN0VGFzayA9IHBlZWsodGFza1F1ZXVlKTtcbiAgICByZXR1cm4gZmlyc3RUYXNrICE9PSBjdXJyZW50VGFzayAmJiBjdXJyZW50VGFzayAhPT0gbnVsbCAmJiBmaXJzdFRhc2sgIT09IG51bGwgJiYgZmlyc3RUYXNrLmNhbGxiYWNrICE9PSBudWxsICYmIGZpcnN0VGFzay5zdGFydFRpbWUgPD0gY3VycmVudFRpbWUgJiYgZmlyc3RUYXNrLmV4cGlyYXRpb25UaW1lIDwgY3VycmVudFRhc2suZXhwaXJhdGlvblRpbWUgfHwgc2hvdWxkWWllbGRUb0hvc3QoKTtcbiAgfVxuXG4gIHZhciB1bnN0YWJsZV9yZXF1ZXN0UGFpbnQgPSByZXF1ZXN0UGFpbnQ7XG4gIHZhciB1bnN0YWJsZV9Qcm9maWxpbmcgPSAge1xuICAgIHN0YXJ0TG9nZ2luZ1Byb2ZpbGluZ0V2ZW50czogc3RhcnRMb2dnaW5nUHJvZmlsaW5nRXZlbnRzLFxuICAgIHN0b3BMb2dnaW5nUHJvZmlsaW5nRXZlbnRzOiBzdG9wTG9nZ2luZ1Byb2ZpbGluZ0V2ZW50cyxcbiAgICBzaGFyZWRQcm9maWxpbmdCdWZmZXI6IHNoYXJlZFByb2ZpbGluZ0J1ZmZlclxuICB9IDtcblxuXG5cbiAgdmFyIFNjaGVkdWxlciA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcbiAgICBfX3Byb3RvX186IG51bGwsXG4gICAgdW5zdGFibGVfSW1tZWRpYXRlUHJpb3JpdHk6IEltbWVkaWF0ZVByaW9yaXR5LFxuICAgIHVuc3RhYmxlX1VzZXJCbG9ja2luZ1ByaW9yaXR5OiBVc2VyQmxvY2tpbmdQcmlvcml0eSxcbiAgICB1bnN0YWJsZV9Ob3JtYWxQcmlvcml0eTogTm9ybWFsUHJpb3JpdHksXG4gICAgdW5zdGFibGVfSWRsZVByaW9yaXR5OiBJZGxlUHJpb3JpdHksXG4gICAgdW5zdGFibGVfTG93UHJpb3JpdHk6IExvd1ByaW9yaXR5LFxuICAgIHVuc3RhYmxlX3J1bldpdGhQcmlvcml0eTogdW5zdGFibGVfcnVuV2l0aFByaW9yaXR5LFxuICAgIHVuc3RhYmxlX25leHQ6IHVuc3RhYmxlX25leHQsXG4gICAgdW5zdGFibGVfc2NoZWR1bGVDYWxsYmFjazogdW5zdGFibGVfc2NoZWR1bGVDYWxsYmFjayxcbiAgICB1bnN0YWJsZV9jYW5jZWxDYWxsYmFjazogdW5zdGFibGVfY2FuY2VsQ2FsbGJhY2ssXG4gICAgdW5zdGFibGVfd3JhcENhbGxiYWNrOiB1bnN0YWJsZV93cmFwQ2FsbGJhY2ssXG4gICAgdW5zdGFibGVfZ2V0Q3VycmVudFByaW9yaXR5TGV2ZWw6IHVuc3RhYmxlX2dldEN1cnJlbnRQcmlvcml0eUxldmVsLFxuICAgIHVuc3RhYmxlX3Nob3VsZFlpZWxkOiB1bnN0YWJsZV9zaG91bGRZaWVsZCxcbiAgICB1bnN0YWJsZV9yZXF1ZXN0UGFpbnQ6IHVuc3RhYmxlX3JlcXVlc3RQYWludCxcbiAgICB1bnN0YWJsZV9jb250aW51ZUV4ZWN1dGlvbjogdW5zdGFibGVfY29udGludWVFeGVjdXRpb24sXG4gICAgdW5zdGFibGVfcGF1c2VFeGVjdXRpb246IHVuc3RhYmxlX3BhdXNlRXhlY3V0aW9uLFxuICAgIHVuc3RhYmxlX2dldEZpcnN0Q2FsbGJhY2tOb2RlOiB1bnN0YWJsZV9nZXRGaXJzdENhbGxiYWNrTm9kZSxcbiAgICBnZXQgdW5zdGFibGVfbm93ICgpIHsgcmV0dXJuIGdldEN1cnJlbnRUaW1lOyB9LFxuICAgIGdldCB1bnN0YWJsZV9mb3JjZUZyYW1lUmF0ZSAoKSB7IHJldHVybiBmb3JjZUZyYW1lUmF0ZTsgfSxcbiAgICB1bnN0YWJsZV9Qcm9maWxpbmc6IHVuc3RhYmxlX1Byb2ZpbGluZ1xuICB9KTtcblxuICB2YXIgREVGQVVMVF9USFJFQURfSUQgPSAwOyAvLyBDb3VudGVycyB1c2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRHMuXG5cbiAgdmFyIGludGVyYWN0aW9uSURDb3VudGVyID0gMDtcbiAgdmFyIHRocmVhZElEQ291bnRlciA9IDA7IC8vIFNldCBvZiBjdXJyZW50bHkgdHJhY2VkIGludGVyYWN0aW9ucy5cbiAgLy8gSW50ZXJhY3Rpb25zIFwic3RhY2tcIuKAk1xuICAvLyBNZWFuaW5nIHRoYXQgbmV3bHkgdHJhY2VkIGludGVyYWN0aW9ucyBhcmUgYXBwZW5kZWQgdG8gdGhlIHByZXZpb3VzbHkgYWN0aXZlIHNldC5cbiAgLy8gV2hlbiBhbiBpbnRlcmFjdGlvbiBnb2VzIG91dCBvZiBzY29wZSwgdGhlIHByZXZpb3VzIHNldCAoaWYgYW55KSBpcyByZXN0b3JlZC5cblxuICB2YXIgaW50ZXJhY3Rpb25zUmVmID0gbnVsbDsgLy8gTGlzdGVuZXIocykgdG8gbm90aWZ5IHdoZW4gaW50ZXJhY3Rpb25zIGJlZ2luIGFuZCBlbmQuXG5cbiAgdmFyIHN1YnNjcmliZXJSZWYgPSBudWxsO1xuXG4gIHtcbiAgICBpbnRlcmFjdGlvbnNSZWYgPSB7XG4gICAgICBjdXJyZW50OiBuZXcgU2V0KClcbiAgICB9O1xuICAgIHN1YnNjcmliZXJSZWYgPSB7XG4gICAgICBjdXJyZW50OiBudWxsXG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiB1bnN0YWJsZV9jbGVhcihjYWxsYmFjaykge1xuXG4gICAgdmFyIHByZXZJbnRlcmFjdGlvbnMgPSBpbnRlcmFjdGlvbnNSZWYuY3VycmVudDtcbiAgICBpbnRlcmFjdGlvbnNSZWYuY3VycmVudCA9IG5ldyBTZXQoKTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQgPSBwcmV2SW50ZXJhY3Rpb25zO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB1bnN0YWJsZV9nZXRDdXJyZW50KCkge1xuICAgIHtcbiAgICAgIHJldHVybiBpbnRlcmFjdGlvbnNSZWYuY3VycmVudDtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdW5zdGFibGVfZ2V0VGhyZWFkSUQoKSB7XG4gICAgcmV0dXJuICsrdGhyZWFkSURDb3VudGVyO1xuICB9XG4gIGZ1bmN0aW9uIHVuc3RhYmxlX3RyYWNlKG5hbWUsIHRpbWVzdGFtcCwgY2FsbGJhY2spIHtcbiAgICB2YXIgdGhyZWFkSUQgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IERFRkFVTFRfVEhSRUFEX0lEO1xuXG4gICAgdmFyIGludGVyYWN0aW9uID0ge1xuICAgICAgX19jb3VudDogMSxcbiAgICAgIGlkOiBpbnRlcmFjdGlvbklEQ291bnRlcisrLFxuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wXG4gICAgfTtcbiAgICB2YXIgcHJldkludGVyYWN0aW9ucyA9IGludGVyYWN0aW9uc1JlZi5jdXJyZW50OyAvLyBUcmFjZWQgaW50ZXJhY3Rpb25zIHNob3VsZCBzdGFjay9hY2N1bXVsYXRlLlxuICAgIC8vIFRvIGRvIHRoYXQsIGNsb25lIHRoZSBjdXJyZW50IGludGVyYWN0aW9ucy5cbiAgICAvLyBUaGUgcHJldmlvdXMgc2V0IHdpbGwgYmUgcmVzdG9yZWQgdXBvbiBjb21wbGV0aW9uLlxuXG4gICAgdmFyIGludGVyYWN0aW9ucyA9IG5ldyBTZXQocHJldkludGVyYWN0aW9ucyk7XG4gICAgaW50ZXJhY3Rpb25zLmFkZChpbnRlcmFjdGlvbik7XG4gICAgaW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQgPSBpbnRlcmFjdGlvbnM7XG4gICAgdmFyIHN1YnNjcmliZXIgPSBzdWJzY3JpYmVyUmVmLmN1cnJlbnQ7XG4gICAgdmFyIHJldHVyblZhbHVlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChzdWJzY3JpYmVyICE9PSBudWxsKSB7XG4gICAgICAgIHN1YnNjcmliZXIub25JbnRlcmFjdGlvblRyYWNlZChpbnRlcmFjdGlvbik7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChzdWJzY3JpYmVyICE9PSBudWxsKSB7XG4gICAgICAgICAgc3Vic2NyaWJlci5vbldvcmtTdGFydGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVyblZhbHVlID0gY2FsbGJhY2soKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpbnRlcmFjdGlvbnNSZWYuY3VycmVudCA9IHByZXZJbnRlcmFjdGlvbnM7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHN1YnNjcmliZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgc3Vic2NyaWJlci5vbldvcmtTdG9wcGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpbnRlcmFjdGlvbi5fX2NvdW50LS07IC8vIElmIG5vIGFzeW5jIHdvcmsgd2FzIHNjaGVkdWxlZCBmb3IgdGhpcyBpbnRlcmFjdGlvbixcbiAgICAgICAgICAgIC8vIE5vdGlmeSBzdWJzY3JpYmVycyB0aGF0IGl0J3MgY29tcGxldGVkLlxuXG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlciAhPT0gbnVsbCAmJiBpbnRlcmFjdGlvbi5fX2NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgIHN1YnNjcmliZXIub25JbnRlcmFjdGlvblNjaGVkdWxlZFdvcmtDb21wbGV0ZWQoaW50ZXJhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfVxuICBmdW5jdGlvbiB1bnN0YWJsZV93cmFwKGNhbGxiYWNrKSB7XG4gICAgdmFyIHRocmVhZElEID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBERUZBVUxUX1RIUkVBRF9JRDtcblxuICAgIHZhciB3cmFwcGVkSW50ZXJhY3Rpb25zID0gaW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQ7XG4gICAgdmFyIHN1YnNjcmliZXIgPSBzdWJzY3JpYmVyUmVmLmN1cnJlbnQ7XG5cbiAgICBpZiAoc3Vic2NyaWJlciAhPT0gbnVsbCkge1xuICAgICAgc3Vic2NyaWJlci5vbldvcmtTY2hlZHVsZWQod3JhcHBlZEludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICAgIH0gLy8gVXBkYXRlIHRoZSBwZW5kaW5nIGFzeW5jIHdvcmsgY291bnQgZm9yIHRoZSBjdXJyZW50IGludGVyYWN0aW9ucy5cbiAgICAvLyBVcGRhdGUgYWZ0ZXIgY2FsbGluZyBzdWJzY3JpYmVycyBpbiBjYXNlIG9mIGVycm9yLlxuXG5cbiAgICB3cmFwcGVkSW50ZXJhY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGludGVyYWN0aW9uKSB7XG4gICAgICBpbnRlcmFjdGlvbi5fX2NvdW50Kys7XG4gICAgfSk7XG4gICAgdmFyIGhhc1J1biA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gd3JhcHBlZCgpIHtcbiAgICAgIHZhciBwcmV2SW50ZXJhY3Rpb25zID0gaW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQ7XG4gICAgICBpbnRlcmFjdGlvbnNSZWYuY3VycmVudCA9IHdyYXBwZWRJbnRlcmFjdGlvbnM7XG4gICAgICBzdWJzY3JpYmVyID0gc3Vic2NyaWJlclJlZi5jdXJyZW50O1xuXG4gICAgICB0cnkge1xuICAgICAgICB2YXIgcmV0dXJuVmFsdWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoc3Vic2NyaWJlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5vbldvcmtTdGFydGVkKHdyYXBwZWRJbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVyblZhbHVlID0gY2FsbGJhY2suYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpbnRlcmFjdGlvbnNSZWYuY3VycmVudCA9IHByZXZJbnRlcmFjdGlvbnM7XG5cbiAgICAgICAgICAgIGlmIChzdWJzY3JpYmVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHN1YnNjcmliZXIub25Xb3JrU3RvcHBlZCh3cmFwcGVkSW50ZXJhY3Rpb25zLCB0aHJlYWRJRCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKCFoYXNSdW4pIHtcbiAgICAgICAgICAvLyBXZSBvbmx5IGV4cGVjdCBhIHdyYXBwZWQgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgb25jZSxcbiAgICAgICAgICAvLyBCdXQgaW4gdGhlIGV2ZW50IHRoYXQgaXQncyBleGVjdXRlZCBtb3JlIHRoYW4gb25jZeKAk1xuICAgICAgICAgIC8vIE9ubHkgZGVjcmVtZW50IHRoZSBvdXRzdGFuZGluZyBpbnRlcmFjdGlvbiBjb3VudHMgb25jZS5cbiAgICAgICAgICBoYXNSdW4gPSB0cnVlOyAvLyBVcGRhdGUgcGVuZGluZyBhc3luYyBjb3VudHMgZm9yIGFsbCB3cmFwcGVkIGludGVyYWN0aW9ucy5cbiAgICAgICAgICAvLyBJZiB0aGlzIHdhcyB0aGUgbGFzdCBzY2hlZHVsZWQgYXN5bmMgd29yayBmb3IgYW55IG9mIHRoZW0sXG4gICAgICAgICAgLy8gTWFyayB0aGVtIGFzIGNvbXBsZXRlZC5cblxuICAgICAgICAgIHdyYXBwZWRJbnRlcmFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaW50ZXJhY3Rpb24pIHtcbiAgICAgICAgICAgIGludGVyYWN0aW9uLl9fY291bnQtLTtcblxuICAgICAgICAgICAgaWYgKHN1YnNjcmliZXIgIT09IG51bGwgJiYgaW50ZXJhY3Rpb24uX19jb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICBzdWJzY3JpYmVyLm9uSW50ZXJhY3Rpb25TY2hlZHVsZWRXb3JrQ29tcGxldGVkKGludGVyYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHdyYXBwZWQuY2FuY2VsID0gZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgc3Vic2NyaWJlciA9IHN1YnNjcmliZXJSZWYuY3VycmVudDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHN1YnNjcmliZXIgIT09IG51bGwpIHtcbiAgICAgICAgICBzdWJzY3JpYmVyLm9uV29ya0NhbmNlbGVkKHdyYXBwZWRJbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gVXBkYXRlIHBlbmRpbmcgYXN5bmMgY291bnRzIGZvciBhbGwgd3JhcHBlZCBpbnRlcmFjdGlvbnMuXG4gICAgICAgIC8vIElmIHRoaXMgd2FzIHRoZSBsYXN0IHNjaGVkdWxlZCBhc3luYyB3b3JrIGZvciBhbnkgb2YgdGhlbSxcbiAgICAgICAgLy8gTWFyayB0aGVtIGFzIGNvbXBsZXRlZC5cbiAgICAgICAgd3JhcHBlZEludGVyYWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChpbnRlcmFjdGlvbikge1xuICAgICAgICAgIGludGVyYWN0aW9uLl9fY291bnQtLTtcblxuICAgICAgICAgIGlmIChzdWJzY3JpYmVyICYmIGludGVyYWN0aW9uLl9fY291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIub25JbnRlcmFjdGlvblNjaGVkdWxlZFdvcmtDb21wbGV0ZWQoaW50ZXJhY3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB3cmFwcGVkO1xuICB9XG5cbiAgdmFyIHN1YnNjcmliZXJzID0gbnVsbDtcblxuICB7XG4gICAgc3Vic2NyaWJlcnMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBmdW5jdGlvbiB1bnN0YWJsZV9zdWJzY3JpYmUoc3Vic2NyaWJlcikge1xuICAgIHtcbiAgICAgIHN1YnNjcmliZXJzLmFkZChzdWJzY3JpYmVyKTtcblxuICAgICAgaWYgKHN1YnNjcmliZXJzLnNpemUgPT09IDEpIHtcbiAgICAgICAgc3Vic2NyaWJlclJlZi5jdXJyZW50ID0ge1xuICAgICAgICAgIG9uSW50ZXJhY3Rpb25TY2hlZHVsZWRXb3JrQ29tcGxldGVkOiBvbkludGVyYWN0aW9uU2NoZWR1bGVkV29ya0NvbXBsZXRlZCxcbiAgICAgICAgICBvbkludGVyYWN0aW9uVHJhY2VkOiBvbkludGVyYWN0aW9uVHJhY2VkLFxuICAgICAgICAgIG9uV29ya0NhbmNlbGVkOiBvbldvcmtDYW5jZWxlZCxcbiAgICAgICAgICBvbldvcmtTY2hlZHVsZWQ6IG9uV29ya1NjaGVkdWxlZCxcbiAgICAgICAgICBvbldvcmtTdGFydGVkOiBvbldvcmtTdGFydGVkLFxuICAgICAgICAgIG9uV29ya1N0b3BwZWQ6IG9uV29ya1N0b3BwZWRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdW5zdGFibGVfdW5zdWJzY3JpYmUoc3Vic2NyaWJlcikge1xuICAgIHtcbiAgICAgIHN1YnNjcmliZXJzLmRlbGV0ZShzdWJzY3JpYmVyKTtcblxuICAgICAgaWYgKHN1YnNjcmliZXJzLnNpemUgPT09IDApIHtcbiAgICAgICAgc3Vic2NyaWJlclJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbkludGVyYWN0aW9uVHJhY2VkKGludGVyYWN0aW9uKSB7XG4gICAgdmFyIGRpZENhdGNoRXJyb3IgPSBmYWxzZTtcbiAgICB2YXIgY2F1Z2h0RXJyb3IgPSBudWxsO1xuICAgIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHN1YnNjcmliZXIub25JbnRlcmFjdGlvblRyYWNlZChpbnRlcmFjdGlvbik7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoIWRpZENhdGNoRXJyb3IpIHtcbiAgICAgICAgICBkaWRDYXRjaEVycm9yID0gdHJ1ZTtcbiAgICAgICAgICBjYXVnaHRFcnJvciA9IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoZGlkQ2F0Y2hFcnJvcikge1xuICAgICAgdGhyb3cgY2F1Z2h0RXJyb3I7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25JbnRlcmFjdGlvblNjaGVkdWxlZFdvcmtDb21wbGV0ZWQoaW50ZXJhY3Rpb24pIHtcbiAgICB2YXIgZGlkQ2F0Y2hFcnJvciA9IGZhbHNlO1xuICAgIHZhciBjYXVnaHRFcnJvciA9IG51bGw7XG4gICAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3Vic2NyaWJlci5vbkludGVyYWN0aW9uU2NoZWR1bGVkV29ya0NvbXBsZXRlZChpbnRlcmFjdGlvbik7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoIWRpZENhdGNoRXJyb3IpIHtcbiAgICAgICAgICBkaWRDYXRjaEVycm9yID0gdHJ1ZTtcbiAgICAgICAgICBjYXVnaHRFcnJvciA9IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoZGlkQ2F0Y2hFcnJvcikge1xuICAgICAgdGhyb3cgY2F1Z2h0RXJyb3I7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Xb3JrU2NoZWR1bGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpIHtcbiAgICB2YXIgZGlkQ2F0Y2hFcnJvciA9IGZhbHNlO1xuICAgIHZhciBjYXVnaHRFcnJvciA9IG51bGw7XG4gICAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3Vic2NyaWJlci5vbldvcmtTY2hlZHVsZWQoaW50ZXJhY3Rpb25zLCB0aHJlYWRJRCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoIWRpZENhdGNoRXJyb3IpIHtcbiAgICAgICAgICBkaWRDYXRjaEVycm9yID0gdHJ1ZTtcbiAgICAgICAgICBjYXVnaHRFcnJvciA9IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoZGlkQ2F0Y2hFcnJvcikge1xuICAgICAgdGhyb3cgY2F1Z2h0RXJyb3I7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Xb3JrU3RhcnRlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKSB7XG4gICAgdmFyIGRpZENhdGNoRXJyb3IgPSBmYWxzZTtcbiAgICB2YXIgY2F1Z2h0RXJyb3IgPSBudWxsO1xuICAgIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHN1YnNjcmliZXIub25Xb3JrU3RhcnRlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmICghZGlkQ2F0Y2hFcnJvcikge1xuICAgICAgICAgIGRpZENhdGNoRXJyb3IgPSB0cnVlO1xuICAgICAgICAgIGNhdWdodEVycm9yID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChkaWRDYXRjaEVycm9yKSB7XG4gICAgICB0aHJvdyBjYXVnaHRFcnJvcjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbldvcmtTdG9wcGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpIHtcbiAgICB2YXIgZGlkQ2F0Y2hFcnJvciA9IGZhbHNlO1xuICAgIHZhciBjYXVnaHRFcnJvciA9IG51bGw7XG4gICAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3Vic2NyaWJlci5vbldvcmtTdG9wcGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKCFkaWRDYXRjaEVycm9yKSB7XG4gICAgICAgICAgZGlkQ2F0Y2hFcnJvciA9IHRydWU7XG4gICAgICAgICAgY2F1Z2h0RXJyb3IgPSBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGRpZENhdGNoRXJyb3IpIHtcbiAgICAgIHRocm93IGNhdWdodEVycm9yO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uV29ya0NhbmNlbGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpIHtcbiAgICB2YXIgZGlkQ2F0Y2hFcnJvciA9IGZhbHNlO1xuICAgIHZhciBjYXVnaHRFcnJvciA9IG51bGw7XG4gICAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3Vic2NyaWJlci5vbldvcmtDYW5jZWxlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmICghZGlkQ2F0Y2hFcnJvcikge1xuICAgICAgICAgIGRpZENhdGNoRXJyb3IgPSB0cnVlO1xuICAgICAgICAgIGNhdWdodEVycm9yID0gZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChkaWRDYXRjaEVycm9yKSB7XG4gICAgICB0aHJvdyBjYXVnaHRFcnJvcjtcbiAgICB9XG4gIH1cblxuXG5cbiAgdmFyIFNjaGVkdWxlclRyYWNpbmcgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7XG4gICAgX19wcm90b19fOiBudWxsLFxuICAgIGdldCBfX2ludGVyYWN0aW9uc1JlZiAoKSB7IHJldHVybiBpbnRlcmFjdGlvbnNSZWY7IH0sXG4gICAgZ2V0IF9fc3Vic2NyaWJlclJlZiAoKSB7IHJldHVybiBzdWJzY3JpYmVyUmVmOyB9LFxuICAgIHVuc3RhYmxlX2NsZWFyOiB1bnN0YWJsZV9jbGVhcixcbiAgICB1bnN0YWJsZV9nZXRDdXJyZW50OiB1bnN0YWJsZV9nZXRDdXJyZW50LFxuICAgIHVuc3RhYmxlX2dldFRocmVhZElEOiB1bnN0YWJsZV9nZXRUaHJlYWRJRCxcbiAgICB1bnN0YWJsZV90cmFjZTogdW5zdGFibGVfdHJhY2UsXG4gICAgdW5zdGFibGVfd3JhcDogdW5zdGFibGVfd3JhcCxcbiAgICB1bnN0YWJsZV9zdWJzY3JpYmU6IHVuc3RhYmxlX3N1YnNjcmliZSxcbiAgICB1bnN0YWJsZV91bnN1YnNjcmliZTogdW5zdGFibGVfdW5zdWJzY3JpYmVcbiAgfSk7XG5cbiAgdmFyIFJlYWN0U2hhcmVkSW50ZXJuYWxzJDEgPSB7XG4gICAgUmVhY3RDdXJyZW50RGlzcGF0Y2hlcjogUmVhY3RDdXJyZW50RGlzcGF0Y2hlcixcbiAgICBSZWFjdEN1cnJlbnRPd25lcjogUmVhY3RDdXJyZW50T3duZXIsXG4gICAgSXNTb21lUmVuZGVyZXJBY3Rpbmc6IElzU29tZVJlbmRlcmVyQWN0aW5nLFxuICAgIC8vIFVzZWQgYnkgcmVuZGVyZXJzIHRvIGF2b2lkIGJ1bmRsaW5nIG9iamVjdC1hc3NpZ24gdHdpY2UgaW4gVU1EIGJ1bmRsZXM6XG4gICAgYXNzaWduOiBvYmplY3RBc3NpZ25cbiAgfTtcblxuICB7XG4gICAgb2JqZWN0QXNzaWduKFJlYWN0U2hhcmVkSW50ZXJuYWxzJDEsIHtcbiAgICAgIC8vIFRoZXNlIHNob3VsZCBub3QgYmUgaW5jbHVkZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgIFJlYWN0RGVidWdDdXJyZW50RnJhbWU6IFJlYWN0RGVidWdDdXJyZW50RnJhbWUsXG4gICAgICAvLyBTaGltIGZvciBSZWFjdCBET00gMTYuMC4wIHdoaWNoIHN0aWxsIGRlc3RydWN0dXJlZCAoYnV0IG5vdCB1c2VkKSB0aGlzLlxuICAgICAgLy8gVE9ETzogcmVtb3ZlIGluIFJlYWN0IDE3LjAuXG4gICAgICBSZWFjdENvbXBvbmVudFRyZWVIb29rOiB7fVxuICAgIH0pO1xuICB9IC8vIFJlLWV4cG9ydCB0aGUgc2NoZWR1bGUgQVBJKHMpIGZvciBVTUQgYnVuZGxlcy5cbiAgLy8gVGhpcyBhdm9pZHMgaW50cm9kdWNpbmcgYSBkZXBlbmRlbmN5IG9uIGEgbmV3IFVNRCBnbG9iYWwgaW4gYSBtaW5vciB1cGRhdGUsXG4gIC8vIFNpbmNlIHRoYXQgd291bGQgYmUgYSBicmVha2luZyBjaGFuZ2UgKGUuZy4gZm9yIGFsbCBleGlzdGluZyBDb2RlU2FuZGJveGVzKS5cbiAgLy8gVGhpcyByZS1leHBvcnQgaXMgb25seSByZXF1aXJlZCBmb3IgVU1EIGJ1bmRsZXM7XG4gIC8vIENKUyBidW5kbGVzIHVzZSB0aGUgc2hhcmVkIE5QTSBwYWNrYWdlLlxuXG5cbiAgb2JqZWN0QXNzaWduKFJlYWN0U2hhcmVkSW50ZXJuYWxzJDEsIHtcbiAgICBTY2hlZHVsZXI6IFNjaGVkdWxlcixcbiAgICBTY2hlZHVsZXJUcmFjaW5nOiBTY2hlZHVsZXJUcmFjaW5nXG4gIH0pO1xuXG4gIHtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgZnJvemVuT2JqZWN0ID0gT2JqZWN0LmZyZWV6ZSh7fSk7XG4gICAgICB2YXIgdGVzdE1hcCA9IG5ldyBNYXAoW1tmcm96ZW5PYmplY3QsIG51bGxdXSk7XG4gICAgICB2YXIgdGVzdFNldCA9IG5ldyBTZXQoW2Zyb3plbk9iamVjdF0pOyAvLyBUaGlzIGlzIG5lY2Vzc2FyeSBmb3IgUm9sbHVwIHRvIG5vdCBjb25zaWRlciB0aGVzZSB1bnVzZWQuXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcm9sbHVwL3JvbGx1cC9pc3N1ZXMvMTc3MVxuICAgICAgLy8gVE9ETzogd2UgY2FuIHJlbW92ZSB0aGVzZSBpZiBSb2xsdXAgZml4ZXMgdGhlIGJ1Zy5cblxuICAgICAgdGVzdE1hcC5zZXQoMCwgMCk7XG4gICAgICB0ZXN0U2V0LmFkZCgwKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgfVxuICB9XG5cbiAgdmFyIGNyZWF0ZUVsZW1lbnQkMSA9ICBjcmVhdGVFbGVtZW50V2l0aFZhbGlkYXRpb24gO1xuICB2YXIgY2xvbmVFbGVtZW50JDEgPSAgY2xvbmVFbGVtZW50V2l0aFZhbGlkYXRpb24gO1xuICB2YXIgY3JlYXRlRmFjdG9yeSA9ICBjcmVhdGVGYWN0b3J5V2l0aFZhbGlkYXRpb24gO1xuICB2YXIgQ2hpbGRyZW4gPSB7XG4gICAgbWFwOiBtYXBDaGlsZHJlbixcbiAgICBmb3JFYWNoOiBmb3JFYWNoQ2hpbGRyZW4sXG4gICAgY291bnQ6IGNvdW50Q2hpbGRyZW4sXG4gICAgdG9BcnJheTogdG9BcnJheSxcbiAgICBvbmx5OiBvbmx5Q2hpbGRcbiAgfTtcblxuICBleHBvcnRzLkNoaWxkcmVuID0gQ2hpbGRyZW47XG4gIGV4cG9ydHMuQ29tcG9uZW50ID0gQ29tcG9uZW50O1xuICBleHBvcnRzLkZyYWdtZW50ID0gUkVBQ1RfRlJBR01FTlRfVFlQRTtcbiAgZXhwb3J0cy5Qcm9maWxlciA9IFJFQUNUX1BST0ZJTEVSX1RZUEU7XG4gIGV4cG9ydHMuUHVyZUNvbXBvbmVudCA9IFB1cmVDb21wb25lbnQ7XG4gIGV4cG9ydHMuU3RyaWN0TW9kZSA9IFJFQUNUX1NUUklDVF9NT0RFX1RZUEU7XG4gIGV4cG9ydHMuU3VzcGVuc2UgPSBSRUFDVF9TVVNQRU5TRV9UWVBFO1xuICBleHBvcnRzLl9fU0VDUkVUX0lOVEVSTkFMU19ET19OT1RfVVNFX09SX1lPVV9XSUxMX0JFX0ZJUkVEID0gUmVhY3RTaGFyZWRJbnRlcm5hbHMkMTtcbiAgZXhwb3J0cy5jbG9uZUVsZW1lbnQgPSBjbG9uZUVsZW1lbnQkMTtcbiAgZXhwb3J0cy5jcmVhdGVDb250ZXh0ID0gY3JlYXRlQ29udGV4dDtcbiAgZXhwb3J0cy5jcmVhdGVFbGVtZW50ID0gY3JlYXRlRWxlbWVudCQxO1xuICBleHBvcnRzLmNyZWF0ZUZhY3RvcnkgPSBjcmVhdGVGYWN0b3J5O1xuICBleHBvcnRzLmNyZWF0ZVJlZiA9IGNyZWF0ZVJlZjtcbiAgZXhwb3J0cy5mb3J3YXJkUmVmID0gZm9yd2FyZFJlZjtcbiAgZXhwb3J0cy5pc1ZhbGlkRWxlbWVudCA9IGlzVmFsaWRFbGVtZW50O1xuICBleHBvcnRzLmxhenkgPSBsYXp5O1xuICBleHBvcnRzLm1lbW8gPSBtZW1vO1xuICBleHBvcnRzLnVzZUNhbGxiYWNrID0gdXNlQ2FsbGJhY2s7XG4gIGV4cG9ydHMudXNlQ29udGV4dCA9IHVzZUNvbnRleHQ7XG4gIGV4cG9ydHMudXNlRGVidWdWYWx1ZSA9IHVzZURlYnVnVmFsdWU7XG4gIGV4cG9ydHMudXNlRWZmZWN0ID0gdXNlRWZmZWN0O1xuICBleHBvcnRzLnVzZUltcGVyYXRpdmVIYW5kbGUgPSB1c2VJbXBlcmF0aXZlSGFuZGxlO1xuICBleHBvcnRzLnVzZUxheW91dEVmZmVjdCA9IHVzZUxheW91dEVmZmVjdDtcbiAgZXhwb3J0cy51c2VNZW1vID0gdXNlTWVtbztcbiAgZXhwb3J0cy51c2VSZWR1Y2VyID0gdXNlUmVkdWNlcjtcbiAgZXhwb3J0cy51c2VSZWYgPSB1c2VSZWY7XG4gIGV4cG9ydHMudXNlU3RhdGUgPSB1c2VTdGF0ZTtcbiAgZXhwb3J0cy52ZXJzaW9uID0gUmVhY3RWZXJzaW9uO1xuXG59KSkpOyJdfQ==