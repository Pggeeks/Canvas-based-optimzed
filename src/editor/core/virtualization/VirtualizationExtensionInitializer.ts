import { Draw } from '../draw/Draw'
import { VirtualizationManager } from './VirtualizationManager'

/**
 * Initializes and integrates the virtualization system with the editor
 */
export class VirtualizationExtensionInitializer {
  private static instance: VirtualizationExtensionInitializer
  
  private constructor() {
    // Private singleton constructor
  }
  
  public static getInstance() {
    if (!VirtualizationExtensionInitializer.instance) {
      VirtualizationExtensionInitializer.instance = new VirtualizationExtensionInitializer()
    }
    return VirtualizationExtensionInitializer.instance
  }
  
  /**
   * Initialize virtualization extensions for Draw component
   */
  public initialize(draw: Draw): void {
    console.log('Initializing virtualization extensions')
    
    // Initialize virtualization manager with draw instance
    const virtualizationManager = VirtualizationManager.getInstance()
    virtualizationManager.initialize(draw)
    
    // Add necessary extensions to Draw methods
    this.extendDrawMethods(draw)
  }
  
  /**
   * Extends Draw methods with virtualization optimization hooks
   */
  private extendDrawMethods(draw: Draw): void {
    // Store original methods to call them from extended versions
    const originalComputeRowList = draw.computeRowList
    const originalRender = draw.render
    
    // Extend computeRowList method
    this.extendComputeRowList(draw, originalComputeRowList)
    
    // Extend render method
    this.extendRender(draw, originalRender)
  }
  
  /**
   * Extends the computeRowList method with virtualization optimizations
   */
  private extendComputeRowList(draw: Draw, originalMethod: any): void {
    // Override method to add virtualization logic
    draw.computeRowList = function(payload) {
      const virtualizationManager = VirtualizationManager.getInstance()
      
      // Check if virtualization is enabled
      const isEnabled = virtualizationManager.checkAndEnableVirtualization(payload.elementList)
      
      if (!isEnabled) {
        // If virtualization is not enabled, use original method
        return originalMethod.call(this, payload)
      }
      
      // Check for cached rows
      const cachedRows = virtualizationManager.getCachedRows(payload)
      if (cachedRows) {
        return cachedRows
      }
      
      // Get optimized calculation range if possible
      const optimizedRange = virtualizationManager.getOptimizedRowCalculationRange(payload.elementList)
      if (optimizedRange) {
        // Only process elements within optimized range
        const rangedPayload = { ...payload }
        rangedPayload.elementList = payload.elementList.slice(
          optimizedRange.startIndex,
          optimizedRange.endIndex + 1
        )
        
        // Calculate rows for the range
        const rows = originalMethod.call(this, rangedPayload)
        
        // Process and return rows
        virtualizationManager.processComputedRows(rows, rangedPayload)
        return rows
      }
      
      // Fall back to full calculation
      const rows = originalMethod.call(this, payload)
      
      // Cache the results
      virtualizationManager.processComputedRows(rows, payload)
      
      return rows
    }
  }
  
  /**
   * Extends the render method with virtualization optimizations
   */  private extendRender(draw: Draw, originalMethod: any): void {
    // Add a method to render specific pages - using "as any" to bypass TypeScript's encapsulation rules
    const drawObj = draw as any
    drawObj.renderSpecificPages = function(pages: number[]) {
      // If no pages specified, render nothing
      if (!pages?.length) {
        return
      }
      
      // Get visible page indices - type assertion needed since pageRowList is private
      const pageIndices = pages.filter((pageNo: number) => {
        return pageNo >= 0 && pageNo < this.pageRowList.length
      })
      
      // If no valid pages, do nothing
      if (!pageIndices.length) {
        return
      }
      
      // Render only specified pages
      for (const pageNo of pageIndices) {
        // Access private properties with type assertions
        if (this.pageList[pageNo] && this.ctxList[pageNo]) {
          this.drawPage({
            elementList: this.elementList,
            positionList: this.position.getPositionList(),
            rowList: this.pageRowList[pageNo],
            pageNo
          })
        }
      }
    }
      // Override render method to add virtualization logic
    draw.render = function(payload) {
      const virtualizationManager = VirtualizationManager.getInstance()
      
      // Check if virtualization is enabled for current document
      // Use type assertion to access private property
      const drawObj = this as any
      const isEnabled = virtualizationManager.checkAndEnableVirtualization(drawObj.elementList)
      
      if (!isEnabled) {
        // If virtualization is not enabled, use original render method
        return originalMethod.call(this, payload)
      }
        // Get partial computation info if available - method signature changed to not require elementList
      const partialInfo = virtualizationManager.getPartialComputationInfo()
      
      if (payload?.isCompute && partialInfo && partialInfo.isPartialCompute) {
        // If partial computation is possible, adjust payload
        payload = { ...payload }
        payload.curIndex = partialInfo.startIndex
      }
      
      // Call original render with possibly modified payload
      const result = originalMethod.call(this, payload)
      
      return result
    }
  }
}
