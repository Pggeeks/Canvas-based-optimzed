/**
 * EventBus event types
 */
export enum EventBusType {
  // Existing events
  RANGE_STYLE_CHANGE = 'rangeStyleChange',
  VISIBLE_PAGE_NO_LIST_CHANGE = 'visiblePageNoListChange',
  INTERSECTION_PAGE_NO_CHANGE = 'intersectionPageNoChange',
  PAGE_SIZE_CHANGE = 'pageSizeChange',
  PAGE_SCALE_CHANGE = 'pageScaleChange',
  SAVED = 'saved',
  CONTENT_CHANGE = 'contentChange',
  CONTROL_CHANGE = 'controlChange',
  CONTROL_CONTENT_CHANGE = 'controlContentChange',
  PAGE_MODE_CHANGE = 'pageModeChange',
  ZONE_CHANGE = 'zoneChange',
  MOUSEMOVE = 'mousemove',
  MOUSELEAVE = 'mouseleave',
  MOUSEENTER = 'mouseenter',
  MOUSEDOWN = 'mousedown',
  MOUSEUP = 'mouseup',
  CLICK = 'click',
  POSITION_CONTEXT_CHANGE = 'positionContextChange',
  IMAGE_SIZE_CHANGE = 'imageSizeChange',
  
  // Performance-related events
  RENDER_START = 'renderStart',
  RENDER_END = 'renderEnd',
  COMPUTE_START = 'computeStart',
  COMPUTE_END = 'computeEnd',
  SCROLL = 'scroll',
  RESIZE = 'resize',
  ELEMENT_CHANGE = 'elementChange'
}

// Export for backward compatibility
export { EventBusType as EventBusTypeEnum }

export type EventBusTypes = keyof typeof EventBusType
