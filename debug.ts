/** The debug object will be exposed on the Window in browser contexts for easy access. */
export var debug:{[key: string]: any} = {};

// @NOTE: `debug` is taken by chrome for breakpoint creation.
if(typeof window !== "undefined") (window as any).dbg = debug;
