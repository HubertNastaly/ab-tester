import { EventName, EventPayload } from './events'

export const PORTS = {
  experiment: (experimentName: string) => `experiment-${experimentName}`,
}

type PortId = string

class Port {
  private eventTarget: EventTarget

  constructor() {
    this.eventTarget = new EventTarget()
  }

  public observe<T extends EventName>(
    eventName: T,
    callback: (payload: EventPayload[T]) => void
  ): void {
    this.eventTarget.addEventListener(eventName, (event) => {
      callback((event as CustomEvent<EventPayload[T]>).detail)
    })
  }

  public emit(event: CustomEvent) {
    this.eventTarget.dispatchEvent(event)
  }
}

class Observer {
  private ports: Record<PortId, Port>

  constructor() {
    this.ports = {}
  }

  public port(portId: PortId): Port {
    if (!this.ports[portId]) {
      this.ports[portId] = new Port()
    }
    return this.ports[portId]
  }

  public emit(event: CustomEvent) {
    this.port('global').emit(event)
  }

  public observe<T extends EventName>(
    eventName: T,
    callback: (payload: EventPayload[T]) => void
  ): void {
    this.port('global').observe(eventName, callback)
  }
}

export const observer = new Observer()
