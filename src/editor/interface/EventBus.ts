import {
  IContentChange,
  IControlChange,
  IControlContentChange,
  IImageSizeChange,
  IIntersectionPageNoChange,
  IMouseEventChange,
  IPageModeChange,
  IPageScaleChange,
  IPageSizeChange,
  IPositionContextChange,
  IRangeStyleChange,
  ISaved,
  IVisiblePageNoListChange,
  IZoneChange
} from './Listener'

export interface EventBusMap {
  rangeStyleChange: IRangeStyleChange
  visiblePageNoListChange: IVisiblePageNoListChange
  intersectionPageNoChange: IIntersectionPageNoChange
  pageSizeChange: IPageSizeChange
  pageScaleChange: IPageScaleChange
  saved: ISaved
  contentChange: IContentChange
  controlChange: IControlChange
  controlContentChange: IControlContentChange
  pageModeChange: IPageModeChange
  zoneChange: IZoneChange
  mousemove: IMouseEventChange
  mouseleave: IMouseEventChange
  mouseenter: IMouseEventChange
  mousedown: IMouseEventChange
  mouseup: IMouseEventChange
  click: IMouseEventChange
  positionContextChange: IPositionContextChange
  imageSizeChange: IImageSizeChange
  // Performance-related events
  renderStart: null
  renderEnd: null
  computeStart: null
  computeEnd: null
  scroll: null
  resize: null
  elementChange: { index: number; element?: any; content?: string }
}
