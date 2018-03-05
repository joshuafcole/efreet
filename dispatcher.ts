import {debug} from "./debug"
import {EMPTY} from "./utils";
import {uElement} from "./microReact";

//-----------------------------------------------------
// Dispatcher
//-----------------------------------------------------

export type DispatchFunction = Function&{handlerName?:string};

export class Dispatcher {
  handlers: {[name:string]: DispatchFunction[]} = {};
  eventRaised?: (name:string, args:any[]) => any;

  on(name:string, event:string, func:DispatchFunction) {
    let eventHandlers = this.handlers[event];
    if(!eventHandlers) eventHandlers = this.handlers[event] = [];
    func.handlerName = name;


    for(let ix = 0; ix < eventHandlers.length; ix += 1) {
      if(eventHandlers[ix].handlerName === name) {
        eventHandlers.splice(ix, 1);
        break;
      }
    }
    eventHandlers.push(func);
  }

  raise(name:string, args:any[]) {
    for(let handler of this.handlers[name] || EMPTY) {
      if(debug.flag.events) console.info("Calling: ", handler.handlerName, args);
      handler.apply(null, args);
    }
    if(this.eventRaised) this.eventRaised(name, args);
  }
}

export let events = new Dispatcher();

export function raise(name:string, args:any[] = []) {
  return function(event:Event|object, elem:uElement) {
    let eventArgs = args.slice();
    eventArgs.push(event, elem);
    events.raise(name, eventArgs);
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
