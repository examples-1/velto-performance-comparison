(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
      }
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
var HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
var SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
var BOOLEAN_ATTRIBUTE = "checked,disabled,readonly,required,multiple,autofocus,selected,hidden,controls,loop,muted,autoplay,playsinline,novalidate,formnovalidate,open,itemscope,default,inert,nomodule,ismap,allowfullscreen";
function stringCurrying(str, lowerCase) {
  const map = /* @__PURE__ */ Object.create(null);
  const list2 = str.split(",");
  for (let i = 0; i < list2.length; i++) {
    map[list2[i]] = true;
  }
  return (val) => !!map[val.toLowerCase()];
}
stringCurrying(HTML_TAGS);
stringCurrying(SVG_TAGS);
var isBooleanAttribute = stringCurrying(BOOLEAN_ATTRIBUTE);
var isString = (val) => typeof val === "string";
var isFunction = (val) => typeof val === "function";
var isArray = Array.isArray;
var isObject = (val) => val !== null && typeof val === "object";
var toTypeString = (value) => Object.prototype.toString.call(value);
var isMap = (val) => toTypeString(val) === "[object Map]";
var isSet = (val) => toTypeString(val) === "[object Set]";
var isPlainObject = (val) => toTypeString(val) === "[object Object]";
var camelize = (str) => str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : "");
var capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
var hyphenate = (str) => str.replace(/\B([A-Z])/g, "-$1").toLowerCase();
var isEvent = (key) => /^on[^a-z]/.test(key);
function callUnstableFunc(fn, args) {
  try {
    return fn(...args != null ? args : []);
  } catch (err) {
    console.log(err);
  }
  return null;
}
function omit(obj, keys) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key))
  );
}
var createDep = () => {
  const dep = /* @__PURE__ */ new Set();
  return dep;
};
var activeEffect;
var shouldTrackEffect = false;
var Effect = class {
  constructor(fn, scheduler = null) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
  }
  run() {
    let lastShouldTrack = shouldTrackEffect;
    let lastEffect = activeEffect;
    try {
      shouldTrackEffect = true;
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = lastEffect;
      shouldTrackEffect = lastShouldTrack;
    }
  }
  destroy() {
    this.active = false;
    this.run();
    this.active = true;
  }
};
var isFlushPending = false;
var flushIndex = 0;
var queue = [];
var resolvedPromise = Promise.resolve();
function enqueueScheduler(schedule) {
  let insertIndex = 0;
  const existInQueue = queue.some((item2, index) => {
    if (item2.id < schedule.id) {
      insertIndex = index + 1;
    }
    return item2.id === schedule.id && item2.ref === schedule.ref;
  });
  if (!queue.length || !existInQueue) {
    queue.splice(insertIndex, 0, schedule);
  }
  flushMicrotasks();
}
function flushMicrotasks() {
  if (!isFlushPending) {
    isFlushPending = true;
    resolvedPromise.then(flushQueue);
  }
}
function flushQueue() {
  isFlushPending = false;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const schedule = queue[flushIndex];
      if (schedule) {
        callUnstableFunc(schedule);
      }
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
  }
}
function trackEffect(activeEffect2, reactive) {
  const dep = reactive.dep;
  if (activeEffect2) {
    dep.add(activeEffect2);
  }
}
function triggerEffect(key, dep) {
  dep == null ? void 0 : dep.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler.ref = key;
      enqueueScheduler(effect.scheduler);
    }
  });
}
var _a2;
_a2 = "__isRef";
var Ref = class {
  constructor(value) {
    this[_a2] = true;
    this.dep = createDep();
    this._value = value;
  }
  get value() {
    trackEffect(activeEffect, this);
    return this._value;
  }
  setValue(newVal) {
    this._value = newVal;
    triggerEffect(this, this.dep);
  }
};
function ref(value) {
  return new Ref(value);
}
var toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === Object.prototype.toString || !isFunction(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
var replacer = (_key, val) => {
  if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2]) => {
        entries[`${key} =>`] = val2;
        return entries;
      }, {})
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()]
    };
  } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
