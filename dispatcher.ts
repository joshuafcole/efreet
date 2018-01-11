import {debug} from "./debug"
import {EMPTY} from "./utils";
import {uElement} from "./microReact";

//-----------------------------------------------------
// Dispatcher
//-----------------------------------------------------

export class Dispatcher {
  handlers: {[name:string]: Function[]} = {};
  eventRaised?: (name:string, args:any[]) => any;

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

  raise(name:string, args:any[]) {
    for(let handler of this.handlers[name] || EMPTY) {
      if(debug.flag.events) {
        console.info("Calling: ", (handler as any).handler_name, args);
      }
      handler.apply(null, args);
    }
    if(this.eventRaised) this.eventRaised(name, args);
  }
}

export let events = new Dispatcher();

export function raise(name:string, args:any[] = []) {
  return function(event:Event|object, elem:uElement) {
    let ev_args = args.slice();
    ev_args.push(event, elem);
    events.raise(name, ev_args);
  }
}

export function trigger(name:string, event:Event|object, elem:uElement) {
  return events.raise(name, [event, elem]);
}

export function stop(event:Event) {
  event.stopPropagation();
}

export function prevent(event:Event) {
  event.preventDefault();
}
