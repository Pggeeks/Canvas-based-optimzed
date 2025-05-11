// Test script for virtualization optimization
// This can be run to verify the optimization is working correctly

import { PerformanceAnalyzer } from '../../editor/core/performance/PerformanceAnalyzer'
import { ElementType } from '../../editor/dataset/enum/Element'
import { IElement } from '../../editor/interface/Element'
// createOptimizedEditor import commented as it's not used in this file
// import { createOptimizedEditor } from './'

// Generate test document with specified size
function generateTestDocument(elementCount = 10000, tableCellCount = 200): IElement[] {
  const elements: IElement[] = []
    // Add text elements
  for (let i = 0; i < elementCount; i++) {
    elements.push({
      type: ElementType.TEXT,
      value: `Element ${i} - testing virtualization optimization`
    } as IElement)
    
    // Add line breaks occasionally
    if (i % 100 === 0) {
      elements.push({ type: ElementType.TEXT, value: '\n' } as IElement)
    }
  }
    // Create a large table
  const colCount = Math.min(10, tableCellCount)
  const rowCount = Math.ceil(tableCellCount / colCount)
  
  const trList = []
  for (let r = 0; r < rowCount; r++) {
    const tdList = []
    for (let c = 0; c < colCount; c++) {
      tdList.push({
        colspan: 1,
        rowspan: 1,
        value: [
          { type: ElementType.TEXT, value: `R${r}C${c}` } as IElement
        ]
      })
    }
    trList.push({ tdList })
  }
  
  elements.push({ 
    type: ElementType.TABLE,
    value: '',  // Add required value property
    trList
  } as IElement)
  
  return elements
}

// Run performance tests
function runPerformanceTests() {
  // Test with different document sizes
  const testSizes = [1000, 5000, 10000, 20000]
  
  testSizes.forEach(size => {
    console.log(`\nTesting document with ${size} elements:`)
    
    // Generate test document
    const testDoc = generateTestDocument(size)
    
    // Analyze performance characteristics
    const perfInfo = PerformanceAnalyzer.analyzeDocument(testDoc)
    PerformanceAnalyzer.logPerformanceInfo(perfInfo)
    
    console.log(`Expected optimization benefit: ${perfInfo.shouldOptimize ? 'HIGH' : 'LOW'}`)
  })
}

// Export test functions
export {
  generateTestDocument,
  runPerformanceTests
}
