
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* eslint-disable no-param-reassign */

    /**
     * Options for customizing ripples
     */
    const defaults = {
      color: 'currentColor',
      class: '',
      opacity: 0.1,
      centered: false,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
    };

    /**
     * Creates a ripple element but does not destroy it (use RippleStop for that)
     *
     * @param {Event} e
     * @param {*} options
     * @returns Ripple element
     */
    function RippleStart(e, options = {}) {
      e.stopImmediatePropagation();
      const opts = { ...defaults, ...options };

      const isTouchEvent = e.touches ? !!e.touches[0] : false;
      // Parent element
      const target = isTouchEvent ? e.touches[0].currentTarget : e.currentTarget;

      // Create ripple
      const ripple = document.createElement('div');
      const rippleStyle = ripple.style;

      // Adding default stuff
      ripple.className = `material-ripple ${opts.class}`;
      rippleStyle.position = 'absolute';
      rippleStyle.color = 'inherit';
      rippleStyle.borderRadius = '50%';
      rippleStyle.pointerEvents = 'none';
      rippleStyle.width = '100px';
      rippleStyle.height = '100px';
      rippleStyle.marginTop = '-50px';
      rippleStyle.marginLeft = '-50px';
      target.appendChild(ripple);
      rippleStyle.opacity = opts.opacity;
      rippleStyle.transition = `transform ${opts.spreadingDuration} ${opts.spreadingTimingFunction} ${opts.spreadingDelay},opacity ${opts.clearingDuration} ${opts.clearingTimingFunction} ${opts.clearingDelay}`;
      rippleStyle.transform = 'scale(0) translate(0,0)';
      rippleStyle.background = opts.color;

      // Positioning ripple
      const targetRect = target.getBoundingClientRect();
      if (opts.centered) {
        rippleStyle.top = `${targetRect.height / 2}px`;
        rippleStyle.left = `${targetRect.width / 2}px`;
      } else {
        const distY = isTouchEvent ? e.touches[0].clientY : e.clientY;
        const distX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        rippleStyle.top = `${distY - targetRect.top}px`;
        rippleStyle.left = `${distX - targetRect.left}px`;
      }

      // Enlarge ripple
      rippleStyle.transform = `scale(${
    Math.max(targetRect.width, targetRect.height) * 0.02
  }) translate(0,0)`;
      return ripple;
    }

    /**
     * Destroys the ripple, slowly fading it out.
     *
     * @param {Element} ripple
     */
    function RippleStop(ripple) {
      if (ripple) {
        ripple.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'opacity') ripple.remove();
        });
        ripple.style.opacity = 0;
      }
    }

    /**
     * @param node {Element}
     */
    var Ripple = (node, _options = {}) => {
      let options = _options;
      let destroyed = false;
      let ripple;
      let keyboardActive = false;
      const handleStart = (e) => {
        ripple = RippleStart(e, options);
      };
      const handleStop = () => RippleStop(ripple);
      const handleKeyboardStart = (e) => {
        if (!keyboardActive && (e.keyCode === 13 || e.keyCode === 32)) {
          ripple = RippleStart(e, { ...options, centered: true });
          keyboardActive = true;
        }
      };
      const handleKeyboardStop = () => {
        keyboardActive = false;
        handleStop();
      };

      function setup() {
        node.classList.add('s-ripple-container');
        node.addEventListener('pointerdown', handleStart);
        node.addEventListener('pointerup', handleStop);
        node.addEventListener('pointerleave', handleStop);
        node.addEventListener('keydown', handleKeyboardStart);
        node.addEventListener('keyup', handleKeyboardStop);
        destroyed = false;
      }

      function destroy() {
        node.classList.remove('s-ripple-container');
        node.removeEventListener('pointerdown', handleStart);
        node.removeEventListener('pointerup', handleStop);
        node.removeEventListener('pointerleave', handleStop);
        node.removeEventListener('keydown', handleKeyboardStart);
        node.removeEventListener('keyup', handleKeyboardStop);
        destroyed = true;
      }

      if (options) setup();

      return {
        update(newOptions) {
          options = newOptions;
          if (options && destroyed) setup();
          else if (!(options || destroyed)) destroy();
        },
        destroy,
      };
    };

    /* node_modules\svelte-materialify\dist\components\MaterialApp\MaterialApp.svelte generated by Svelte v3.31.2 */

    const file = "node_modules\\svelte-materialify\\dist\\components\\MaterialApp\\MaterialApp.svelte";

    function create_fragment(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-app theme--" + /*theme*/ ctx[0]);
    			add_location(div, file, 13082, 0, 248465);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1 && div_class_value !== (div_class_value = "s-app theme--" + /*theme*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MaterialApp", slots, ['default']);
    	let { theme = "light" } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MaterialApp> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ theme });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class MaterialApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MaterialApp",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get theme() {
    		throw new Error("<MaterialApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<MaterialApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function format(input) {
      if (typeof input === 'number') return `${input}px`;
      return input;
    }

    /**
     * @param node {Element}
     * @param styles {Object}
     */
    var Style = (node, _styles) => {
      let styles = _styles;
      Object.entries(styles).forEach(([key, value]) => {
        if (value) node.style.setProperty(`--s-${key}`, format(value));
      });

      return {
        update(newStyles) {
          Object.entries(newStyles).forEach(([key, value]) => {
            if (value) {
              node.style.setProperty(`--s-${key}`, format(value));
              delete styles[key];
            }
          });

          Object.keys(styles).forEach((name) => node.style.removeProperty(`--s-${name}`));

          styles = newStyles;
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Icon\Icon.svelte generated by Svelte v3.31.2 */
    const file$1 = "node_modules\\svelte-materialify\\dist\\components\\Icon\\Icon.svelte";

    // (65:2) {#if path}
    function create_if_block(ctx) {
    	let svg;
    	let path_1;
    	let if_block = /*label*/ ctx[6] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			if (if_block) if_block.c();
    			attr_dev(path_1, "d", /*path*/ ctx[5]);
    			add_location(path_1, file$1, 70, 6, 1512);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*size*/ ctx[1]);
    			attr_dev(svg, "height", /*size*/ ctx[1]);
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$1, 65, 4, 1394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path_1);
    			if (if_block) if_block.m(path_1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*label*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(path_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*path*/ 32) {
    				attr_dev(path_1, "d", /*path*/ ctx[5]);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "width", /*size*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "height", /*size*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(65:2) {#if path}",
    		ctx
    	});

    	return block;
    }

    // (72:8) {#if label}
    function create_if_block_1(ctx) {
    	let title;
    	let t;

    	const block = {
    		c: function create() {
    			title = svg_element("title");
    			t = text(/*label*/ ctx[6]);
    			add_location(title, file$1, 72, 10, 1558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title, anchor);
    			append_dev(title, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 64) set_data_dev(t, /*label*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(72:8) {#if label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let i;
    	let t;
    	let i_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*path*/ ctx[5] && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "s-icon " + /*klass*/ ctx[0]);
    			attr_dev(i, "aria-label", /*label*/ ctx[6]);
    			attr_dev(i, "aria-disabled", /*disabled*/ ctx[4]);
    			attr_dev(i, "style", /*style*/ ctx[7]);
    			toggle_class(i, "spin", /*spin*/ ctx[3]);
    			toggle_class(i, "disabled", /*disabled*/ ctx[4]);
    			add_location(i, file$1, 55, 0, 1172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			if (if_block) if_block.m(i, null);
    			append_dev(i, t);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, i, {
    					"icon-size": /*size*/ ctx[1],
    					"icon-rotate": `${/*rotate*/ ctx[2]}deg`
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*path*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(i, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && i_class_value !== (i_class_value = "s-icon " + /*klass*/ ctx[0])) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*label*/ 64) {
    				attr_dev(i, "aria-label", /*label*/ ctx[6]);
    			}

    			if (!current || dirty & /*disabled*/ 16) {
    				attr_dev(i, "aria-disabled", /*disabled*/ ctx[4]);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(i, "style", /*style*/ ctx[7]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*size, rotate*/ 6) Style_action.update.call(null, {
    				"icon-size": /*size*/ ctx[1],
    				"icon-rotate": `${/*rotate*/ ctx[2]}deg`
    			});

    			if (dirty & /*klass, spin*/ 9) {
    				toggle_class(i, "spin", /*spin*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 17) {
    				toggle_class(i, "disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { size = "24px" } = $$props;
    	let { rotate = 0 } = $$props;
    	let { spin = false } = $$props;
    	let { disabled = false } = $$props;
    	let { path = null } = $$props;
    	let { label = null } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "size", "rotate", "spin", "disabled", "path", "label", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("rotate" in $$props) $$invalidate(2, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(3, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(5, path = $$props.path);
    		if ("label" in $$props) $$invalidate(6, label = $$props.label);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		size,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("rotate" in $$props) $$invalidate(2, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(3, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(5, path = $$props.path);
    		if ("label" in $$props) $$invalidate(6, label = $$props.label);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, size, rotate, spin, disabled, path, label, style, $$scope, slots];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			class: 0,
    			size: 1,
    			rotate: 2,
    			spin: 3,
    			disabled: 4,
    			path: 5,
    			label: 6,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const filter = (classes) => classes.filter((x) => !!x);
    const format$1 = (classes) => classes.split(' ').filter((x) => !!x);

    /**
     * @param node {Element}
     * @param classes {Array<string>}
     */
    var Class = (node, _classes) => {
      let classes = _classes;
      node.classList.add(...format$1(filter(classes).join(' ')));
      return {
        update(_newClasses) {
          const newClasses = _newClasses;
          newClasses.forEach((klass, i) => {
            if (klass) node.classList.add(...format$1(klass));
            else if (classes[i]) node.classList.remove(...format$1(classes[i]));
          });
          classes = newClasses;
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Button\Button.svelte generated by Svelte v3.31.2 */
    const file$2 = "node_modules\\svelte-materialify\\dist\\components\\Button\\Button.svelte";

    function create_fragment$2(ctx) {
    	let button;
    	let span;
    	let button_class_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);

    	let button_levels = [
    		{
    			class: button_class_value = "s-btn size-" + /*size*/ ctx[4] + " " + /*klass*/ ctx[0]
    		},
    		{ type: /*type*/ ctx[13] },
    		{ style: /*style*/ ctx[15] },
    		{ disabled: /*disabled*/ ctx[10] },
    		{ "aria-disabled": /*disabled*/ ctx[10] },
    		/*$$restProps*/ ctx[16]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "s-btn__content");
    			add_location(span, file$2, 270, 2, 5682);
    			set_attributes(button, button_data);
    			toggle_class(button, "fab", /*fab*/ ctx[1]);
    			toggle_class(button, "icon", /*icon*/ ctx[2]);
    			toggle_class(button, "block", /*block*/ ctx[3]);
    			toggle_class(button, "tile", /*tile*/ ctx[5]);
    			toggle_class(button, "text", /*text*/ ctx[6] || /*icon*/ ctx[2]);
    			toggle_class(button, "depressed", /*depressed*/ ctx[7] || /*text*/ ctx[6] || /*disabled*/ ctx[10] || /*outlined*/ ctx[8] || /*icon*/ ctx[2]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[8]);
    			toggle_class(button, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[10]);
    			add_location(button, file$2, 251, 0, 5286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button, [/*active*/ ctx[11] && /*activeClass*/ ctx[12]])),
    					action_destroyer(Ripple_action = Ripple.call(null, button, /*ripple*/ ctx[14])),
    					listen_dev(button, "click", /*click_handler*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 131072) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[17], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty & /*size, klass*/ 17 && button_class_value !== (button_class_value = "s-btn size-" + /*size*/ ctx[4] + " " + /*klass*/ ctx[0])) && { class: button_class_value },
    				(!current || dirty & /*type*/ 8192) && { type: /*type*/ ctx[13] },
    				(!current || dirty & /*style*/ 32768) && { style: /*style*/ ctx[15] },
    				(!current || dirty & /*disabled*/ 1024) && { disabled: /*disabled*/ ctx[10] },
    				(!current || dirty & /*disabled*/ 1024) && { "aria-disabled": /*disabled*/ ctx[10] },
    				dirty & /*$$restProps*/ 65536 && /*$$restProps*/ ctx[16]
    			]));

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 6144) Class_action.update.call(null, [/*active*/ ctx[11] && /*activeClass*/ ctx[12]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 16384) Ripple_action.update.call(null, /*ripple*/ ctx[14]);
    			toggle_class(button, "fab", /*fab*/ ctx[1]);
    			toggle_class(button, "icon", /*icon*/ ctx[2]);
    			toggle_class(button, "block", /*block*/ ctx[3]);
    			toggle_class(button, "tile", /*tile*/ ctx[5]);
    			toggle_class(button, "text", /*text*/ ctx[6] || /*icon*/ ctx[2]);
    			toggle_class(button, "depressed", /*depressed*/ ctx[7] || /*text*/ ctx[6] || /*disabled*/ ctx[10] || /*outlined*/ ctx[8] || /*icon*/ ctx[2]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[8]);
    			toggle_class(button, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[10]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","fab","icon","block","size","tile","text","depressed","outlined","rounded","disabled","active","activeClass","type","ripple","style"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { fab = false } = $$props;
    	let { icon = false } = $$props;
    	let { block = false } = $$props;
    	let { size = "default" } = $$props;
    	let { tile = false } = $$props;
    	let { text = false } = $$props;
    	let { depressed = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { disabled = null } = $$props;
    	let { active = false } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { type = "button" } = $$props;
    	let { ripple = {} } = $$props;
    	let { style = null } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(16, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(0, klass = $$new_props.class);
    		if ("fab" in $$new_props) $$invalidate(1, fab = $$new_props.fab);
    		if ("icon" in $$new_props) $$invalidate(2, icon = $$new_props.icon);
    		if ("block" in $$new_props) $$invalidate(3, block = $$new_props.block);
    		if ("size" in $$new_props) $$invalidate(4, size = $$new_props.size);
    		if ("tile" in $$new_props) $$invalidate(5, tile = $$new_props.tile);
    		if ("text" in $$new_props) $$invalidate(6, text = $$new_props.text);
    		if ("depressed" in $$new_props) $$invalidate(7, depressed = $$new_props.depressed);
    		if ("outlined" in $$new_props) $$invalidate(8, outlined = $$new_props.outlined);
    		if ("rounded" in $$new_props) $$invalidate(9, rounded = $$new_props.rounded);
    		if ("disabled" in $$new_props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("active" in $$new_props) $$invalidate(11, active = $$new_props.active);
    		if ("activeClass" in $$new_props) $$invalidate(12, activeClass = $$new_props.activeClass);
    		if ("type" in $$new_props) $$invalidate(13, type = $$new_props.type);
    		if ("ripple" in $$new_props) $$invalidate(14, ripple = $$new_props.ripple);
    		if ("style" in $$new_props) $$invalidate(15, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(17, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Class,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$new_props.klass);
    		if ("fab" in $$props) $$invalidate(1, fab = $$new_props.fab);
    		if ("icon" in $$props) $$invalidate(2, icon = $$new_props.icon);
    		if ("block" in $$props) $$invalidate(3, block = $$new_props.block);
    		if ("size" in $$props) $$invalidate(4, size = $$new_props.size);
    		if ("tile" in $$props) $$invalidate(5, tile = $$new_props.tile);
    		if ("text" in $$props) $$invalidate(6, text = $$new_props.text);
    		if ("depressed" in $$props) $$invalidate(7, depressed = $$new_props.depressed);
    		if ("outlined" in $$props) $$invalidate(8, outlined = $$new_props.outlined);
    		if ("rounded" in $$props) $$invalidate(9, rounded = $$new_props.rounded);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("active" in $$props) $$invalidate(11, active = $$new_props.active);
    		if ("activeClass" in $$props) $$invalidate(12, activeClass = $$new_props.activeClass);
    		if ("type" in $$props) $$invalidate(13, type = $$new_props.type);
    		if ("ripple" in $$props) $$invalidate(14, ripple = $$new_props.ripple);
    		if ("style" in $$props) $$invalidate(15, style = $$new_props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			class: 0,
    			fab: 1,
    			icon: 2,
    			block: 3,
    			size: 4,
    			tile: 5,
    			text: 6,
    			depressed: 7,
    			outlined: 8,
    			rounded: 9,
    			disabled: 10,
    			active: 11,
    			activeClass: 12,
    			type: 13,
    			ripple: 14,
    			style: 15
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depressed() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depressed(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable */
    // Shamefully ripped from https://github.com/lukeed/uid
    let IDX = 36;
    let HEX = '';
    while (IDX--) HEX += IDX.toString(36);

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /* eslint-disable */

    var nouislider_min = createCommonjsModule(function (module, exports) {
    /*! nouislider - 14.6.1 - 8/17/2020 */
    !(function (t) {
        (module.exports = t())
        ;
    })(function () {
      var lt = '14.6.1';
      function ut(t) {
        t.parentElement.removeChild(t);
      }
      function a(t) {
        return null != t;
      }
      function ct(t) {
        t.preventDefault();
      }
      function o(t) {
        return 'number' == typeof t && !isNaN(t) && isFinite(t);
      }
      function pt(t, e, r) {
        0 < r &&
          (ht(t, e),
          setTimeout(function () {
            mt(t, e);
          }, r));
      }
      function ft(t) {
        return Math.max(Math.min(t, 100), 0);
      }
      function dt(t) {
        return Array.isArray(t) ? t : [t];
      }
      function e(t) {
        var e = (t = String(t)).split('.');
        return 1 < e.length ? e[1].length : 0;
      }
      function ht(t, e) {
        t.classList && !/\s/.test(e) ? t.classList.add(e) : (t.className += ' ' + e);
      }
      function mt(t, e) {
        t.classList && !/\s/.test(e)
          ? t.classList.remove(e)
          : (t.className = t.className.replace(
              new RegExp('(^|\\b)' + e.split(' ').join('|') + '(\\b|$)', 'gi'),
              ' ',
            ));
      }
      function gt(t) {
        var e = void 0 !== window.pageXOffset,
          r = 'CSS1Compat' === (t.compatMode || '');
        return {
          x: e ? window.pageXOffset : r ? t.documentElement.scrollLeft : t.body.scrollLeft,
          y: e ? window.pageYOffset : r ? t.documentElement.scrollTop : t.body.scrollTop,
        };
      }
      function c(t, e) {
        return 100 / (e - t);
      }
      function p(t, e, r) {
        return (100 * e) / (t[r + 1] - t[r]);
      }
      function f(t, e) {
        for (var r = 1; t >= e[r]; ) r += 1;
        return r;
      }
      function r(t, e, r) {
        if (r >= t.slice(-1)[0]) return 100;
        var n,
          i,
          o = f(r, t),
          s = t[o - 1],
          a = t[o],
          l = e[o - 1],
          u = e[o];
        return (
          l +
          ((i = r), p((n = [s, a]), n[0] < 0 ? i + Math.abs(n[0]) : i - n[0], 0) / c(l, u))
        );
      }
      function n(t, e, r, n) {
        if (100 === n) return n;
        var i,
          o,
          s = f(n, t),
          a = t[s - 1],
          l = t[s];
        return r
          ? (l - a) / 2 < n - a
            ? l
            : a
          : e[s - 1]
          ? t[s - 1] + ((i = n - t[s - 1]), (o = e[s - 1]), Math.round(i / o) * o)
          : n;
      }
      function s(t, e, r) {
        var n;
        if (('number' == typeof e && (e = [e]), !Array.isArray(e)))
          throw new Error('noUiSlider (' + lt + "): 'range' contains invalid value.");
        if (!o((n = 'min' === t ? 0 : 'max' === t ? 100 : parseFloat(t))) || !o(e[0]))
          throw new Error('noUiSlider (' + lt + "): 'range' value isn't numeric.");
        r.xPct.push(n),
          r.xVal.push(e[0]),
          n ? r.xSteps.push(!isNaN(e[1]) && e[1]) : isNaN(e[1]) || (r.xSteps[0] = e[1]),
          r.xHighestCompleteStep.push(0);
      }
      function l(t, e, r) {
        if (e)
          if (r.xVal[t] !== r.xVal[t + 1]) {
            r.xSteps[t] = p([r.xVal[t], r.xVal[t + 1]], e, 0) / c(r.xPct[t], r.xPct[t + 1]);
            var n = (r.xVal[t + 1] - r.xVal[t]) / r.xNumSteps[t],
              i = Math.ceil(Number(n.toFixed(3)) - 1),
              o = r.xVal[t] + r.xNumSteps[t] * i;
            r.xHighestCompleteStep[t] = o;
          } else r.xSteps[t] = r.xHighestCompleteStep[t] = r.xVal[t];
      }
      function i(t, e, r) {
        var n;
        (this.xPct = []),
          (this.xVal = []),
          (this.xSteps = [r || !1]),
          (this.xNumSteps = [!1]),
          (this.xHighestCompleteStep = []),
          (this.snap = e);
        var i = [];
        for (n in t) t.hasOwnProperty(n) && i.push([t[n], n]);
        for (
          i.length && 'object' == typeof i[0][0]
            ? i.sort(function (t, e) {
                return t[0][0] - e[0][0];
              })
            : i.sort(function (t, e) {
                return t[0] - e[0];
              }),
            n = 0;
          n < i.length;
          n++
        )
          s(i[n][1], i[n][0], this);
        for (this.xNumSteps = this.xSteps.slice(0), n = 0; n < this.xNumSteps.length; n++)
          l(n, this.xNumSteps[n], this);
      }
      (i.prototype.getDistance = function (t) {
        var e,
          r = [];
        for (e = 0; e < this.xNumSteps.length - 1; e++) {
          var n = this.xNumSteps[e];
          if (n && (t / n) % 1 != 0)
            throw new Error(
              'noUiSlider (' +
                lt +
                "): 'limit', 'margin' and 'padding' of " +
                this.xPct[e] +
                '% range must be divisible by step.',
            );
          r[e] = p(this.xVal, t, e);
        }
        return r;
      }),
        (i.prototype.getAbsoluteDistance = function (t, e, r) {
          var n,
            i = 0;
          if (t < this.xPct[this.xPct.length - 1]) for (; t > this.xPct[i + 1]; ) i++;
          else t === this.xPct[this.xPct.length - 1] && (i = this.xPct.length - 2);
          r || t !== this.xPct[i + 1] || i++;
          var o = 1,
            s = e[i],
            a = 0,
            l = 0,
            u = 0,
            c = 0;
          for (
            n = r
              ? (t - this.xPct[i]) / (this.xPct[i + 1] - this.xPct[i])
              : (this.xPct[i + 1] - t) / (this.xPct[i + 1] - this.xPct[i]);
            0 < s;

          )
            (a = this.xPct[i + 1 + c] - this.xPct[i + c]),
              100 < e[i + c] * o + 100 - 100 * n
                ? ((l = a * n), (o = (s - 100 * n) / e[i + c]), (n = 1))
                : ((l = ((e[i + c] * a) / 100) * o), (o = 0)),
              r
                ? ((u -= l), 1 <= this.xPct.length + c && c--)
                : ((u += l), 1 <= this.xPct.length - c && c++),
              (s = e[i + c] * o);
          return t + u;
        }),
        (i.prototype.toStepping = function (t) {
          return (t = r(this.xVal, this.xPct, t));
        }),
        (i.prototype.fromStepping = function (t) {
          return (function (t, e, r) {
            if (100 <= r) return t.slice(-1)[0];
            var n,
              i = f(r, e),
              o = t[i - 1],
              s = t[i],
              a = e[i - 1],
              l = e[i];
            return (n = [o, s]), ((r - a) * c(a, l) * (n[1] - n[0])) / 100 + n[0];
          })(this.xVal, this.xPct, t);
        }),
        (i.prototype.getStep = function (t) {
          return (t = n(this.xPct, this.xSteps, this.snap, t));
        }),
        (i.prototype.getDefaultStep = function (t, e, r) {
          var n = f(t, this.xPct);
          return (
            (100 === t || (e && t === this.xPct[n - 1])) && (n = Math.max(n - 1, 1)),
            (this.xVal[n] - this.xVal[n - 1]) / r
          );
        }),
        (i.prototype.getNearbySteps = function (t) {
          var e = f(t, this.xPct);
          return {
            stepBefore: {
              startValue: this.xVal[e - 2],
              step: this.xNumSteps[e - 2],
              highestStep: this.xHighestCompleteStep[e - 2],
            },
            thisStep: {
              startValue: this.xVal[e - 1],
              step: this.xNumSteps[e - 1],
              highestStep: this.xHighestCompleteStep[e - 1],
            },
            stepAfter: {
              startValue: this.xVal[e],
              step: this.xNumSteps[e],
              highestStep: this.xHighestCompleteStep[e],
            },
          };
        }),
        (i.prototype.countStepDecimals = function () {
          var t = this.xNumSteps.map(e);
          return Math.max.apply(null, t);
        }),
        (i.prototype.convert = function (t) {
          return this.getStep(this.toStepping(t));
        });
      var u = {
          to: function (t) {
            return void 0 !== t && t.toFixed(2);
          },
          from: Number,
        },
        d = {
          target: 'target',
          base: 'base',
          origin: 'origin',
          handle: 'handle',
          handleLower: 'handle-lower',
          handleUpper: 'handle-upper',
          touchArea: 'touch-area',
          horizontal: 'horizontal',
          vertical: 'vertical',
          background: 'background',
          connect: 'connect',
          connects: 'connects',
          ltr: 'ltr',
          rtl: 'rtl',
          textDirectionLtr: 'txt-dir-ltr',
          textDirectionRtl: 'txt-dir-rtl',
          draggable: 'draggable',
          drag: 'state-drag',
          tap: 'state-tap',
          active: 'active',
          tooltip: 'tooltip',
          pips: 'pips',
          pipsHorizontal: 'pips-horizontal',
          pipsVertical: 'pips-vertical',
          marker: 'marker',
          markerHorizontal: 'marker-horizontal',
          markerVertical: 'marker-vertical',
          markerNormal: 'marker-normal',
          markerLarge: 'marker-large',
          markerSub: 'marker-sub',
          value: 'value',
          valueHorizontal: 'value-horizontal',
          valueVertical: 'value-vertical',
          valueNormal: 'value-normal',
          valueLarge: 'value-large',
          valueSub: 'value-sub',
        };
      function h(t) {
        if (
          'object' == typeof (e = t) &&
          'function' == typeof e.to &&
          'function' == typeof e.from
        )
          return !0;
        var e;
        throw new Error(
          'noUiSlider (' + lt + "): 'format' requires 'to' and 'from' methods.",
        );
      }
      function m(t, e) {
        if (!o(e)) throw new Error('noUiSlider (' + lt + "): 'step' is not numeric.");
        t.singleStep = e;
      }
      function g(t, e) {
        if (!o(e))
          throw new Error(
            'noUiSlider (' + lt + "): 'keyboardPageMultiplier' is not numeric.",
          );
        t.keyboardPageMultiplier = e;
      }
      function v(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'keyboardDefaultStep' is not numeric.");
        t.keyboardDefaultStep = e;
      }
      function b(t, e) {
        if ('object' != typeof e || Array.isArray(e))
          throw new Error('noUiSlider (' + lt + "): 'range' is not an object.");
        if (void 0 === e.min || void 0 === e.max)
          throw new Error('noUiSlider (' + lt + "): Missing 'min' or 'max' in 'range'.");
        if (e.min === e.max)
          throw new Error(
            'noUiSlider (' + lt + "): 'range' 'min' and 'max' cannot be equal.",
          );
        t.spectrum = new i(e, t.snap, t.singleStep);
      }
      function x(t, e) {
        if (((e = dt(e)), !Array.isArray(e) || !e.length))
          throw new Error('noUiSlider (' + lt + "): 'start' option is incorrect.");
        (t.handles = e.length), (t.start = e);
      }
      function S(t, e) {
        if ('boolean' != typeof (t.snap = e))
          throw new Error('noUiSlider (' + lt + "): 'snap' option must be a boolean.");
      }
      function w(t, e) {
        if ('boolean' != typeof (t.animate = e))
          throw new Error('noUiSlider (' + lt + "): 'animate' option must be a boolean.");
      }
      function y(t, e) {
        if ('number' != typeof (t.animationDuration = e))
          throw new Error(
            'noUiSlider (' + lt + "): 'animationDuration' option must be a number.",
          );
      }
      function E(t, e) {
        var r,
          n = [!1];
        if (
          ('lower' === e ? (e = [!0, !1]) : 'upper' === e && (e = [!1, !0]),
          !0 === e || !1 === e)
        ) {
          for (r = 1; r < t.handles; r++) n.push(e);
          n.push(!1);
        } else {
          if (!Array.isArray(e) || !e.length || e.length !== t.handles + 1)
            throw new Error(
              'noUiSlider (' + lt + "): 'connect' option doesn't match handle count.",
            );
          n = e;
        }
        t.connect = n;
      }
      function C(t, e) {
        switch (e) {
          case 'horizontal':
            t.ort = 0;
            break;
          case 'vertical':
            t.ort = 1;
            break;
          default:
            throw new Error('noUiSlider (' + lt + "): 'orientation' option is invalid.");
        }
      }
      function P(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'margin' option must be numeric.");
        0 !== e && (t.margin = t.spectrum.getDistance(e));
      }
      function N(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'limit' option must be numeric.");
        if (((t.limit = t.spectrum.getDistance(e)), !t.limit || t.handles < 2))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'limit' option is only supported on linear sliders with 2 or more handles.",
          );
      }
      function k(t, e) {
        var r;
        if (!o(e) && !Array.isArray(e))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'padding' option must be numeric or array of exactly 2 numbers.",
          );
        if (Array.isArray(e) && 2 !== e.length && !o(e[0]) && !o(e[1]))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'padding' option must be numeric or array of exactly 2 numbers.",
          );
        if (0 !== e) {
          for (
            Array.isArray(e) || (e = [e, e]),
              t.padding = [t.spectrum.getDistance(e[0]), t.spectrum.getDistance(e[1])],
              r = 0;
            r < t.spectrum.xNumSteps.length - 1;
            r++
          )
            if (t.padding[0][r] < 0 || t.padding[1][r] < 0)
              throw new Error(
                'noUiSlider (' + lt + "): 'padding' option must be a positive number(s).",
              );
          var n = e[0] + e[1],
            i = t.spectrum.xVal[0];
          if (1 < n / (t.spectrum.xVal[t.spectrum.xVal.length - 1] - i))
            throw new Error(
              'noUiSlider (' + lt + "): 'padding' option must not exceed 100% of the range.",
            );
        }
      }
      function U(t, e) {
        switch (e) {
          case 'ltr':
            t.dir = 0;
            break;
          case 'rtl':
            t.dir = 1;
            break;
          default:
            throw new Error(
              'noUiSlider (' + lt + "): 'direction' option was not recognized.",
            );
        }
      }
      function A(t, e) {
        if ('string' != typeof e)
          throw new Error(
            'noUiSlider (' + lt + "): 'behaviour' must be a string containing options.",
          );
        var r = 0 <= e.indexOf('tap'),
          n = 0 <= e.indexOf('drag'),
          i = 0 <= e.indexOf('fixed'),
          o = 0 <= e.indexOf('snap'),
          s = 0 <= e.indexOf('hover'),
          a = 0 <= e.indexOf('unconstrained');
        if (i) {
          if (2 !== t.handles)
            throw new Error(
              'noUiSlider (' + lt + "): 'fixed' behaviour must be used with 2 handles",
            );
          P(t, t.start[1] - t.start[0]);
        }
        if (a && (t.margin || t.limit))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'unconstrained' behaviour cannot be used with margin or limit",
          );
        t.events = { tap: r || o, drag: n, fixed: i, snap: o, hover: s, unconstrained: a };
      }
      function V(t, e) {
        if (!1 !== e)
          if (!0 === e) {
            t.tooltips = [];
            for (var r = 0; r < t.handles; r++) t.tooltips.push(!0);
          } else {
            if (((t.tooltips = dt(e)), t.tooltips.length !== t.handles))
              throw new Error(
                'noUiSlider (' + lt + '): must pass a formatter for all handles.',
              );
            t.tooltips.forEach(function (t) {
              if (
                'boolean' != typeof t &&
                ('object' != typeof t || 'function' != typeof t.to)
              )
                throw new Error(
                  'noUiSlider (' +
                    lt +
                    "): 'tooltips' must be passed a formatter or 'false'.",
                );
            });
          }
      }
      function D(t, e) {
        h((t.ariaFormat = e));
      }
      function M(t, e) {
        h((t.format = e));
      }
      function O(t, e) {
        if ('boolean' != typeof (t.keyboardSupport = e))
          throw new Error(
            'noUiSlider (' + lt + "): 'keyboardSupport' option must be a boolean.",
          );
      }
      function L(t, e) {
        t.documentElement = e;
      }
      function z(t, e) {
        if ('string' != typeof e && !1 !== e)
          throw new Error(
            'noUiSlider (' + lt + "): 'cssPrefix' must be a string or `false`.",
          );
        t.cssPrefix = e;
      }
      function H(t, e) {
        if ('object' != typeof e)
          throw new Error('noUiSlider (' + lt + "): 'cssClasses' must be an object.");
        if ('string' == typeof t.cssPrefix)
          for (var r in ((t.cssClasses = {}), e))
            e.hasOwnProperty(r) && (t.cssClasses[r] = t.cssPrefix + e[r]);
        else t.cssClasses = e;
      }
      function vt(e) {
        var r = {
            margin: 0,
            limit: 0,
            padding: 0,
            animate: !0,
            animationDuration: 300,
            ariaFormat: u,
            format: u,
          },
          n = {
            step: { r: !1, t: m },
            keyboardPageMultiplier: { r: !1, t: g },
            keyboardDefaultStep: { r: !1, t: v },
            start: { r: !0, t: x },
            connect: { r: !0, t: E },
            direction: { r: !0, t: U },
            snap: { r: !1, t: S },
            animate: { r: !1, t: w },
            animationDuration: { r: !1, t: y },
            range: { r: !0, t: b },
            orientation: { r: !1, t: C },
            margin: { r: !1, t: P },
            limit: { r: !1, t: N },
            padding: { r: !1, t: k },
            behaviour: { r: !0, t: A },
            ariaFormat: { r: !1, t: D },
            format: { r: !1, t: M },
            tooltips: { r: !1, t: V },
            keyboardSupport: { r: !0, t: O },
            documentElement: { r: !1, t: L },
            cssPrefix: { r: !0, t: z },
            cssClasses: { r: !0, t: H },
          },
          i = {
            connect: !1,
            direction: 'ltr',
            behaviour: 'tap',
            orientation: 'horizontal',
            keyboardSupport: !0,
            cssPrefix: 'noUi-',
            cssClasses: d,
            keyboardPageMultiplier: 5,
            keyboardDefaultStep: 10,
          };
        e.format && !e.ariaFormat && (e.ariaFormat = e.format),
          Object.keys(n).forEach(function (t) {
            if (!a(e[t]) && void 0 === i[t]) {
              if (n[t].r)
                throw new Error('noUiSlider (' + lt + "): '" + t + "' is required.");
              return !0;
            }
            n[t].t(r, a(e[t]) ? e[t] : i[t]);
          }),
          (r.pips = e.pips);
        var t = document.createElement('div'),
          o = void 0 !== t.style.msTransform,
          s = void 0 !== t.style.transform;
        r.transformRule = s ? 'transform' : o ? 'msTransform' : 'webkitTransform';
        return (
          (r.style = [
            ['left', 'top'],
            ['right', 'bottom'],
          ][r.dir][r.ort]),
          r
        );
      }
      function j(t, b, o) {
        var l,
          u,
          s,
          c,
          i,
          a,
          e,
          p,
          f = window.navigator.pointerEnabled
            ? { start: 'pointerdown', move: 'pointermove', end: 'pointerup' }
            : window.navigator.msPointerEnabled
            ? { start: 'MSPointerDown', move: 'MSPointerMove', end: 'MSPointerUp' }
            : {
                start: 'mousedown touchstart',
                move: 'mousemove touchmove',
                end: 'mouseup touchend',
              },
          d =
            window.CSS &&
            CSS.supports &&
            CSS.supports('touch-action', 'none') &&
            (function () {
              var t = !1;
              try {
                var e = Object.defineProperty({}, 'passive', {
                  get: function () {
                    t = !0;
                  },
                });
                window.addEventListener('test', null, e);
              } catch (t) {}
              return t;
            })(),
          h = t,
          y = b.spectrum,
          x = [],
          S = [],
          m = [],
          g = 0,
          v = {},
          w = t.ownerDocument,
          E = b.documentElement || w.documentElement,
          C = w.body,
          P = -1,
          N = 0,
          k = 1,
          U = 2,
          A = 'rtl' === w.dir || 1 === b.ort ? 0 : 100;
        function V(t, e) {
          var r = w.createElement('div');
          return e && ht(r, e), t.appendChild(r), r;
        }
        function D(t, e) {
          var r = V(t, b.cssClasses.origin),
            n = V(r, b.cssClasses.handle);
          return (
            V(n, b.cssClasses.touchArea),
            n.setAttribute('data-handle', e),
            b.keyboardSupport &&
              (n.setAttribute('tabindex', '0'),
              n.addEventListener('keydown', function (t) {
                return (function (t, e) {
                  if (O() || L(e)) return !1;
                  var r = ['Left', 'Right'],
                    n = ['Down', 'Up'],
                    i = ['PageDown', 'PageUp'],
                    o = ['Home', 'End'];
                  b.dir && !b.ort
                    ? r.reverse()
                    : b.ort && !b.dir && (n.reverse(), i.reverse());
                  var s,
                    a = t.key.replace('Arrow', ''),
                    l = a === i[0],
                    u = a === i[1],
                    c = a === n[0] || a === r[0] || l,
                    p = a === n[1] || a === r[1] || u,
                    f = a === o[0],
                    d = a === o[1];
                  if (!(c || p || f || d)) return !0;
                  if ((t.preventDefault(), p || c)) {
                    var h = b.keyboardPageMultiplier,
                      m = c ? 0 : 1,
                      g = at(e),
                      v = g[m];
                    if (null === v) return !1;
                    !1 === v && (v = y.getDefaultStep(S[e], c, b.keyboardDefaultStep)),
                      (u || l) && (v *= h),
                      (v = Math.max(v, 1e-7)),
                      (v *= c ? -1 : 1),
                      (s = x[e] + v);
                  } else s = d ? b.spectrum.xVal[b.spectrum.xVal.length - 1] : b.spectrum.xVal[0];
                  return (
                    rt(e, y.toStepping(s), !0, !0),
                    J('slide', e),
                    J('update', e),
                    J('change', e),
                    J('set', e),
                    !1
                  );
                })(t, e);
              })),
            n.setAttribute('role', 'slider'),
            n.setAttribute('aria-orientation', b.ort ? 'vertical' : 'horizontal'),
            0 === e
              ? ht(n, b.cssClasses.handleLower)
              : e === b.handles - 1 && ht(n, b.cssClasses.handleUpper),
            r
          );
        }
        function M(t, e) {
          return !!e && V(t, b.cssClasses.connect);
        }
        function r(t, e) {
          return !!b.tooltips[e] && V(t.firstChild, b.cssClasses.tooltip);
        }
        function O() {
          return h.hasAttribute('disabled');
        }
        function L(t) {
          return u[t].hasAttribute('disabled');
        }
        function z() {
          i &&
            (G('update.tooltips'),
            i.forEach(function (t) {
              t && ut(t);
            }),
            (i = null));
        }
        function H() {
          z(),
            (i = u.map(r)),
            $('update.tooltips', function (t, e, r) {
              if (i[e]) {
                var n = t[e];
                !0 !== b.tooltips[e] && (n = b.tooltips[e].to(r[e])), (i[e].innerHTML = n);
              }
            });
        }
        function j(e, i, o) {
          var s = w.createElement('div'),
            a = [];
          (a[N] = b.cssClasses.valueNormal),
            (a[k] = b.cssClasses.valueLarge),
            (a[U] = b.cssClasses.valueSub);
          var l = [];
          (l[N] = b.cssClasses.markerNormal),
            (l[k] = b.cssClasses.markerLarge),
            (l[U] = b.cssClasses.markerSub);
          var u = [b.cssClasses.valueHorizontal, b.cssClasses.valueVertical],
            c = [b.cssClasses.markerHorizontal, b.cssClasses.markerVertical];
          function p(t, e) {
            var r = e === b.cssClasses.value,
              n = r ? a : l;
            return e + ' ' + (r ? u : c)[b.ort] + ' ' + n[t];
          }
          return (
            ht(s, b.cssClasses.pips),
            ht(s, 0 === b.ort ? b.cssClasses.pipsHorizontal : b.cssClasses.pipsVertical),
            Object.keys(e).forEach(function (t) {
              !(function (t, e, r) {
                if ((r = i ? i(e, r) : r) !== P) {
                  var n = V(s, !1);
                  (n.className = p(r, b.cssClasses.marker)),
                    (n.style[b.style] = t + '%'),
                    N < r &&
                      (((n = V(s, !1)).className = p(r, b.cssClasses.value)),
                      n.setAttribute('data-value', e),
                      (n.style[b.style] = t + '%'),
                      (n.innerHTML = o.to(e)));
                }
              })(t, e[t][0], e[t][1]);
            }),
            s
          );
        }
        function F() {
          c && (ut(c), (c = null));
        }
        function R(t) {
          F();
          var m,
            g,
            v,
            b,
            e,
            r,
            x,
            S,
            w,
            n = t.mode,
            i = t.density || 1,
            o = t.filter || !1,
            s = (function (t, e, r) {
              if ('range' === t || 'steps' === t) return y.xVal;
              if ('count' === t) {
                if (e < 2)
                  throw new Error(
                    'noUiSlider (' + lt + "): 'values' (>= 2) required for mode 'count'.",
                  );
                var n = e - 1,
                  i = 100 / n;
                for (e = []; n--; ) e[n] = n * i;
                e.push(100), (t = 'positions');
              }
              return 'positions' === t
                ? e.map(function (t) {
                    return y.fromStepping(r ? y.getStep(t) : t);
                  })
                : 'values' === t
                ? r
                  ? e.map(function (t) {
                      return y.fromStepping(y.getStep(y.toStepping(t)));
                    })
                  : e
                : void 0;
            })(n, t.values || !1, t.stepped || !1),
            a =
              ((m = i),
              (g = n),
              (v = s),
              (b = {}),
              (e = y.xVal[0]),
              (r = y.xVal[y.xVal.length - 1]),
              (S = x = !1),
              (w = 0),
              (v = v
                .slice()
                .sort(function (t, e) {
                  return t - e;
                })
                .filter(function (t) {
                  return !this[t] && (this[t] = !0);
                }, {}))[0] !== e && (v.unshift(e), (x = !0)),
              v[v.length - 1] !== r && (v.push(r), (S = !0)),
              v.forEach(function (t, e) {
                var r,
                  n,
                  i,
                  o,
                  s,
                  a,
                  l,
                  u,
                  c,
                  p,
                  f = t,
                  d = v[e + 1],
                  h = 'steps' === g;
                if ((h && (r = y.xNumSteps[e]), r || (r = d - f), !1 !== f))
                  for (
                    void 0 === d && (d = f), r = Math.max(r, 1e-7), n = f;
                    n <= d;
                    n = (n + r).toFixed(7) / 1
                  ) {
                    for (
                      u = (s = (o = y.toStepping(n)) - w) / m,
                        p = s / (c = Math.round(u)),
                        i = 1;
                      i <= c;
                      i += 1
                    )
                      b[(a = w + i * p).toFixed(5)] = [y.fromStepping(a), 0];
                    (l = -1 < v.indexOf(n) ? k : h ? U : N),
                      !e && x && n !== d && (l = 0),
                      (n === d && S) || (b[o.toFixed(5)] = [n, l]),
                      (w = o);
                  }
              }),
              b),
            l = t.format || { to: Math.round };
          return (c = h.appendChild(j(a, o, l)));
        }
        function T() {
          var t = l.getBoundingClientRect(),
            e = 'offset' + ['Width', 'Height'][b.ort];
          return 0 === b.ort ? t.width || l[e] : t.height || l[e];
        }
        function B(n, i, o, s) {
          var e = function (t) {
              return (
                !!(t = (function (t, e, r) {
                  var n,
                    i,
                    o = 0 === t.type.indexOf('touch'),
                    s = 0 === t.type.indexOf('mouse'),
                    a = 0 === t.type.indexOf('pointer');
                  0 === t.type.indexOf('MSPointer') && (a = !0);
                  if (o) {
                    var l = function (t) {
                      return (
                        t.target === r ||
                        r.contains(t.target) ||
                        (t.target.shadowRoot && t.target.shadowRoot.contains(r))
                      );
                    };
                    if ('touchstart' === t.type) {
                      var u = Array.prototype.filter.call(t.touches, l);
                      if (1 < u.length) return !1;
                      (n = u[0].pageX), (i = u[0].pageY);
                    } else {
                      var c = Array.prototype.find.call(t.changedTouches, l);
                      if (!c) return !1;
                      (n = c.pageX), (i = c.pageY);
                    }
                  }
                  (e = e || gt(w)),
                    (s || a) && ((n = t.clientX + e.x), (i = t.clientY + e.y));
                  return (t.pageOffset = e), (t.points = [n, i]), (t.cursor = s || a), t;
                })(t, s.pageOffset, s.target || i)) &&
                !(O() && !s.doNotReject) &&
                ((e = h),
                (r = b.cssClasses.tap),
                !(
                  (e.classList
                    ? e.classList.contains(r)
                    : new RegExp('\\b' + r + '\\b').test(e.className)) && !s.doNotReject
                ) &&
                  !(n === f.start && void 0 !== t.buttons && 1 < t.buttons) &&
                  (!s.hover || !t.buttons) &&
                  (d || t.preventDefault(), (t.calcPoint = t.points[b.ort]), void o(t, s)))
              );
              var e, r;
            },
            r = [];
          return (
            n.split(' ').forEach(function (t) {
              i.addEventListener(t, e, !!d && { passive: !0 }), r.push([t, e]);
            }),
            r
          );
        }
        function q(t) {
          var e,
            r,
            n,
            i,
            o,
            s,
            a =
              (100 *
                (t -
                  ((e = l),
                  (r = b.ort),
                  (n = e.getBoundingClientRect()),
                  (i = e.ownerDocument),
                  (o = i.documentElement),
                  (s = gt(i)),
                  /webkit.*Chrome.*Mobile/i.test(navigator.userAgent) && (s.x = 0),
                  r ? n.top + s.y - o.clientTop : n.left + s.x - o.clientLeft))) /
              T();
          return (a = ft(a)), b.dir ? 100 - a : a;
        }
        function X(t, e) {
          'mouseout' === t.type &&
            'HTML' === t.target.nodeName &&
            null === t.relatedTarget &&
            _(t, e);
        }
        function Y(t, e) {
          if (
            -1 === navigator.appVersion.indexOf('MSIE 9') &&
            0 === t.buttons &&
            0 !== e.buttonsProperty
          )
            return _(t, e);
          var r = (b.dir ? -1 : 1) * (t.calcPoint - e.startCalcPoint);
          Z(0 < r, (100 * r) / e.baseSize, e.locations, e.handleNumbers);
        }
        function _(t, e) {
          e.handle && (mt(e.handle, b.cssClasses.active), (g -= 1)),
            e.listeners.forEach(function (t) {
              E.removeEventListener(t[0], t[1]);
            }),
            0 === g &&
              (mt(h, b.cssClasses.drag),
              et(),
              t.cursor && ((C.style.cursor = ''), C.removeEventListener('selectstart', ct))),
            e.handleNumbers.forEach(function (t) {
              J('change', t), J('set', t), J('end', t);
            });
        }
        function I(t, e) {
          if (e.handleNumbers.some(L)) return !1;
          var r;
          1 === e.handleNumbers.length &&
            ((r = u[e.handleNumbers[0]].children[0]), (g += 1), ht(r, b.cssClasses.active));
          t.stopPropagation();
          var n = [],
            i = B(f.move, E, Y, {
              target: t.target,
              handle: r,
              listeners: n,
              startCalcPoint: t.calcPoint,
              baseSize: T(),
              pageOffset: t.pageOffset,
              handleNumbers: e.handleNumbers,
              buttonsProperty: t.buttons,
              locations: S.slice(),
            }),
            o = B(f.end, E, _, {
              target: t.target,
              handle: r,
              listeners: n,
              doNotReject: !0,
              handleNumbers: e.handleNumbers,
            }),
            s = B('mouseout', E, X, {
              target: t.target,
              handle: r,
              listeners: n,
              doNotReject: !0,
              handleNumbers: e.handleNumbers,
            });
          n.push.apply(n, i.concat(o, s)),
            t.cursor &&
              ((C.style.cursor = getComputedStyle(t.target).cursor),
              1 < u.length && ht(h, b.cssClasses.drag),
              C.addEventListener('selectstart', ct, !1)),
            e.handleNumbers.forEach(function (t) {
              J('start', t);
            });
        }
        function n(t) {
          if (!t.buttons && !t.touches) return !1;
          t.stopPropagation();
          var i,
            o,
            s,
            e = q(t.calcPoint),
            r =
              ((i = e),
              (s = !(o = 100)),
              u.forEach(function (t, e) {
                if (!L(e)) {
                  var r = S[e],
                    n = Math.abs(r - i);
                  (n < o || (n <= o && r < i) || (100 === n && 100 === o)) &&
                    ((s = e), (o = n));
                }
              }),
              s);
          if (!1 === r) return !1;
          b.events.snap || pt(h, b.cssClasses.tap, b.animationDuration),
            rt(r, e, !0, !0),
            et(),
            J('slide', r, !0),
            J('update', r, !0),
            J('change', r, !0),
            J('set', r, !0),
            b.events.snap && I(t, { handleNumbers: [r] });
        }
        function W(t) {
          var e = q(t.calcPoint),
            r = y.getStep(e),
            n = y.fromStepping(r);
          Object.keys(v).forEach(function (t) {
            'hover' === t.split('.')[0] &&
              v[t].forEach(function (t) {
                t.call(a, n);
              });
          });
        }
        function $(t, e) {
          (v[t] = v[t] || []),
            v[t].push(e),
            'update' === t.split('.')[0] &&
              u.forEach(function (t, e) {
                J('update', e);
              });
        }
        function G(t) {
          var n = t && t.split('.')[0],
            i = n && t.substring(n.length);
          Object.keys(v).forEach(function (t) {
            var e = t.split('.')[0],
              r = t.substring(e.length);
            (n && n !== e) || (i && i !== r) || delete v[t];
          });
        }
        function J(r, n, i) {
          Object.keys(v).forEach(function (t) {
            var e = t.split('.')[0];
            r === e &&
              v[t].forEach(function (t) {
                t.call(a, x.map(b.format.to), n, x.slice(), i || !1, S.slice(), a);
              });
          });
        }
        function K(t, e, r, n, i, o) {
          var s;
          return (
            1 < u.length &&
              !b.events.unconstrained &&
              (n &&
                0 < e &&
                ((s = y.getAbsoluteDistance(t[e - 1], b.margin, 0)), (r = Math.max(r, s))),
              i &&
                e < u.length - 1 &&
                ((s = y.getAbsoluteDistance(t[e + 1], b.margin, 1)), (r = Math.min(r, s)))),
            1 < u.length &&
              b.limit &&
              (n &&
                0 < e &&
                ((s = y.getAbsoluteDistance(t[e - 1], b.limit, 0)), (r = Math.min(r, s))),
              i &&
                e < u.length - 1 &&
                ((s = y.getAbsoluteDistance(t[e + 1], b.limit, 1)), (r = Math.max(r, s)))),
            b.padding &&
              (0 === e &&
                ((s = y.getAbsoluteDistance(0, b.padding[0], 0)), (r = Math.max(r, s))),
              e === u.length - 1 &&
                ((s = y.getAbsoluteDistance(100, b.padding[1], 1)), (r = Math.min(r, s)))),
            !((r = ft((r = y.getStep(r)))) === t[e] && !o) && r
          );
        }
        function Q(t, e) {
          var r = b.ort;
          return (r ? e : t) + ', ' + (r ? t : e);
        }
        function Z(t, n, r, e) {
          var i = r.slice(),
            o = [!t, t],
            s = [t, !t];
          (e = e.slice()),
            t && e.reverse(),
            1 < e.length
              ? e.forEach(function (t, e) {
                  var r = K(i, t, i[t] + n, o[e], s[e], !1);
                  !1 === r ? (n = 0) : ((n = r - i[t]), (i[t] = r));
                })
              : (o = s = [!0]);
          var a = !1;
          e.forEach(function (t, e) {
            a = rt(t, r[t] + n, o[e], s[e]) || a;
          }),
            a &&
              e.forEach(function (t) {
                J('update', t), J('slide', t);
              });
        }
        function tt(t, e) {
          return b.dir ? 100 - t - e : t;
        }
        function et() {
          m.forEach(function (t) {
            var e = 50 < S[t] ? -1 : 1,
              r = 3 + (u.length + e * t);
            u[t].style.zIndex = r;
          });
        }
        function rt(t, e, r, n) {
          return (
            !1 !== (e = K(S, t, e, r, n, !1)) &&
            ((function (t, e) {
              (S[t] = e), (x[t] = y.fromStepping(e));
              var r = 'translate(' + Q(10 * (tt(e, 0) - A) + '%', '0') + ')';
              (u[t].style[b.transformRule] = r), nt(t), nt(t + 1);
            })(t, e),
            !0)
          );
        }
        function nt(t) {
          if (s[t]) {
            var e = 0,
              r = 100;
            0 !== t && (e = S[t - 1]), t !== s.length - 1 && (r = S[t]);
            var n = r - e,
              i = 'translate(' + Q(tt(e, n) + '%', '0') + ')',
              o = 'scale(' + Q(n / 100, '1') + ')';
            s[t].style[b.transformRule] = i + ' ' + o;
          }
        }
        function it(t, e) {
          return null === t || !1 === t || void 0 === t
            ? S[e]
            : ('number' == typeof t && (t = String(t)),
              (t = b.format.from(t)),
              !1 === (t = y.toStepping(t)) || isNaN(t) ? S[e] : t);
        }
        function ot(t, e) {
          var r = dt(t),
            n = void 0 === S[0];
          (e = void 0 === e || !!e),
            b.animate && !n && pt(h, b.cssClasses.tap, b.animationDuration),
            m.forEach(function (t) {
              rt(t, it(r[t], t), !0, !1);
            });
          for (var i = 1 === m.length ? 0 : 1; i < m.length; ++i)
            m.forEach(function (t) {
              rt(t, S[t], !0, !0);
            });
          et(),
            m.forEach(function (t) {
              J('update', t), null !== r[t] && e && J('set', t);
            });
        }
        function st() {
          var t = x.map(b.format.to);
          return 1 === t.length ? t[0] : t;
        }
        function at(t) {
          var e = S[t],
            r = y.getNearbySteps(e),
            n = x[t],
            i = r.thisStep.step,
            o = null;
          if (b.snap)
            return [n - r.stepBefore.startValue || null, r.stepAfter.startValue - n || null];
          !1 !== i && n + i > r.stepAfter.startValue && (i = r.stepAfter.startValue - n),
            (o =
              n > r.thisStep.startValue
                ? r.thisStep.step
                : !1 !== r.stepBefore.step && n - r.stepBefore.highestStep),
            100 === e ? (i = null) : 0 === e && (o = null);
          var s = y.countStepDecimals();
          return (
            null !== i && !1 !== i && (i = Number(i.toFixed(s))),
            null !== o && !1 !== o && (o = Number(o.toFixed(s))),
            [o, i]
          );
        }
        return (
          ht((e = h), b.cssClasses.target),
          0 === b.dir ? ht(e, b.cssClasses.ltr) : ht(e, b.cssClasses.rtl),
          0 === b.ort ? ht(e, b.cssClasses.horizontal) : ht(e, b.cssClasses.vertical),
          ht(
            e,
            'rtl' === getComputedStyle(e).direction
              ? b.cssClasses.textDirectionRtl
              : b.cssClasses.textDirectionLtr,
          ),
          (l = V(e, b.cssClasses.base)),
          (function (t, e) {
            var r = V(e, b.cssClasses.connects);
            (u = []), (s = []).push(M(r, t[0]));
            for (var n = 0; n < b.handles; n++)
              u.push(D(e, n)), (m[n] = n), s.push(M(r, t[n + 1]));
          })(b.connect, l),
          (p = b.events).fixed ||
            u.forEach(function (t, e) {
              B(f.start, t.children[0], I, { handleNumbers: [e] });
            }),
          p.tap && B(f.start, l, n, {}),
          p.hover && B(f.move, l, W, { hover: !0 }),
          p.drag &&
            s.forEach(function (t, e) {
              if (!1 !== t && 0 !== e && e !== s.length - 1) {
                var r = u[e - 1],
                  n = u[e],
                  i = [t];
                ht(t, b.cssClasses.draggable),
                  p.fixed && (i.push(r.children[0]), i.push(n.children[0])),
                  i.forEach(function (t) {
                    B(f.start, t, I, { handles: [r, n], handleNumbers: [e - 1, e] });
                  });
              }
            }),
          ot(b.start),
          b.pips && R(b.pips),
          b.tooltips && H(),
          $('update', function (t, e, s, r, a) {
            m.forEach(function (t) {
              var e = u[t],
                r = K(S, t, 0, !0, !0, !0),
                n = K(S, t, 100, !0, !0, !0),
                i = a[t],
                o = b.ariaFormat.to(s[t]);
              (r = y.fromStepping(r).toFixed(1)),
                (n = y.fromStepping(n).toFixed(1)),
                (i = y.fromStepping(i).toFixed(1)),
                e.children[0].setAttribute('aria-valuemin', r),
                e.children[0].setAttribute('aria-valuemax', n),
                e.children[0].setAttribute('aria-valuenow', i),
                e.children[0].setAttribute('aria-valuetext', o);
            });
          }),
          (a = {
            destroy: function () {
              for (var t in b.cssClasses)
                b.cssClasses.hasOwnProperty(t) && mt(h, b.cssClasses[t]);
              for (; h.firstChild; ) h.removeChild(h.firstChild);
              delete h.noUiSlider;
            },
            steps: function () {
              return m.map(at);
            },
            on: $,
            off: G,
            get: st,
            set: ot,
            setHandle: function (t, e, r) {
              if (!(0 <= (t = Number(t)) && t < m.length))
                throw new Error('noUiSlider (' + lt + '): invalid handle number, got: ' + t);
              rt(t, it(e, t), !0, !0), J('update', t), r && J('set', t);
            },
            reset: function (t) {
              ot(b.start, t);
            },
            __moveHandles: function (t, e, r) {
              Z(t, e, S, r);
            },
            options: o,
            updateOptions: function (e, t) {
              var r = st(),
                n = [
                  'margin',
                  'limit',
                  'padding',
                  'range',
                  'animate',
                  'snap',
                  'step',
                  'format',
                  'pips',
                  'tooltips',
                ];
              n.forEach(function (t) {
                void 0 !== e[t] && (o[t] = e[t]);
              });
              var i = vt(o);
              n.forEach(function (t) {
                void 0 !== e[t] && (b[t] = i[t]);
              }),
                (y = i.spectrum),
                (b.margin = i.margin),
                (b.limit = i.limit),
                (b.padding = i.padding),
                b.pips ? R(b.pips) : F(),
                b.tooltips ? H() : z(),
                (S = []),
                ot(e.start || r, t);
            },
            target: h,
            removePips: F,
            removeTooltips: z,
            getTooltips: function () {
              return i;
            },
            getOrigins: function () {
              return u;
            },
            pips: R,
          })
        );
      }
      return {
        __spectrum: i,
        version: lt,
        cssClasses: d,
        create: function (t, e) {
          if (!t || !t.nodeName)
            throw new Error(
              'noUiSlider (' + lt + '): create requires a single element, got: ' + t,
            );
          if (t.noUiSlider)
            throw new Error('noUiSlider (' + lt + '): Slider was already initialized.');
          var r = j(t, vt(e), e);
          return (t.noUiSlider = r);
        },
      };
    });
    });

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules\svelte-materialify\dist\components\List\List.svelte generated by Svelte v3.31.2 */
    const file$3 = "node_modules\\svelte-materialify\\dist\\components\\List\\List.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "role", /*role*/ ctx[8]);
    			attr_dev(div, "class", div_class_value = "s-list " + /*klass*/ ctx[0]);
    			attr_dev(div, "aria-disabled", /*disabled*/ ctx[2]);
    			attr_dev(div, "style", /*style*/ ctx[7]);
    			toggle_class(div, "dense", /*dense*/ ctx[1]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[2]);
    			toggle_class(div, "flat", /*flat*/ ctx[3]);
    			toggle_class(div, "nav", /*nav*/ ctx[5]);
    			toggle_class(div, "outlined", /*outlined*/ ctx[6]);
    			toggle_class(div, "rounded", /*rounded*/ ctx[4]);
    			add_location(div, file$3, 83, 0, 1801);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*role*/ 256) {
    				attr_dev(div, "role", /*role*/ ctx[8]);
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-list " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*disabled*/ 4) {
    				attr_dev(div, "aria-disabled", /*disabled*/ ctx[2]);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(div, "style", /*style*/ ctx[7]);
    			}

    			if (dirty & /*klass, dense*/ 3) {
    				toggle_class(div, "dense", /*dense*/ ctx[1]);
    			}

    			if (dirty & /*klass, disabled*/ 5) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*klass, flat*/ 9) {
    				toggle_class(div, "flat", /*flat*/ ctx[3]);
    			}

    			if (dirty & /*klass, nav*/ 33) {
    				toggle_class(div, "nav", /*nav*/ ctx[5]);
    			}

    			if (dirty & /*klass, outlined*/ 65) {
    				toggle_class(div, "outlined", /*outlined*/ ctx[6]);
    			}

    			if (dirty & /*klass, rounded*/ 17) {
    				toggle_class(div, "rounded", /*rounded*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { dense = null } = $$props;
    	let { disabled = null } = $$props;
    	let { flat = false } = $$props;
    	let { rounded = false } = $$props;
    	let { nav = false } = $$props;
    	let { outlined = false } = $$props;
    	let { style = null } = $$props;
    	let role = null;

    	if (!getContext("S_ListItemRole")) {
    		setContext("S_ListItemRole", "listitem");
    		role = "list";
    	}

    	const writable_props = ["class", "dense", "disabled", "flat", "rounded", "nav", "outlined", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("dense" in $$props) $$invalidate(1, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("flat" in $$props) $$invalidate(3, flat = $$props.flat);
    		if ("rounded" in $$props) $$invalidate(4, rounded = $$props.rounded);
    		if ("nav" in $$props) $$invalidate(5, nav = $$props.nav);
    		if ("outlined" in $$props) $$invalidate(6, outlined = $$props.outlined);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		getContext,
    		klass,
    		dense,
    		disabled,
    		flat,
    		rounded,
    		nav,
    		outlined,
    		style,
    		role
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("dense" in $$props) $$invalidate(1, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("flat" in $$props) $$invalidate(3, flat = $$props.flat);
    		if ("rounded" in $$props) $$invalidate(4, rounded = $$props.rounded);
    		if ("nav" in $$props) $$invalidate(5, nav = $$props.nav);
    		if ("outlined" in $$props) $$invalidate(6, outlined = $$props.outlined);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("role" in $$props) $$invalidate(8, role = $$props.role);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		dense,
    		disabled,
    		flat,
    		rounded,
    		nav,
    		outlined,
    		style,
    		role,
    		$$scope,
    		slots
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			class: 0,
    			dense: 1,
    			disabled: 2,
    			flat: 3,
    			rounded: 4,
    			nav: 5,
    			outlined: 6,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get class() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nav() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nav(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\List\ListItem.svelte generated by Svelte v3.31.2 */
    const file$4 = "node_modules\\svelte-materialify\\dist\\components\\List\\ListItem.svelte";
    const get_append_slot_changes = dirty => ({});
    const get_append_slot_context = ctx => ({});
    const get_subtitle_slot_changes = dirty => ({});
    const get_subtitle_slot_context = ctx => ({});
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});

    function create_fragment$4(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_class_value;
    	let div3_tabindex_value;
    	let div3_aria_selected_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[14].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[13], get_prepend_slot_context);
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
    	const subtitle_slot_template = /*#slots*/ ctx[14].subtitle;
    	const subtitle_slot = create_slot(subtitle_slot_template, ctx, /*$$scope*/ ctx[13], get_subtitle_slot_context);
    	const append_slot_template = /*#slots*/ ctx[14].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[13], get_append_slot_context);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (subtitle_slot) subtitle_slot.c();
    			t2 = space();
    			if (append_slot) append_slot.c();
    			attr_dev(div0, "class", "s-list-item__title");
    			add_location(div0, file$4, 212, 4, 5366);
    			attr_dev(div1, "class", "s-list-item__subtitle");
    			add_location(div1, file$4, 215, 4, 5429);
    			attr_dev(div2, "class", "s-list-item__content");
    			add_location(div2, file$4, 211, 2, 5327);
    			attr_dev(div3, "class", div3_class_value = "s-list-item " + /*klass*/ ctx[1]);
    			attr_dev(div3, "role", /*role*/ ctx[10]);
    			attr_dev(div3, "tabindex", div3_tabindex_value = /*link*/ ctx[6] ? 0 : -1);
    			attr_dev(div3, "aria-selected", div3_aria_selected_value = /*role*/ ctx[10] === "option" ? /*active*/ ctx[0] : null);
    			attr_dev(div3, "style", /*style*/ ctx[9]);
    			toggle_class(div3, "dense", /*dense*/ ctx[3]);
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			toggle_class(div3, "multiline", /*multiline*/ ctx[5]);
    			toggle_class(div3, "link", /*link*/ ctx[6]);
    			toggle_class(div3, "selectable", /*selectable*/ ctx[7]);
    			add_location(div3, file$4, 195, 0, 4994);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (subtitle_slot) {
    				subtitle_slot.m(div1, null);
    			}

    			append_dev(div3, t2);

    			if (append_slot) {
    				append_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, div3, [/*active*/ ctx[0] && /*activeClass*/ ctx[2]])),
    					action_destroyer(Ripple_action = Ripple.call(null, div3, /*ripple*/ ctx[8])),
    					listen_dev(div3, "click", /*click*/ ctx[11], false, false, false),
    					listen_dev(div3, "click", /*click_handler*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_prepend_slot_changes, get_prepend_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (subtitle_slot) {
    				if (subtitle_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(subtitle_slot, subtitle_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_subtitle_slot_changes, get_subtitle_slot_context);
    				}
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_append_slot_changes, get_append_slot_context);
    				}
    			}

    			if (!current || dirty & /*klass*/ 2 && div3_class_value !== (div3_class_value = "s-list-item " + /*klass*/ ctx[1])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*link*/ 64 && div3_tabindex_value !== (div3_tabindex_value = /*link*/ ctx[6] ? 0 : -1)) {
    				attr_dev(div3, "tabindex", div3_tabindex_value);
    			}

    			if (!current || dirty & /*active*/ 1 && div3_aria_selected_value !== (div3_aria_selected_value = /*role*/ ctx[10] === "option" ? /*active*/ ctx[0] : null)) {
    				attr_dev(div3, "aria-selected", div3_aria_selected_value);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(div3, "style", /*style*/ ctx[9]);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 5) Class_action.update.call(null, [/*active*/ ctx[0] && /*activeClass*/ ctx[2]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 256) Ripple_action.update.call(null, /*ripple*/ ctx[8]);

    			if (dirty & /*klass, dense*/ 10) {
    				toggle_class(div3, "dense", /*dense*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 18) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*klass, multiline*/ 34) {
    				toggle_class(div3, "multiline", /*multiline*/ ctx[5]);
    			}

    			if (dirty & /*klass, link*/ 66) {
    				toggle_class(div3, "link", /*link*/ ctx[6]);
    			}

    			if (dirty & /*klass, selectable*/ 130) {
    				toggle_class(div3, "selectable", /*selectable*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(subtitle_slot, local);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(subtitle_slot, local);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (subtitle_slot) subtitle_slot.d(detaching);
    			if (append_slot) append_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItem", slots, ['prepend','default','subtitle','append']);
    	const role = getContext("S_ListItemRole");
    	const ITEM_GROUP = getContext("S_ListItemGroup");

    	const DEFAULTS = {
    		select: () => null,
    		register: () => null,
    		index: () => null,
    		activeClass: "active"
    	};

    	const ITEM = ITEM_GROUP ? getContext(ITEM_GROUP) : DEFAULTS;
    	let { class: klass = "" } = $$props;
    	let { activeClass = ITEM.activeClass } = $$props;
    	let { value = ITEM.index() } = $$props;
    	let { active = false } = $$props;
    	let { dense = false } = $$props;
    	let { disabled = null } = $$props;
    	let { multiline = false } = $$props;
    	let { link = role } = $$props;
    	let { selectable = !link } = $$props;
    	let { ripple = getContext("S_ListItemRipple") || role || false } = $$props;
    	let { style = null } = $$props;

    	ITEM.register(values => {
    		$$invalidate(0, active = values.includes(value));
    	});

    	function click() {
    		if (!disabled) ITEM.select(value);
    	}

    	const writable_props = [
    		"class",
    		"activeClass",
    		"value",
    		"active",
    		"dense",
    		"disabled",
    		"multiline",
    		"link",
    		"selectable",
    		"ripple",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListItem> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("dense" in $$props) $$invalidate(3, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(5, multiline = $$props.multiline);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("selectable" in $$props) $$invalidate(7, selectable = $$props.selectable);
    		if ("ripple" in $$props) $$invalidate(8, ripple = $$props.ripple);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		Ripple,
    		Class,
    		role,
    		ITEM_GROUP,
    		DEFAULTS,
    		ITEM,
    		klass,
    		activeClass,
    		value,
    		active,
    		dense,
    		disabled,
    		multiline,
    		link,
    		selectable,
    		ripple,
    		style,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("dense" in $$props) $$invalidate(3, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(5, multiline = $$props.multiline);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("selectable" in $$props) $$invalidate(7, selectable = $$props.selectable);
    		if ("ripple" in $$props) $$invalidate(8, ripple = $$props.ripple);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		activeClass,
    		dense,
    		disabled,
    		multiline,
    		link,
    		selectable,
    		ripple,
    		style,
    		role,
    		click,
    		value,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			class: 1,
    			activeClass: 2,
    			value: 12,
    			active: 0,
    			dense: 3,
    			disabled: 4,
    			multiline: 5,
    			link: 6,
    			selectable: 7,
    			ripple: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get class() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiline() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiline(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectable() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectable(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\AppBar\AppBar.svelte generated by Svelte v3.31.2 */
    const file$5 = "node_modules\\svelte-materialify\\dist\\components\\AppBar\\AppBar.svelte";
    const get_extension_slot_changes = dirty => ({});
    const get_extension_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});
    const get_icon_slot_changes = dirty => ({});
    const get_icon_slot_context = ctx => ({});

    // (108:4) {#if !collapsed}
    function create_if_block$1(ctx) {
    	let div;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[11].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[10], get_title_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (title_slot) title_slot.c();
    			attr_dev(div, "class", "s-app-bar__title");
    			add_location(div, file$5, 108, 6, 2271);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (title_slot) {
    				title_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_title_slot_changes, get_title_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (title_slot) title_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(108:4) {#if !collapsed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let header;
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let header_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	const icon_slot_template = /*#slots*/ ctx[11].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[10], get_icon_slot_context);
    	let if_block = !/*collapsed*/ ctx[8] && create_if_block$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const extension_slot_template = /*#slots*/ ctx[11].extension;
    	const extension_slot = create_slot(extension_slot_template, ctx, /*$$scope*/ ctx[10], get_extension_slot_context);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			if (icon_slot) icon_slot.c();
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (extension_slot) extension_slot.c();
    			attr_dev(div, "class", "s-app-bar__wrapper");
    			add_location(div, file$5, 105, 2, 2186);
    			attr_dev(header, "class", header_class_value = "s-app-bar " + /*klass*/ ctx[0]);
    			attr_dev(header, "style", /*style*/ ctx[9]);
    			toggle_class(header, "tile", /*tile*/ ctx[2]);
    			toggle_class(header, "flat", /*flat*/ ctx[3]);
    			toggle_class(header, "dense", /*dense*/ ctx[4]);
    			toggle_class(header, "prominent", /*prominent*/ ctx[5]);
    			toggle_class(header, "fixed", /*fixed*/ ctx[6]);
    			toggle_class(header, "absolute", /*absolute*/ ctx[7]);
    			toggle_class(header, "collapsed", /*collapsed*/ ctx[8]);
    			add_location(header, file$5, 94, 0, 1987);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div);

    			if (icon_slot) {
    				icon_slot.m(div, null);
    			}

    			append_dev(div, t0);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t1);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(header, t2);

    			if (extension_slot) {
    				extension_slot.m(header, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, header, { "app-bar-height": /*height*/ ctx[1] }));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (icon_slot) {
    				if (icon_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(icon_slot, icon_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_icon_slot_changes, get_icon_slot_context);
    				}
    			}

    			if (!/*collapsed*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (extension_slot) {
    				if (extension_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(extension_slot, extension_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_extension_slot_changes, get_extension_slot_context);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && header_class_value !== (header_class_value = "s-app-bar " + /*klass*/ ctx[0])) {
    				attr_dev(header, "class", header_class_value);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(header, "style", /*style*/ ctx[9]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*height*/ 2) Style_action.update.call(null, { "app-bar-height": /*height*/ ctx[1] });

    			if (dirty & /*klass, tile*/ 5) {
    				toggle_class(header, "tile", /*tile*/ ctx[2]);
    			}

    			if (dirty & /*klass, flat*/ 9) {
    				toggle_class(header, "flat", /*flat*/ ctx[3]);
    			}

    			if (dirty & /*klass, dense*/ 17) {
    				toggle_class(header, "dense", /*dense*/ ctx[4]);
    			}

    			if (dirty & /*klass, prominent*/ 33) {
    				toggle_class(header, "prominent", /*prominent*/ ctx[5]);
    			}

    			if (dirty & /*klass, fixed*/ 65) {
    				toggle_class(header, "fixed", /*fixed*/ ctx[6]);
    			}

    			if (dirty & /*klass, absolute*/ 129) {
    				toggle_class(header, "absolute", /*absolute*/ ctx[7]);
    			}

    			if (dirty & /*klass, collapsed*/ 257) {
    				toggle_class(header, "collapsed", /*collapsed*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			transition_in(extension_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_slot, local);
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			transition_out(extension_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (icon_slot) icon_slot.d(detaching);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (extension_slot) extension_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AppBar", slots, ['icon','title','default','extension']);
    	let { class: klass = "" } = $$props;
    	let { height = "56px" } = $$props;
    	let { tile = false } = $$props;
    	let { flat = false } = $$props;
    	let { dense = false } = $$props;
    	let { prominent = false } = $$props;
    	let { fixed = false } = $$props;
    	let { absolute = false } = $$props;
    	let { collapsed = false } = $$props;
    	let { style = "" } = $$props;

    	const writable_props = [
    		"class",
    		"height",
    		"tile",
    		"flat",
    		"dense",
    		"prominent",
    		"fixed",
    		"absolute",
    		"collapsed",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AppBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("tile" in $$props) $$invalidate(2, tile = $$props.tile);
    		if ("flat" in $$props) $$invalidate(3, flat = $$props.flat);
    		if ("dense" in $$props) $$invalidate(4, dense = $$props.dense);
    		if ("prominent" in $$props) $$invalidate(5, prominent = $$props.prominent);
    		if ("fixed" in $$props) $$invalidate(6, fixed = $$props.fixed);
    		if ("absolute" in $$props) $$invalidate(7, absolute = $$props.absolute);
    		if ("collapsed" in $$props) $$invalidate(8, collapsed = $$props.collapsed);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		height,
    		tile,
    		flat,
    		dense,
    		prominent,
    		fixed,
    		absolute,
    		collapsed,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("tile" in $$props) $$invalidate(2, tile = $$props.tile);
    		if ("flat" in $$props) $$invalidate(3, flat = $$props.flat);
    		if ("dense" in $$props) $$invalidate(4, dense = $$props.dense);
    		if ("prominent" in $$props) $$invalidate(5, prominent = $$props.prominent);
    		if ("fixed" in $$props) $$invalidate(6, fixed = $$props.fixed);
    		if ("absolute" in $$props) $$invalidate(7, absolute = $$props.absolute);
    		if ("collapsed" in $$props) $$invalidate(8, collapsed = $$props.collapsed);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		height,
    		tile,
    		flat,
    		dense,
    		prominent,
    		fixed,
    		absolute,
    		collapsed,
    		style,
    		$$scope,
    		slots
    	];
    }

    class AppBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			class: 0,
    			height: 1,
    			tile: 2,
    			flat: 3,
    			dense: 4,
    			prominent: 5,
    			fixed: 6,
    			absolute: 7,
    			collapsed: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppBar",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prominent() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prominent(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get collapsed() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collapsed(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\NavigationDrawer\NavigationDrawer.svelte generated by Svelte v3.31.2 */
    const file$6 = "node_modules\\svelte-materialify\\dist\\components\\NavigationDrawer\\NavigationDrawer.svelte";
    const get_append_slot_changes$1 = dirty => ({});
    const get_append_slot_context$1 = ctx => ({});
    const get_prepend_slot_changes$1 = dirty => ({});
    const get_prepend_slot_context$1 = ctx => ({});

    // (125:2) {#if !borderless}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "s-navigation-drawer__border");
    			add_location(div, file$6, 125, 4, 2822);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(125:2) {#if !borderless}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let aside;
    	let t0;
    	let div;
    	let t1;
    	let t2;
    	let aside_class_value;
    	let Style_action;
    	let aside_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[15].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[14], get_prepend_slot_context$1);
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
    	const append_slot_template = /*#slots*/ ctx[15].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[14], get_append_slot_context$1);
    	let if_block = !/*borderless*/ ctx[8] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			if (prepend_slot) prepend_slot.c();
    			t0 = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (append_slot) append_slot.c();
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "s-navigation-drawer__content");
    			add_location(div, file$6, 120, 2, 2708);
    			attr_dev(aside, "class", aside_class_value = "s-navigation-drawer " + /*klass*/ ctx[0]);
    			attr_dev(aside, "style", /*style*/ ctx[13]);
    			toggle_class(aside, "active", /*active*/ ctx[2]);
    			toggle_class(aside, "fixed", /*fixed*/ ctx[3]);
    			toggle_class(aside, "absolute", /*absolute*/ ctx[4]);
    			toggle_class(aside, "right", /*right*/ ctx[5]);
    			toggle_class(aside, "mini", /*mini*/ ctx[6]);
    			toggle_class(aside, "clipped", /*clipped*/ ctx[7]);
    			add_location(aside, file$6, 107, 0, 2381);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(aside, null);
    			}

    			append_dev(aside, t0);
    			append_dev(aside, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(aside, t1);

    			if (append_slot) {
    				append_slot.m(aside, null);
    			}

    			append_dev(aside, t2);
    			if (if_block) if_block.m(aside, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(aside, "hover", /*hover_handler*/ ctx[16], false, false, false),
    					action_destroyer(Style_action = Style.call(null, aside, {
    						"nav-width": /*width*/ ctx[1],
    						"nav-min-width": /*miniWidth*/ ctx[9],
    						"nav-clipped-height": /*clippedHeight*/ ctx[10]
    					}))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (prepend_slot) {
    				if (prepend_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_prepend_slot_changes$1, get_prepend_slot_context$1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
    				}
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_append_slot_changes$1, get_append_slot_context$1);
    				}
    			}

    			if (!/*borderless*/ ctx[8]) {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(aside, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*klass*/ 1 && aside_class_value !== (aside_class_value = "s-navigation-drawer " + /*klass*/ ctx[0])) {
    				attr_dev(aside, "class", aside_class_value);
    			}

    			if (!current || dirty & /*style*/ 8192) {
    				attr_dev(aside, "style", /*style*/ ctx[13]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*width, miniWidth, clippedHeight*/ 1538) Style_action.update.call(null, {
    				"nav-width": /*width*/ ctx[1],
    				"nav-min-width": /*miniWidth*/ ctx[9],
    				"nav-clipped-height": /*clippedHeight*/ ctx[10]
    			});

    			if (dirty & /*klass, active*/ 5) {
    				toggle_class(aside, "active", /*active*/ ctx[2]);
    			}

    			if (dirty & /*klass, fixed*/ 9) {
    				toggle_class(aside, "fixed", /*fixed*/ ctx[3]);
    			}

    			if (dirty & /*klass, absolute*/ 17) {
    				toggle_class(aside, "absolute", /*absolute*/ ctx[4]);
    			}

    			if (dirty & /*klass, right*/ 33) {
    				toggle_class(aside, "right", /*right*/ ctx[5]);
    			}

    			if (dirty & /*klass, mini*/ 65) {
    				toggle_class(aside, "mini", /*mini*/ ctx[6]);
    			}

    			if (dirty & /*klass, clipped*/ 129) {
    				toggle_class(aside, "clipped", /*clipped*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(append_slot, local);

    			add_render_callback(() => {
    				if (!aside_transition) aside_transition = create_bidirectional_transition(aside, /*transition*/ ctx[11], /*transitionOpts*/ ctx[12], true);
    				aside_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(append_slot, local);
    			if (!aside_transition) aside_transition = create_bidirectional_transition(aside, /*transition*/ ctx[11], /*transitionOpts*/ ctx[12], false);
    			aside_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (append_slot) append_slot.d(detaching);
    			if (if_block) if_block.d();
    			if (detaching && aside_transition) aside_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavigationDrawer", slots, ['prepend','default','append']);
    	let { class: klass = "" } = $$props;
    	let { width = "256px" } = $$props;
    	let { active = true } = $$props;
    	let { fixed = false } = $$props;
    	let { absolute = false } = $$props;
    	let { right = false } = $$props;
    	let { mini = false } = $$props;
    	let { clipped = false } = $$props;
    	let { borderless = false } = $$props;
    	let { miniWidth = "56px" } = $$props;
    	let { clippedHeight = "56px" } = $$props;
    	let { transition = fade } = $$props;
    	let { transitionOpts = {} } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"class",
    		"width",
    		"active",
    		"fixed",
    		"absolute",
    		"right",
    		"mini",
    		"clipped",
    		"borderless",
    		"miniWidth",
    		"clippedHeight",
    		"transition",
    		"transitionOpts",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavigationDrawer> was created with unknown prop '${key}'`);
    	});

    	function hover_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    		if ("fixed" in $$props) $$invalidate(3, fixed = $$props.fixed);
    		if ("absolute" in $$props) $$invalidate(4, absolute = $$props.absolute);
    		if ("right" in $$props) $$invalidate(5, right = $$props.right);
    		if ("mini" in $$props) $$invalidate(6, mini = $$props.mini);
    		if ("clipped" in $$props) $$invalidate(7, clipped = $$props.clipped);
    		if ("borderless" in $$props) $$invalidate(8, borderless = $$props.borderless);
    		if ("miniWidth" in $$props) $$invalidate(9, miniWidth = $$props.miniWidth);
    		if ("clippedHeight" in $$props) $$invalidate(10, clippedHeight = $$props.clippedHeight);
    		if ("transition" in $$props) $$invalidate(11, transition = $$props.transition);
    		if ("transitionOpts" in $$props) $$invalidate(12, transitionOpts = $$props.transitionOpts);
    		if ("style" in $$props) $$invalidate(13, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		Style,
    		klass,
    		width,
    		active,
    		fixed,
    		absolute,
    		right,
    		mini,
    		clipped,
    		borderless,
    		miniWidth,
    		clippedHeight,
    		transition,
    		transitionOpts,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    		if ("fixed" in $$props) $$invalidate(3, fixed = $$props.fixed);
    		if ("absolute" in $$props) $$invalidate(4, absolute = $$props.absolute);
    		if ("right" in $$props) $$invalidate(5, right = $$props.right);
    		if ("mini" in $$props) $$invalidate(6, mini = $$props.mini);
    		if ("clipped" in $$props) $$invalidate(7, clipped = $$props.clipped);
    		if ("borderless" in $$props) $$invalidate(8, borderless = $$props.borderless);
    		if ("miniWidth" in $$props) $$invalidate(9, miniWidth = $$props.miniWidth);
    		if ("clippedHeight" in $$props) $$invalidate(10, clippedHeight = $$props.clippedHeight);
    		if ("transition" in $$props) $$invalidate(11, transition = $$props.transition);
    		if ("transitionOpts" in $$props) $$invalidate(12, transitionOpts = $$props.transitionOpts);
    		if ("style" in $$props) $$invalidate(13, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		width,
    		active,
    		fixed,
    		absolute,
    		right,
    		mini,
    		clipped,
    		borderless,
    		miniWidth,
    		clippedHeight,
    		transition,
    		transitionOpts,
    		style,
    		$$scope,
    		slots,
    		hover_handler
    	];
    }

    class NavigationDrawer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 0,
    			width: 1,
    			active: 2,
    			fixed: 3,
    			absolute: 4,
    			right: 5,
    			mini: 6,
    			clipped: 7,
    			borderless: 8,
    			miniWidth: 9,
    			clippedHeight: 10,
    			transition: 11,
    			transitionOpts: 12,
    			style: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationDrawer",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mini() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mini(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clipped() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clipped(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderless() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderless(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get miniWidth() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set miniWidth(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clippedHeight() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clippedHeight(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionOpts() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionOpts(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Grid\Container.svelte generated by Svelte v3.31.2 */

    const file$7 = "node_modules\\svelte-materialify\\dist\\components\\Grid\\Container.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-container " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[2]);
    			toggle_class(div, "fluid", /*fluid*/ ctx[1]);
    			add_location(div, file$7, 34, 0, 609);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-container " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(div, "style", /*style*/ ctx[2]);
    			}

    			if (dirty & /*klass, fluid*/ 3) {
    				toggle_class(div, "fluid", /*fluid*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Container", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { fluid = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "fluid", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Container> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("fluid" in $$props) $$invalidate(1, fluid = $$props.fluid);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, fluid, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("fluid" in $$props) $$invalidate(1, fluid = $$props.fluid);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, fluid, style, $$scope, slots];
    }

    class Container extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { class: 0, fluid: 1, style: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Container",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fluid() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fluid(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.2 */

    const file$8 = "src\\App.svelte";

    // (10:10) <Button fab depressed on:click={() => {active = !active}}>
    function create_default_slot_6(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { class: "mdi mdi-menu" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(10:10) <Button fab depressed on:click={() => {active = !active}}>",
    		ctx
    	});

    	return block;
    }

    // (9:8) <div slot="icon">
    function create_icon_slot(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				fab: true,
    				depressed: true,
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "slot", "icon");
    			add_location(div, file$8, 8, 8, 257);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_icon_slot.name,
    		type: "slot",
    		source: "(9:8) <div slot=\\\"icon\\\">",
    		ctx
    	});

    	return block;
    }

    // (14:8) <span slot="title">
    function create_title_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "OneUI";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$8, 13, 8, 429);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(14:8) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:4) <AppBar>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(8:4) <AppBar>",
    		ctx
    	});

    	return block;
    }

    // (18:12) <ListItem>
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Users");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(18:12) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (17:8) <List>
    function create_default_slot_3(ctx) {
    	let listitem;
    	let current;

    	listitem = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				listitem_changes.$$scope = { dirty, ctx };
    			}

    			listitem.$set(listitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(17:8) <List>",
    		ctx
    	});

    	return block;
    }

    // (21:10) <Button block>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Logout");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(21:10) <Button block>",
    		ctx
    	});

    	return block;
    }

    // (20:8) <span slot="append" class="pa-2">
    function create_append_slot(ctx) {
    	let span;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				block: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr_dev(span, "slot", "append");
    			attr_dev(span, "class", "pa-2");
    			add_location(span, file$8, 19, 8, 600);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_slot.name,
    		type: "slot",
    		source: "(20:8) <span slot=\\\"append\\\" class=\\\"pa-2\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:4) <NavigationDrawer clipped {mini} {active}>
    function create_default_slot_1(ctx) {
    	let list;
    	let t;
    	let current;

    	list = new List({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(list.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(list, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(list, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(16:4) <NavigationDrawer clipped {mini} {active}>",
    		ctx
    	});

    	return block;
    }

    // (7:0) <MaterialApp theme={theme}>
    function create_default_slot(ctx) {
    	let appbar;
    	let t;
    	let navigationdrawer;
    	let current;

    	appbar = new AppBar({
    			props: {
    				$$slots: {
    					default: [create_default_slot_5],
    					title: [create_title_slot],
    					icon: [create_icon_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	navigationdrawer = new NavigationDrawer({
    			props: {
    				clipped: true,
    				mini: /*mini*/ ctx[2],
    				active: /*active*/ ctx[0],
    				$$slots: {
    					default: [create_default_slot_1],
    					append: [create_append_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(appbar.$$.fragment);
    			t = space();
    			create_component(navigationdrawer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(appbar, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(navigationdrawer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const appbar_changes = {};

    			if (dirty & /*$$scope, active*/ 17) {
    				appbar_changes.$$scope = { dirty, ctx };
    			}

    			appbar.$set(appbar_changes);
    			const navigationdrawer_changes = {};
    			if (dirty & /*active*/ 1) navigationdrawer_changes.active = /*active*/ ctx[0];

    			if (dirty & /*$$scope*/ 16) {
    				navigationdrawer_changes.$$scope = { dirty, ctx };
    			}

    			navigationdrawer.$set(navigationdrawer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appbar.$$.fragment, local);
    			transition_in(navigationdrawer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appbar.$$.fragment, local);
    			transition_out(navigationdrawer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(appbar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(navigationdrawer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(7:0) <MaterialApp theme={theme}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				theme: /*theme*/ ctx[1],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(materialapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(materialapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, active*/ 17) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(materialapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let theme = "dark";
    	let active = false;
    	let mini = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, active = !active);
    	};

    	$$self.$capture_state = () => ({
    		MaterialApp,
    		Button,
    		Container,
    		AppBar,
    		Icon,
    		NavigationDrawer,
    		List,
    		ListItem,
    		theme,
    		active,
    		mini
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(1, theme = $$props.theme);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("mini" in $$props) $$invalidate(2, mini = $$props.mini);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, theme, mini, click_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const app = {
        app: null
    };
    window.addEventListener('load', () => {
        app.app = new App({
            target: document.body,
        });
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
