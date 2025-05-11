import Editor from '../../editor'
import { VirtualizationPlugin } from './SimplePlugin'
import { DrawExtensions } from '../../editor/core/draw/DrawExtensions'
import { PerformanceManager } from '../../editor/core/performance/PerformanceManager'
import { PerformanceAnalyzer } from '../../editor/core/performance/PerformanceAnalyzer'
import { VirtualizationExtensionInitializer } from '../../editor/core/performance/VirtualizationExtensionInitializer'

/**
 * Creates a performance-optimized editor instance
 * This has the same API as the regular editor but with performance optimizations
 * for handling large documents with lots of text or tables
 */
export function createOptimizedEditor(
  container: HTMLDivElement,
  data: any,
  options: any = {}
): Editor {
  console.log('Creating optimized editor instance')
  
  // Create the editor instance
  const editor = new Editor(container, data, options)
  
  try {
    // Register the virtualization plugin
    VirtualizationPlugin.register(editor)
    console.log('Virtualization plugin registered successfully')
  } catch (error) {
    console.error('Failed to register virtualization plugin:', error)
  }
  
  return editor
}

// Export all components
export { VirtualizationPlugin }
export { DrawExtensions }
export { PerformanceManager }
export { PerformanceAnalyzer }
export { VirtualizationExtensionInitializer }