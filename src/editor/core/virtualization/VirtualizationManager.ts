import { EventBusType } from '../../dataset/enum/EventBus'
import { IElement } from '../../interface/Element'
import { IComputeRowListPayload } from '../../interface/Draw'
import { IRow } from '../../interface/Row'
import { Draw } from '../draw/Draw'
import { EventBus } from '../event/EventBus'
import { PerformanceManager } from '../performance/PerformanceManager'
import { VirtualizationCache } from './VirtualizationCache'
import { VirtualizationDiffTracker } from './VirtualizationDiffTracker'
import { VirtualizationViewport } from './VirtualizationViewport'

export interface IRowRange {
  startIndex: number;
  endIndex: number;
}

export interface IPageRange {
  startIndex: number;
  endIndex: number;
}

/**
 * Manages virtualization functionality to optimize performance for large documents
 */
export class VirtualizationManager {
  private static instance: VirtualizationManager
  
  private draw: Draw | null = null
  private cache: VirtualizationCache
  private viewport: VirtualizationViewport
  private diffTracker: VirtualizationDiffTracker
  private isEnabled = false
  private documentThreshold = 5000 // Document element count threshold to enable virtualization
  private bufferPageCount = 1 // Number of pages to buffer outside viewport
  
  private constructor() {
    this.cache = new VirtualizationCache()
    this.viewport = new VirtualizationViewport()
    this.diffTracker = new VirtualizationDiffTracker()
    this.setupEventListeners()
  }

  public static getInstance() {
    if (!VirtualizationManager.instance) {
      VirtualizationManager.instance = new VirtualizationManager()
    }
    return VirtualizationManager.instance
  }

  /**
   * Initialize virtualization with Draw instance
   */
  public initialize(draw: Draw): void {
    this.draw = draw
    this.viewport.initialize(draw)
  }

  /**
   * Set up event listeners for virtualization
   */  private setupEventListeners(): void {
    // Listen for scroll events to update viewport
    const eventBus = EventBus.getInstance()
    // @ts-ignore - The event system expects null but we're providing a callback function
    eventBus.on(EventBusType.SCROLL, this.handleScroll.bind(this))
    
    // Track document changes
    // @ts-ignore - The event system expects a specific payload type but we're handling it differently
    eventBus.on(EventBusType.ELEMENT_CHANGE, this.handleElementChange.bind(this))
    
    // Update viewport when editor resizes
    // @ts-ignore - The event system expects null but we're providing a callback function
    eventBus.on(EventBusType.RESIZE, this.handleResize.bind(this))
  }
  /**
   * Handle scroll events to update visible content
   */  private handleScroll(): void {
    if (!this.isEnabled || !this.draw) {
      return
    }
    
    // Update visible pages
    const visiblePages = this.viewport.updateVisiblePages()
    
    // Request render for newly visible pages
    if (visiblePages.changed) {
      // Using type assertion since renderSpecificPages is added by VirtualizationExtensionInitializer
      (this.draw as any).renderSpecificPages(visiblePages.pages)
    }
  }

  /**
   * Handle element changes to track what needs recalculation
   */  private handleElementChange(payload: { index: number; element?: any; content?: string }): void {
    if (!this.isEnabled || !this.draw) {
      return
    }
    
    // Track changes to determine affected rows and pages
    this.diffTracker.trackChange(payload)
  }

  /**
   * Handle resize events to update viewport dimensions
   */  private handleResize(): void {
    if (!this.isEnabled || !this.draw) {
      return
    }
    
    // Update viewport dimensions and visible content
    this.viewport.updateDimensions()
    const visiblePages = this.viewport.getVisiblePages()
    
    // Invalidate cache for visible pages
    visiblePages.forEach((pageNo: number) => {
      this.cache.invalidatePageCache(pageNo)
    })
    
    // Request recalculation and render
    if (this.draw) {
      this.draw.render({
        isCompute: true,
        isLazy: false
      })
    }
  }

  /**
   * Check if virtualization should be enabled for current document
   */
  public checkAndEnableVirtualization(elementList: IElement[]): boolean {
    const shouldEnable = elementList.length > this.documentThreshold
    
    // Only log when status changes
    if (shouldEnable !== this.isEnabled) {
      console.log(`Virtualization ${shouldEnable ? 'enabled' : 'disabled'} for document with ${elementList.length} elements`)
      
      if (shouldEnable) {
        PerformanceManager.getInstance().mark('virtualization-enabled')
      } else {
        PerformanceManager.getInstance().mark('virtualization-disabled')
      }
    }
    
    this.isEnabled = shouldEnable
    return this.isEnabled
  }

