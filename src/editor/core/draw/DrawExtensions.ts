import { Draw } from '../draw/Draw'
import { debounce } from '../../utils/debounce'

/**
 * Provides optimization extensions for the Draw component
 * to improve performance with large amounts of text
 */
export class DrawExtensions {
  private draw: Draw
  
  constructor(draw: Draw) {
    this.draw = draw
    this.initialize()
  }
  
  /**
   * Initialize the extensions
   */
  private initialize(): void {
    console.log('Initializing DrawExtensions')
    
    // Add debounced render method
    this.addDebouncedRender()
    
    // Add optimized row rendering method
    this.optimizeRowRender()
    
    // Add optimized computeRowList method
    this.optimizeComputeRowList()
    
    // Add viewport tracking
    this.addViewportTracking()
  }
  
  /**
   * Add a debounced render method to avoid excessive rendering
   */
  private addDebouncedRender(): void {
    // Create a debounced version of render for text input operations
    (this.draw as any).debouncedRender = debounce((payload: any) => {
      this.draw.render(payload)
    }, 50) // 50ms debounce time
  }
  
  /**
   * Add viewport tracking to the Draw component
   */
  private addViewportTracking(): void {
    const drawObj = this.draw as any
    
    // Add properties to track viewport
    drawObj.viewportTop = 0
    drawObj.viewportHeight = 0
    
    // Override scroll handling if it exists
    if (typeof drawObj.onScroll === 'function') {
      const originalOnScroll = drawObj.onScroll.bind(drawObj)
      
      drawObj.onScroll = function(...args: any[]) {
        // Update viewport tracking
        if (this.canvas) {
          this.viewportTop = this.canvas.scrollTop || 0
          this.viewportHeight = this.canvas.clientHeight || 0
        }
        
        // Call original scroll handler
        return originalOnScroll(...args)
      }
    }
  }
  
  /**
   * Optimize row rendering for improved performance
   */
  private optimizeRowRender(): void {
    const drawObj = this.draw as any
    
    // Check if drawRow method exists
    if (typeof drawObj.drawRow !== 'function') {
      console.warn('Draw.drawRow method not found, skipping optimization')
      return
    }
    
    // Store the original drawRow method
    const originalDrawRow = drawObj.drawRow.bind(drawObj)
    
    // Replace with optimized version
    drawObj.drawRow = function(row: any, positionContext?: any): void {
      // Skip rendering for rows not in viewport (with margin)
      if (row && typeof row.offsetY === 'number' && typeof row.height === 'number') {
        // Get viewport information
        const viewportTop = this.viewportTop || 0
        const viewportHeight = this.viewportHeight || this.height || 0
        const viewportBottom = viewportTop + viewportHeight
        
        // Add margin for smoother scrolling
        const margin = 300
        const rowTop = row.offsetY
        const rowBottom = rowTop + row.height
        
        // Check if row is outside viewport with margin
        if (rowBottom < viewportTop - margin || rowTop > viewportBottom + margin) {
          // Skip rendering this row
          return
        }
      }
      
      // Render rows in viewport normally
      return originalDrawRow(row, positionContext)
    }
  }
  
  /**
   * Optimize the computeRowList method for better performance
   */
  private optimizeComputeRowList(): void {
    // This can be used to add specific optimizations to computeRowList
    const drawObj = this.draw as any
    
    // Check if the method exists
    if (typeof drawObj.computeRowList !== 'function') {
      console.warn('Draw.computeRowList method not found, skipping optimization')
      return
    }
  }
  
  /**
   * Analyze text changes to determine if full recalculation is needed
   * Returns true if change requires full recalculation, false if partial is sufficient
   */
  public static doesChangeRequireFullRecalc(
    prevElementList: any[],
    curElementList: any[],
    changeIndex: number
  ): boolean {    // If dramatically different lengths, require full recalc
    if (Math.abs(prevElementList.length - curElementList.length) > 10) {
      return true
    }
    
    // For changes near the start of the document, require full recalc
    // as they're more likely to affect everything that follows
    if (changeIndex < 20) {
      return true
    }
    
    // For changes near the end of the document, partial recalc may be sufficient
    const isNearEnd = changeIndex > prevElementList.length - 30
    if (isNearEnd) {
      return false
    }
    
    // By default, be safe and do full recalc
    return true
  }
}
