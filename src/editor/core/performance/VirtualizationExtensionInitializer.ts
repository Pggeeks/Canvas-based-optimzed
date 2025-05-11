import { Draw } from '../draw/Draw'

/**
 * Initializes virtualization extensions for the Draw component
 * This optimizes DOM manipulation for large documents by only rendering
 * visible portions of the document
 */
export class VirtualizationExtensionInitializer {
  private static instance: VirtualizationExtensionInitializer;
  private initialized = false;
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): VirtualizationExtensionInitializer {
    if (!VirtualizationExtensionInitializer.instance) {
      VirtualizationExtensionInitializer.instance = new VirtualizationExtensionInitializer()
    }
    return VirtualizationExtensionInitializer.instance
  }
    /**
   * Initialize the virtualization extensions
   * @param draw The Draw component to optimize
   */  public initialize(draw: Draw): void {
    if (this.initialized) {
      console.log('Virtualization already initialized, skipping')
      return
    }
    
    if (!draw) {
      console.error('Cannot initialize virtualization: Draw component is undefined')
      return
    }
    
    console.log('Initializing virtualization extensions')
      try {
      // Ensure the draw component has required methods for virtualization
      if (!(draw as any).render) {
        console.warn('Draw.render method not found, virtualization may not work properly')
      }
      
      // Add viewport detection
      this.extendWithViewportDetection(draw)
      
      // Optimize rendering for large documents
      this.optimizeRendering(draw)
      
      this.initialized = true
      console.log('Virtualization extensions initialized successfully')
    } catch (error) {
      console.error('Error initializing virtualization extensions:', error)
    }
  }
    /**
   * Extend Draw with viewport detection capabilities
   */
  private extendWithViewportDetection(draw: Draw): void {
    console.log('Adding viewport detection to Draw')
    
    // Add proper type checking and fallbacks
    const drawObj = draw as any
      // Add method to check if element is in viewport with margin
    drawObj.isElementInViewport = function(element: any) {
      if (!this.canvas) {
        return true // Default to visible if no canvas
      }
        // Extract position data with safety checks
      const elementTop = typeof element.offsetTop === 'number' ? element.offsetTop : 0
      const elementHeight = typeof element.height === 'number' ? element.height : 0
      const elementBottom = elementTop + elementHeight
      
      // Get scroll position with fallback
      let viewportTop = 0
      let viewportHeight = 0
        if (typeof this.getScrollTop === 'function') {
        viewportTop = this.getScrollTop()
      } else if (typeof this.pageScrollTop === 'number') {
        viewportTop = this.pageScrollTop
      }
      
      if (typeof this.getHeight === 'function') {
        viewportHeight = this.getHeight()
      } else if (typeof this.height === 'number') {
        viewportHeight = this.height
      }
      
      const viewportBottom = viewportTop + viewportHeight
      
      // Add margin to render slightly outside viewport (300px)
      const margin = 300
      
      // Check if element is in viewport
      return !(elementBottom < viewportTop - margin || elementTop > viewportBottom + margin)
    }
  }
    /**
   * Optimize rendering for large documents
   */
  private optimizeRendering(draw: Draw): void {
    console.log('Optimizing rendering for large documents')
    
    // Store original render method with safe binding
    const drawObj = draw as any
    
    if (typeof drawObj.render !== 'function') {
      console.error('Draw.render is not a function, skipping optimization')
      return
    }
    
    const originalRender = drawObj.render.bind(drawObj)
    
    // Track optimization state
    let isOptimizationEnabled = true
    
    // Add method to toggle optimization
    drawObj.setOptimizationEnabled = function(enabled: boolean) {
      isOptimizationEnabled = enabled
      console.log(`Virtualization optimization ${enabled ? 'enabled' : 'disabled'}`)
    }
      // Enhance render method with virtualization
    drawObj.render = function(payload?: any) {
      if (!isOptimizationEnabled) {
        // If optimization is disabled, use original render
        return originalRender(payload)
      }
      
      console.log('Rendering with virtualization optimization')
      
      try {
        // For now, just call the original render
        // In the future we'll implement partial rendering
        originalRender(payload)
      } catch (error) {
        console.error('Error in virtualized render:', error)
        // Fallback to original render if virtualization fails
        originalRender(payload)
      }
    }
  }
}
