import {uElement} from "./microReact";

//-----------------------------------------------------
// Event dispatcher
//-----------------------------------------------------

export const DEBUG = false;
const EMPTY:never[] = [];

//-----------------------------------------------------
// Utils
//-----------------------------------------------------

export function clone<T>(instance: T): T {
  if(typeof instance !== "object") return instance;
  if("clone" in instance) return (instance as any).clone();
  if(instance.constructor === Array) return (instance as any).map((v:any) => v);
  let copy = new (instance.constructor as { new (): T })();
  for(let key in instance) {
    if(!instance.hasOwnProperty(key)) continue;
    copy[key] = clone(instance[key]);
  }
  return copy;
}

export const Keys = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  control: 17,
  alt: 18,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  super: 91,
  a: 65,
  z: 90,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
}

export var is_mobile = false; //window.innerHeight < 640 || window.innerWidth < 640;

//-----------------------------------------------------
// Dispatcher
//-----------------------------------------------------

export class Dispatcher {
  handlers: {[name:string]: Function[]} = {};

  on(name:string, event:string, func:Function) {
    let found = this.handlers[event];
    if(!found) {
      found = this.handlers[event] = [];
    }

    (func as any).handler_name = name;

    let ix = 0;
    for(let old of found) {
      if((old as any)._name === name) return;
      ix += 1;
    }
    if(ix < found.length) found.splice(ix, 1);
    found.push(func);
  }

  raise(name:string, args:any[]):any {
    let ret:any;
    for(let handler of this.handlers[name] || EMPTY) {
      if(DEBUG) {
        console.info("Calling: ", (handler as any).handler_name, args);
      }
      ret = handler.apply(null, args);
    }
    (window as any).redraw_editor();
    return ret;
  }
}

export let events = new Dispatcher();

export function raise(name:string, args:any[] = []):any {
  return function(e:any, elem:uElement) {
    let ev_args = args.slice();
    ev_args.push(e);
    ev_args.push(elem);
    events.raise(name, ev_args);
  }
}

export function trigger(name:string, e:any, elem:uElement):any {
  return exports.events.raise(name, [e, elem]);
}

export function stop(e:any):any {
  e.stopPropagation();
}

export function prevent(e:any):any {
  e.preventDefault();
}
