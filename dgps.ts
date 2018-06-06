import {uElement} from "./microReact";
import {events, raise, trigger} from "./dispatcher";

import "./styles/dgps.styl";

export interface DGPSElement {
  id: string;
  visible?: boolean;
  render: () => uElement|undefined;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  leaving?: boolean;
}

export class DGPS {
  leaveTransientGracePeriod = 250;

  elements:DGPSElement[] = [];
  transients:DGPSElement[] = [];
  modals:DGPSElement[] = [];

  timeouts:{[id:string]: number|undefined, [id:number]: number|undefined} = {};

  addElement(elem:DGPSElement) {
    this.elements.push(elem);
    trigger("dgps/add", {type: "element", target: elem, dgps}, elem);
  }

  addTransient(elem:DGPSElement) {
    this.transients.push(elem);
    trigger("dgps/add", {type: "transient", target: elem, dgps}, elem);
  }

  addModal(elem:DGPSElement) {
    this.modals.push(elem);
    trigger("dgps/add", {type: "modal", target: elem, dgps}, elem);
  }

  has(id:string|number) {
    return !!this.get(id);
  }

  remove(id:string|number) {
    let elem = this.get(id);
    if(!elem) return;
    this.elements = this.elements.filter((element) => element.id !== id);
    this.transients = this.transients.filter((element) => element.id !== id);
    this.modals = this.modals.filter((element) => element.id !== id);
    trigger("dgps/remove", {target: elem, dgps}, elem);
  }

  get(id:string|number) {
    for(let elem of this.elements) {
      if(elem.id === id) return elem;
    }
    for(let elem of this.transients) {
      if(elem.id === id) return elem;
    }
    for(let elem of this.modals) {
      if(elem.id === id) return elem;
    }
  }

  clearModals() {
    for(let modal of dgps.modals) {
      dgps.remove(modal.id);
    }
  }

  leaveTransient(id:string) {
    let prev = this.timeouts[id];
    if(prev !== undefined) clearTimeout(prev);
    let elem = this.get(id);
    if(elem) elem.leaving = true;
    this.timeouts[id] = +setTimeout(() => this.remove(id), this.leaveTransientGracePeriod);
  }

  enterTransient(id:string) {
    let prev = this.timeouts[id];
    if(prev !== undefined) clearTimeout(prev);

    let elem = this.get(id);
    if(elem) elem.leaving = false;
  }

  $elemWrapper(c:string, element:DGPSElement, extra:object = {}):uElement|undefined {
    let {visible = true, id:elementId, x:left, y:top, width, height, leaving} = element;
    if(!visible) return;
    return {c, elementId, dgps: this, top, left, width, height, opacity: leaving ? 0 : 1, ...extra, children: [
      element.render()
    ]}

  }

  render():uElement|undefined {
    return {c: "dgps-wrapper", children: [
      this.elements.length ? {c: "dgps-element-container", children: this.elements.map(
        (element) => this.$elemWrapper("dgps-element", element)
      )} : undefined,

      this.modals.length ? {c: "dgps-modal-container", leave: {duration: 250}, children: [
        {c: "dgps-modal-shade", dgps, click:raise("dgps/clear-modals"), leave: {opacity: [0, 1], duration: 250}},
        ...this.modals.map(
          (modal) => this.$elemWrapper("dgps-modal", modal, {click: stop})
        )
      ]} : undefined,

      this.transients.length ? {c: "dgps-transient-container", children: this.transients.map(
        (transient) => this.$elemWrapper("dgps-transient", transient, {
          click: stop,
          mouseleave: raise("dgps/transient/leave"),
          mouseenter: raise("dgps/transient/enter"),
          tween: {opacity: true, duration: 150},
          enter: {opacity: 1, duration: 250},
          leave: {opacity: 0, duration: 250}
        })
      )} : undefined,
    ]};
  }
}

export let dgps = new DGPS();

events.on("clear modals", "dgps/clear-modals", (event:Event, {dgps}:{dgps:DGPS}) => {
  dgps.clearModals();
});

events.on("leave transient", "dgps/transient/leave", (event:Event, {dgps, elementId:id}:{dgps:DGPS, elementId:string}) => {
  dgps.leaveTransient(id);
});

events.on("enter transient", "dgps/transient/enter", (event:Event, {dgps, elementId:id}:{dgps:DGPS, elementId:string}) => {
  dgps.enterTransient(id);
});
