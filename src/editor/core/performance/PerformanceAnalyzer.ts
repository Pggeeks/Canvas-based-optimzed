import { ElementType } from '../../dataset/enum/Element'
import { IElement } from '../../interface/Element'

export interface IPerformanceInfo {
  documentSize: number;
  tableCount: number;
  largeTableCount: number;
  largeTableLocations: number[];
  estimatedRenderTime: number;
  shouldOptimize: boolean;
}

/**
 * Analyzes document content to detect potential performance issues
 */
export class PerformanceAnalyzer {
  // Thresholds for performance optimization
  private static readonly LARGE_DOCUMENT_THRESHOLD = 5000; // Elements
  private static readonly LARGE_TABLE_THRESHOLD = 100; // Cells
  private static readonly LARGE_TABLE_ROW_THRESHOLD = 20; // Rows
  private static readonly LARGE_TABLE_COL_THRESHOLD = 10; // Columns
  
  /**
   * Analyze document content for potential performance issues
   */
  public static analyzeDocument(elements: IElement[]): IPerformanceInfo {
    const info: IPerformanceInfo = {
      documentSize: elements.length,
      tableCount: 0,
      largeTableCount: 0,
      largeTableLocations: [],
      estimatedRenderTime: 0,
      shouldOptimize: false
    }
    
    // Detect tables and analyze their size
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      
      if (element.type === ElementType.TABLE) {
        info.tableCount++
        
        // Check table size
        const trList = element.trList || []
        const rowCount = trList.length
        const colCount = trList[0]?.tdList?.length || 0
        const cellCount = rowCount * colCount
        
        // Check if this is a large table
        if (
          cellCount > this.LARGE_TABLE_THRESHOLD ||
          rowCount > this.LARGE_TABLE_ROW_THRESHOLD ||
          colCount > this.LARGE_TABLE_COL_THRESHOLD
        ) {
          info.largeTableCount++
          info.largeTableLocations.push(i)
        }
      }
    }
    
    // Estimate render time based on document characteristics
    info.estimatedRenderTime = this.estimateRenderTime(info)
    
    // Determine if optimization is needed
    info.shouldOptimize = 
      info.documentSize > this.LARGE_DOCUMENT_THRESHOLD ||
      info.largeTableCount > 0 ||
      info.estimatedRenderTime > 500 // 500ms threshold for "slow" rendering
    
    return info
  }
  
  /**
   * Estimate render time based on document characteristics
   */
  private static estimateRenderTime(info: IPerformanceInfo): number {
    // Base time for document processing
    let estimatedTime = info.documentSize * 0.05 // 0.05ms per element baseline
    
    // Add time for tables (which are more expensive to render)
    estimatedTime += info.tableCount * 50 // 50ms per table baseline
    
    // Add additional time for large tables
    estimatedTime += info.largeTableCount * 300 // 300ms per large table
    
    return Math.round(estimatedTime)
  }
  
  /**
   * Log performance information
   */
  public static logPerformanceInfo(info: IPerformanceInfo): void {
    console.log('Document Performance Analysis:')
    console.log(`- Document size: ${info.documentSize} elements`)
    console.log(`- Tables: ${info.tableCount} (${info.largeTableCount} large tables)`)
    console.log(`- Estimated render time: ${info.estimatedRenderTime}ms`)
    console.log(`- Optimization recommended: ${info.shouldOptimize ? 'Yes' : 'No'}`)
    
    if (info.largeTableLocations.length > 0) {
      console.log('- Large tables found at element indices:', info.largeTableLocations)
    }
  }
}
