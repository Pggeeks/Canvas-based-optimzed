import Editor from '../../editor'
import { Draw } from '../../editor/core/draw/Draw'
import { PerformanceManager } from '../../editor/core/performance/PerformanceManager'

/**
 * VirtualizationPlugin - Improves editor performance for large documents
 * by optimizing rendering of off-screen content
 */
export class VirtualizationPlugin {
  /**
   * Register the plugin with an editor instance
   */  public static register(editor: Editor): void {
    if (!editor || !editor.use) {
      console.error('Editor instance is required to register the virtualization plugin')
      return
    }
    
    console.log('VirtualizationPlugin.register() called')
      try {
      // Flag the editor as optimized
      (editor as any).isOptimized = true
      
      // Use the plugin system to access the editor
      editor.use((editorInstance) => {
        console.log('Accessing editor components for virtualization')
        
        // Try to access the Draw component
        let draw: Draw | null = null
        
        // Different paths to access the Draw component
        if ((editorInstance.command as any)?._command?.draw) {
          draw = (editorInstance.command as any)._command.draw
          console.log('Found Draw via _command.draw')
        } else if ((editorInstance as any)?.draw) {
          draw = (editorInstance as any).draw
          console.log('Found Draw via direct access')
        } else if ((editorInstance as any)?._core?.draw) {
          draw = (editorInstance as any)._core.draw
          console.log('Found Draw via _core.draw')
        }
          // If we found the Draw component, initialize performance optimizations
        if (draw) {
          console.log('Initializing performance optimizations')
          const performanceManager = PerformanceManager.getInstance()
          performanceManager.initialize(draw)
          console.log('Performance optimizations initialized')
        } else {
          console.error('Could not access Draw component for virtualization')
        }
      })
      
      console.log('Virtualization plugin registered successfully')
    } catch (error) {
      console.error('Error registering virtualization plugin:', error)
    }
  }
}
