# Canvas Editor Virtualization Integration Guide

This guide demonstrates how to integrate the virtualization optimization system into different Canvas Editor implementations.

## Why Use Virtualization?

The virtualization system significantly improves performance when working with:
- Large documents with 5,000+ elements
- Complex tables or layouts
- Documents that cause slow rendering or scrolling

## Integration Methods

### Method 1: Use the Factory Function (Recommended)

This is the simplest approach that requires minimal changes to your code:

```javascript
import { createOptimizedEditor } from 'canvas-editor/plugins/virtualization'

// Create an optimized editor instance
const editor = createOptimizedEditor(
  containerElement,  // The HTML element to hold the editor
  documentData,      // Your document content
  options            // Optional configuration
)
```

### Method 2: Register the Plugin with Existing Editor

If you already have an editor instance:

```javascript
import Editor from 'canvas-editor'
import { VirtualizationPlugin } from 'canvas-editor/plugins/virtualization'

// Create your editor normally
const editor = new Editor(containerElement, documentData, options)

// Register the virtualization plugin
VirtualizationPlugin.register(editor)
```

## Example Implementation

Here's a complete example showing how to implement the optimization:

```javascript
import { createOptimizedEditor } from 'canvas-editor/plugins/virtualization'
import { PerformanceAnalyzer } from 'canvas-editor/core/performance/PerformanceAnalyzer'

async function initEditor() {
  // Your document data
  const documentData = [/* your document elements */]
  
  // Optional: Analyze performance before rendering
  const perfInfo = PerformanceAnalyzer.analyzeDocument(documentData)
  console.log('Performance analysis:', perfInfo)
  
  // Create the editor with optimization
  const container = document.getElementById('editor-container')
  const editor = createOptimizedEditor(container, documentData, {
    mode: 'edit',
    pageMode: 'paging'
    // Any other options you need
  })
  
  // The editor now has optimization enabled for large documents
}
```

## Advanced Usage

### Manual Control of Virtualization

The virtualization system automatically enables when documents exceed 5,000 elements, but you can adjust this threshold:

```javascript
import { VirtualizationManager } from 'canvas-editor/core/virtualization/VirtualizationManager'

const manager = VirtualizationManager.getInstance()
manager.documentThreshold = 10000  // Only enable for very large documents
```

### Performance Monitoring

Monitor the performance benefits:

```javascript
import { PerformanceAnalyzer } from 'canvas-editor/core/performance/PerformanceAnalyzer'

// Check current metrics
const metrics = PerformanceAnalyzer.getCurrentMetrics()
console.log('Computation time:', metrics.computationTime)
console.log('Render time:', metrics.renderTime)
```

### Reset Cache After Major Changes

After significant document changes:

```javascript
const virtualizationManager = VirtualizationManager.getInstance()
virtualizationManager.reset()  // Clear caches and recalculate
```

## Testing the Optimization

To verify the optimization is working:

1. Open the browser console to see messages about virtualization being enabled
2. Documents below the 5,000 element threshold won't use virtualization
3. Use the large-document-demo.html file to see the performance difference

## Browser Support

The virtualization system works in all browsers supported by Canvas Editor.
