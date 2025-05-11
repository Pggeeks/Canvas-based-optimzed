# Canvas Editor Virtualization Plugin

The Canvas Editor Virtualization Plugin optimizes rendering performance for large documents by implementing a technique called "virtualization", which only renders elements that are currently visible in the viewport.

## Benefits

- **Significantly improved performance** for documents with thousands of elements
- **Reduced memory usage** by not rendering off-screen content
- **Smoother scrolling** experience for large documents
- **Automatic optimization detection** for documents that would benefit from virtualization

## Usage

### Option 1: Create an optimized editor instance

```typescript
import { createOptimizedEditor } from 'canvas-editor/plugins/virtualization';

// Create an editor with virtualization enabled
const editor = createOptimizedEditor(
  document.getElementById('editor'),
  documentData,
  editorOptions
);
```

### Option 2: Register the plugin with an existing editor

```typescript
import Editor from 'canvas-editor';
import { VirtualizationPlugin } from 'canvas-editor/plugins/virtualization';

// Create a standard editor
const editor = new Editor(
  document.getElementById('editor'),
  documentData,
  editorOptions
);

// Register the virtualization plugin
VirtualizationPlugin.register(editor);
```

## How It Works

The virtualization plugin performs several optimizations:

1. **Viewport Detection**: Tracks the current viewport position and size
2. **Selective Rendering**: Only renders elements that are visible or near the viewport
3. **Performance Monitoring**: Detects slow rendering operations and adapts
4. **Automatic Analysis**: Analyzes document content to determine if virtualization is beneficial

## Performance Analysis

The plugin includes a `PerformanceAnalyzer` that can be used to analyze documents:

```typescript
import { PerformanceAnalyzer } from 'canvas-editor/plugins/virtualization';

// Analyze a document to determine if virtualization would help
const perfInfo = PerformanceAnalyzer.analyzeDocument(documentElements);

console.log(`Document size: ${perfInfo.documentSize} elements`);
console.log(`Should optimize: ${perfInfo.shouldOptimize ? 'Yes' : 'No'}`);
```

## Best Practices

1. Use virtualization for documents with more than 5,000 elements
2. Optimize table structures for better performance
3. Use the performance analyzer to determine if virtualization would benefit your documents
4. For extremely large documents (100,000+ elements), consider splitting into multiple pages

## Troubleshooting

If you encounter any issues with the virtualization plugin:

1. Check browser console for error messages
2. Verify that the plugin is properly registered before document rendering
3. Try using `createOptimizedEditor` instead of manually registering the plugin
4. For specific issues, refer to the troubleshooting guide in the docs
