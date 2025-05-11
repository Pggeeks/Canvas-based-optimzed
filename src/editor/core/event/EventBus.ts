import { EventBus as CoreEventBus } from './eventbus/EventBus'
import { EventBusMap } from '../../interface/EventBus'

/**
 * A singleton wrapper for the EventBus
 */
export class EventBus {
  private static instance: CoreEventBus<EventBusMap>
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  /**
   * Get the singleton instance of EventBus
   */
  public static getInstance(): CoreEventBus<EventBusMap> {
    if (!EventBus.instance) {
      EventBus.instance = new CoreEventBus<EventBusMap>()
    }
    return EventBus.instance
  }
}
