/** The debug object will be exposed on the Window in browser contexts for easy access. */
export interface DebugMap {
  [key: string]: any,
  flag: {
    [name:string]: boolean,
    events: boolean
  }
}


export var debug:DebugMap = {
  flag: {events: false}
};

// @NOTE: `debug` is taken by chrome for breakpoint creation.
if(typeof window !== "undefined") (window as any).dbg = debug;