  /**
   * Get optimized row calculation range based on visible content
   */
  public getOptimizedRowCalculationRange(elementList: IElement[]): IRowRange | null {
    if (!this.isEnabled) return null
    
    // Check if we have cached calculations
    const cachedRange = this.cache.getRowCache()
    if (cachedRange) {
      return cachedRange
    }
    
    // Get visible pages and expand by buffer
    const visiblePages = this.viewport.getVisiblePages()
    const expandedPages = this.expandPageRangeWithBuffer(visiblePages)
    
    // Convert page range to element indices
    const elementRange = this.pageRangeToElementRange(expandedPages, elementList)
    
    return elementRange
  }

  /**
   * Expand visible page range with buffer pages
   */  private expandPageRangeWithBuffer(pages: number[]): number[] {
    if (!pages.length) {
      return []
    }
    
    const minPage = Math.max(0, Math.min(...pages) - this.bufferPageCount)
    // Use type assertion to access the private property
    const drawObj = this.draw as any
    const maxPage = Math.min(
      (drawObj?.pageRowList?.length || 0) - 1,
      Math.max(...pages) + this.bufferPageCount
    )
    
    const expandedPages: number[] = []
    for (let i = minPage; i <= maxPage; i++) {
      expandedPages.push(i)
    }
    
    return expandedPages
  }

  /**
   * Convert page range to element range
   */  private pageRangeToElementRange(pages: number[], elementList: IElement[]): IRowRange {
    if (!pages.length || !this.draw) {
      return { startIndex: 0, endIndex: elementList.length - 1 }
    }
    
    // Use type assertion to access private property
    const drawObj = this.draw as any
    const pageRowList = drawObj.pageRowList
    
    // Find start element index from first page in range
    const startPage = Math.min(...pages)
    const startPageRows = pageRowList[startPage] || []
    const startIndex = startPageRows[0]?.startIndex || 0
    
    // Find end element index from last page in range
    const endPage = Math.max(...pages)
    const endPageRows = pageRowList[endPage] || []
    const lastRow = endPageRows[endPageRows.length - 1]
    const endIndex = lastRow ? (lastRow.startIndex + lastRow.elementList.length - 1) : (elementList.length - 1)
    
    return { startIndex, endIndex }
  }

  /**
   * Process computed rows to cache and optimize
   */  public processComputedRows(rows: IRow[], payload: IComputeRowListPayload): void {
    if (!this.isEnabled) {
      return
    }
    
    // Cache computed rows
    this.cache.cacheRows(rows, payload)
  }

  /**
   * Get cached rows if available for given payload
   */
  public getCachedRows(payload: IComputeRowListPayload): IRow[] | null {
    if (!this.isEnabled) {
      return null
    }
    
    return this.cache.getRows(payload)
  }
  /**
   * Check if only partial computation is needed based on changes
   */  public getPartialComputationInfo(): {
    isPartialCompute: boolean;
    startIndex: number;
  } | null {
    if (!this.isEnabled || !this.draw) {
      return null
    }
    
    const changes = this.diffTracker.getDiffChanges()
    if (!changes || !changes.length) {
      return null
    }
      // Find earliest change in the document
    const earliestChange = changes.reduce((earliest: any, current: any) => {
      return current.index < earliest.index ? current : earliest
    }, changes[0])
    
    // Check if change affects page structure
    const affectsPageStructure = this.doesChangeAffectPageStructure(earliestChange)
    
    if (affectsPageStructure) {
      // Need full computation
      return null
    }
    
    // Return info for partial computation starting at this index
    return {
      isPartialCompute: true,
      startIndex: earliestChange.index
    }
  }

  /**
   * Determine if a change affects page structure
   */
  private doesChangeAffectPageStructure(change: any): boolean {
    // Conservative approach - certain element types always affect page structure
    const highImpactTypes = ['table', 'image', 'pageBreak']
    if (change.elementType && highImpactTypes.includes(change.elementType)) {
      return true
    }
    
    // Text changes that don't affect line breaks likely don't change page structure
    if (change.elementType === 'text' && !change.content?.includes('\n')) {
      return false
    }
    
    // By default, assume changes might affect page structure
    return true
  }

  /**
   * Reset all cached data - use when document changes significantly
   */
  public reset(): void {
    this.cache.clearAll()
    this.diffTracker.reset()
    this.viewport.reset()
  }
}