function markRender(fn) {
  const render = fn;
  render.__isRender = true;
  return render;
}
function isRender(express) {
  return isFunction(express) && express.__isRender;
}
function normalizeContainer(container) {
  if (isString(container)) {
    return document.querySelector(container);
  }
  return container;
}
var callHook = (lifecycle, instance) => {
  const hook = instance == null ? void 0 : instance[lifecycle];
  if (!hook) {
    return;
  }
  if (isArray(hook)) {
    hook.forEach((h) => callUnstableFunc(h));
  } else {
    callUnstableFunc(hook);
  }
};
var uid = 0;
function getComponentInstance(type, props) {
  return {
    uid: uid++,
    type,
    props,
    template: void 0,
    target: void 0,
    anchor: void 0,
    isCreated: false,
    isMounted: false,
    [
      "created"
      /* CREATED */
    ]: null,
    [
      "beforeMount"
      /* BEFORE_MOUNT */
    ]: null,
    [
      "mounted"
      /* MOUNTED */
    ]: null,
    [
      "beforeUpdate"
      /* BEFORE_UPDATE */
    ]: null,
    [
      "updated"
      /* UPDATED */
    ]: null,
    [
      "beforeDestroy"
      /* BEFORE_DESTROY */
    ]: null,
    [
      "destroyed"
      /* DESTROYED */
    ]: null
  };
}
function component(type, props) {
  var _a, _b;
  const componentProps = omit(props, ["ref"]);
  let instance = getComponentInstance(type, componentProps);
  if (!!props.ref) {
    (_b = (_a = props.ref) == null ? void 0 : _a.setValue) == null ? void 0 : _b.call(_a, instance);
  }
  const fn = () => {
    if (!instance.isMounted) {
      if (!instance.isCreated) {
        const render = instance.type(instance.props);
        instance.template = render();
        instance.isCreated = true;
        callHook("created", instance);
      }
      callHook("beforeMount", instance);
      instance.template.mount(instance.target, instance.anchor);
      instance.isMounted = true;
      callHook("mounted", instance);
    } else if (!effect.active) {
      callHook("beforeDestroy", instance);
      instance.template.destroy();
      instance = getComponentInstance(type, instance.props);
      callHook("destroyed", instance);
    } else {
      callHook("beforeUpdate", instance);
      instance.template.update();
      callHook("updated", instance);
    }
  };
  const scheduler = () => {
    effect.run();
  };
  scheduler.id = instance.uid;
  const effect = new Effect(fn, scheduler);
  return {
    mount(target, anchor) {
      instance.target = target;
      instance.anchor = anchor;
      effect.run();
    },
    destroy() {
      effect.destroy();
    }
  };
}
var doc = typeof document !== "undefined" ? document : null;
var append = (parent, child, anchor) => {
  if (anchor) {
    return insert(parent, child, anchor);
  }
  parent.appendChild(child);
};
var insert = (parent, child, anchor) => {
  parent.insertBefore(child, anchor || null);
};
var remove = (child) => {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
};
var createElement = (tag, isSVG, is) => {
  const el = doc.createElement(tag, void 0);
  return el;
};
var text = (text2) => doc.createTextNode(text2);
function classe(el, value, isSVG) {
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
function style(el, value) {
  if (!value) {
    return el.removeAttribute("style");
  }
  const style2 = el.style;
  if (isString(value)) {
    style2.cssText = value;
  } else {
    for (const key in value) {
      resolveStyle(style2, key, value[key]);
    }
  }
}
function resolveStyle(style2, name, val) {
  if (isArray(val)) {
    val.forEach((v) => resolveStyle(style2, name, v));
  } else {
    if (val == null) val = "";
    if (name.startsWith("--")) {
      style2.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style2, name);
      const importantRE = /\s*!important$/;
      if (importantRE.test(val)) {
        style2.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style2[prefixed] = val;
      }
    }
  }
}
var prefixCache = {};
function autoPrefix(style2, rawName) {
  const prefixes = ["Webkit", "Moz", "ms"];
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style2) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style2) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
var eventListenerMap = /* @__PURE__ */ new WeakMap();
function event(el, eventName, value, options) {
  let elEventMap = eventListenerMap.get(el);
  if (!elEventMap) {
    elEventMap = {};
    eventListenerMap.set(el, elEventMap);
  }
  const oldEventValue = elEventMap[eventName];
  if (oldEventValue === value) {
    return;
  }
  const name = eventName.slice(2).toLocaleLowerCase();
  if (value) {
    addEventListener(el, name, value, options);
    elEventMap[eventName] = value;
  } else if (oldEventValue) {
    removeEventListener(el, name, oldEventValue, options);
    delete elEventMap[eventName];
  }
}
function addEventListener(el, event2, handler, options) {
  el.addEventListener(event2, handler, options);
}
function removeEventListener(el, event2, handler, options) {
  el.removeEventListener(event2, handler, options);
}
var xlinkNS = "http://www.w3.org/1999/xlink";
function attr(el, key, value, isSVG) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    const isBoolean = isBooleanAttribute(key);
    if (value == null || isBoolean && !(value || value === "")) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, isBoolean ? "" : value);
    }
  }
}
var setAttribute = (el, key, value, isSVG = false) => {
  var _a;
  if (key === "ref") {
    (_a = value == null ? void 0 : value.setValue) == null ? void 0 : _a.call(value, el);
  } else if (key === "class") {
    classe(el, value, isSVG);
  } else if (key === "style") {
    style(el, value);
  } else if (isEvent(key)) {
    event(el, key, value);
  } else {
    attr(el, key, value, isSVG);
  }
};
function element(tag, props) {
  const el = createElement(tag);
  return {
    el,
    mount: (target, anchor) => {
      append(target, el, anchor);
      for (let attr2 in props) {
        setAttribute(el, attr2, props[attr2]);
      }
    },
    update(newProps) {
      for (let attr2 in newProps) {
        if (newProps[attr2] !== (props == null ? void 0 : props[attr2])) {
          setAttribute(el, attr2, newProps[attr2]);
        }
      }
      props = newProps;
    },
    destroy() {
      remove(el);
    }
  };
}
function expression(express) {
  if (isRender(express)) return express();
  let cacheTarget;
  let cacheAnchor;
  let node;
  const update = (express2) => {
    const content = toDisplayString(express2);
    if (!node) {
      node = text(content);
      insert(cacheTarget, node, cacheAnchor);
    } else {
      node.nodeValue = content;
    }
  };
  return {
    mount: (target, anchor) => {
      cacheTarget = target;
      cacheAnchor = anchor;
      update(express);
    },
    update(newExpress) {
      if (express !== newExpress) {
        update(newExpress);
      }
      express = newExpress;
    },
    destroy: () => {
      if (node) {
        remove(node);
        node = void 0;
      }
    }
  };
}
function createApp(type, containerOrSelector, init = {}) {
  const container = normalizeContainer(containerOrSelector);
  if (container) {
    container.innerHTML = "";
    component(type, init).mount(container);
  }
}
const wrap = "_wrap_1ko7g_1";
const list = "_list_1ko7g_4";
const item = "_item_1ko7g_8";
const styles$1 = {
  wrap,
  list,
  item
};
let count = 0;
function List() {
  const list2 = ref([]);
  const running = ref(false);
  const el = document.createElement("div");
  el.addEventListener("click", () => {
    for (let j = 0; j < 50; j++) {
      list2.value.unshift({
        id: count++,
        name: "小丽 unshift",
        grade: "一年级",
        age: 8
      });
      list2.setValue(list2.value);
    }
  });
  const singleAdd = async () => {
    el.click();
  };
  const batchAdd = async () => {
    running.setValue(true);
    let i = 0;
    const autoClick = () => {
      i++;
      el.click();
      if (i < 400) {
        setTimeout(autoClick, 200);
      } else {
        running.setValue(false);
      }
    };
    autoClick();
  };
  const li = list2.value.map((student) => markRender(() => {
    const _element = element("div", {
      class: styles$1.item
    });
    const _element3 = element("div", {});
    const _express = expression(student.id);
    const _element4 = element("div", {});
    const _express2 = expression(student.name);
    const _element5 = element("div", {});
    const _express3 = expression(student.grade);
    const _element6 = element("div", {});
    const _express4 = expression(student.age);
    return {
      mount(target, anchor) {
        _element.mount(target, anchor);
        _element3.mount(_element.el);
        _express.mount(_element3.el);
        _element4.mount(_element.el);
        _express2.mount(_element4.el);
        _element5.mount(_element.el);
        _express3.mount(_element5.el);
        _element6.mount(_element.el);
        _express4.mount(_element6.el);
      },
      update() {
        _element.update({
          class: styles$1.item
        });
        _express.update(student.id);
        _express2.update(student.name);
        _express3.update(student.grade);
        _express4.update(student.age);
      },
      destroy() {
        _element.destroy();
        _element3.destroy();
        _express.destroy();
        _element4.destroy();
        _express2.destroy();
        _element5.destroy();
        _express3.destroy();
        _element6.destroy();
        _express4.destroy();
      }
    };
  }));
  return markRender(() => {
    const _element7 = element("div", {
      class: styles$1.wrap
    });
    const _element8 = element("button", {
      onClick: batchAdd,
      disabled: running.value,
      style: "margin-right: 20px;"
    });
    const _text = text("\n        Batch Add\n      ");
    const _element9 = element("button", {
      onClick: singleAdd,
      disabled: running.value
    });
    const _text3 = text("\n        Single Add\n      ");
    const _element10 = element("div", {
      class: styles$1.list
    });
    const _express5 = expression(li);
    return {
      mount(target, anchor) {
        _element7.mount(target, anchor);
        _element8.mount(_element7.el);
        append(_element8.el, _text);
        _element9.mount(_element7.el);
        append(_element9.el, _text3);
        _element10.mount(_element7.el);
        _express5.mount(_element10.el);
      },
      update() {
        _element7.update({
          class: styles$1.wrap
        });
        _element8.update({
          onClick: batchAdd,
          disabled: running.value,
          style: "margin-right: 20px;"
        });
        _element9.update({
          onClick: singleAdd,
          disabled: running.value
        });
        _element10.update({
          class: styles$1.list
        });
        _express5.update(li);
      },
      destroy() {
        _element7.destroy();
        _element8.destroy();
        remove(_text);
        _element9.destroy();
        remove(_text3);
        _element10.destroy();
        _express5.destroy();
      }
    };
  });
}
const styles = {};
function App() {
  return markRender(() => {
    const _element = element("div", {
      class: styles.app
    });
    const _element3 = element("h1", {});
    const _text = text("Velto list");
    const _component = component(List, {});
    return {
      mount(target, anchor) {
        _element.mount(target, anchor);
        _element3.mount(_element.el);
        append(_element3.el, _text);
        _component.mount(_element.el);
      },
      update() {
        _element.update({
          class: styles.app
        });
      },
      destroy() {
        _element.destroy();
        _element3.destroy();
        remove(_text);
        _component.destroy();
      }
    };
  });
}
createApp(App, document.getElementById("app"));
