/* eslint-disable @typescript-eslint/no-explicit-any */

type EventMap = {
  "chats:refresh": void;
};

type EventKey = keyof EventMap;
type EventCallback<T extends EventKey> = (data: EventMap[T]) => void;

class EventEmitter {
  private listeners: { [K in EventKey]?: EventCallback<K>[] } = {};

  on<T extends EventKey>(event: T, callback: EventCallback<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(callback as any);

    return () => {
      this.off(event, callback);
    };
  }

  off<T extends EventKey>(event: T, callback: EventCallback<T>) {
    if (!this.listeners[event]) return;

    const index = this.listeners[event]?.indexOf(callback as any);
    if (index !== undefined && index > -1) {
      this.listeners[event]?.splice(index, 1);
    }
  }

  emit<T extends EventKey>(event: T, data?: EventMap[T]) {
    this.listeners[event]?.forEach((callback) => callback(data as EventMap[T]));
  }
}

export const useEventEmitter = new EventEmitter();
