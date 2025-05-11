import { Draw } from '../draw/Draw'
import { DrawExtensions } from '../draw/DrawExtensions'
import { VirtualizationExtensionInitializer } from './VirtualizationExtensionInitializer'
import { EventBus } from '../event/EventBus'
import { EventBusType } from '../../dataset/enum/EventBus'

/**
 * Performance Manager that handles optimizations for the editor
 * Monitors and improves performance for large documents
 */
export class PerformanceManager {  private static instance: PerformanceManager
  private extensionsInitialized = false
  private marks: Map<string, number> = new Map()
  private measures: Map<string, { duration: number, timestamp: number }> = new Map()
  
  private constructor() {
    // Private singleton constructor
  }
  
  public static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager()
    }
    return PerformanceManager.instance
  }
    /**
   * Initialize performance optimizations
   */  public initialize(draw: Draw): void {
    if (this.extensionsInitialized) {
      return
    }
    
    console.log('Initializing performance optimizations')
    
    try {
      // First apply DrawExtensions
      console.log('Initializing DrawExtensions')
      new DrawExtensions(draw)

      // Then initialize virtualization system
      console.log('Initializing VirtualizationExtensionInitializer')
      VirtualizationExtensionInitializer.getInstance().initialize(draw)
      
      // Mark as initialized
      this.extensionsInitialized = true
      
      // Listen for performance issues
      this.setupPerformanceMonitoring()
      
      console.log('Performance optimizations initialized successfully')
    } catch (error) {
      console.error('Failed to initialize performance optimizations:', error)
    }
  }
  
  /**
   * Setup performance monitoring
   */  private setupPerformanceMonitoring(): void {
    const eventBus = EventBus.getInstance()
    
    // Monitor render performance
    // @ts-ignore - The event system expects null but we're providing a callback function
    eventBus.on(EventBusType.RENDER_START, () => {
      this.mark('render-start')
    })
    
    // @ts-ignore - The event system expects null but we're providing a callback function
    eventBus.on(EventBusType.RENDER_END, () => {
      this.mark('render-end')
      this.measure('render', 'render-start', 'render-end')
      
      // Log slow renders
      const renderMeasure = this.getMeasure('render')
      if (renderMeasure && renderMeasure.duration > 500) {
        console.warn(`Slow render detected: ${renderMeasure.duration}ms`)
      }
    })
  }
  
  /**
   * Create a performance mark
   */
  public mark(name: string): void {
    this.marks.set(name, performance.now())
  }
  
  /**
   * Measure time between two marks
   */
  public measure(name: string, startMark: string, endMark: string): void {
    const startTime = this.marks.get(startMark)
    const endTime = this.marks.get(endMark)
    
    if (startTime && endTime) {
      const duration = endTime - startTime
      this.measures.set(name, {
        duration,
        timestamp: Date.now()
      })
    }
  }
  
  /**
   * Get a measurement
   */
  public getMeasure(name: string): { duration: number, timestamp: number } | undefined {
    return this.measures.get(name)
  }
}
