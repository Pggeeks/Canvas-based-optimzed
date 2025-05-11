// import { IElement } from '../../interface/Element' - not needed
import { IComputeRowListPayload } from '../../interface/Draw'
import { IRow } from '../../interface/Row'

interface ICachedRowData {
  rows: IRow[];
  payload: IComputeRowListPayload;
  timestamp: number;
}

interface ICachedPageData {
  pageNo: number;
  rows: IRow[];
  timestamp: number;
}

/**
 * Manages caching of calculated rows and pages to avoid redundant calculations
 */
export class VirtualizationCache {
  private rowCache: Map<string, ICachedRowData> = new Map()
  private pageCache: Map<number, ICachedPageData> = new Map()
  private elementRangeCache: { startIndex: number; endIndex: number } | null = null
  
  // Cache size limits to prevent memory issues
  private maxRowCacheEntries = 10
  private maxPageCacheEntries = 50
  
  // Cache expiration time in milliseconds
  private cacheExpirationTime = 5000

  /**
   * Generate a cache key from payload
   */
  private generateCacheKey(payload: IComputeRowListPayload): string {
    // Create a key based on relevant payload properties
    const { innerWidth, isFromTable, isPagingMode, startX, startY } = payload
    const elementListLength = payload.elementList.length
    
    return `${innerWidth}-${isFromTable}-${isPagingMode}-${startX}-${startY}-${elementListLength}`
  }

  /**
   * Cache computed rows with their payload
   */
  public cacheRows(rows: IRow[], payload: IComputeRowListPayload): void {
    const key = this.generateCacheKey(payload)
    
    this.rowCache.set(key, {
      rows: [...rows], // Clone to prevent reference issues
      payload,
      timestamp: Date.now()
    })
    
    // Maintain cache size limit
    this.enforceRowCacheLimit()
  }

  /**
   * Get cached rows if available for the given payload
   */
  public getRows(payload: IComputeRowListPayload): IRow[] | null {
    const key = this.generateCacheKey(payload)
    const cachedData = this.rowCache.get(key)
    
    if (!cachedData) return null
    
    // Check if cache is expired
    if (Date.now() - cachedData.timestamp > this.cacheExpirationTime) {
      this.rowCache.delete(key)
      return null
    }
    
    // Check if payloads are compatible for reuse
    if (this.arePayloadsCompatible(payload, cachedData.payload)) {
      return cachedData.rows
    }
    
    return null
  }

  /**
   * Check if two payloads are compatible for cache reuse
   */
  private arePayloadsCompatible(newPayload: IComputeRowListPayload, cachedPayload: IComputeRowListPayload): boolean {
    // Basic compatibility checks
    if (newPayload.innerWidth !== cachedPayload.innerWidth) return false
    if (newPayload.isPagingMode !== cachedPayload.isPagingMode) return false
    if (newPayload.isFromTable !== cachedPayload.isFromTable) return false
    
    // Check if element lists are the same length
    if (newPayload.elementList.length !== cachedPayload.elementList.length) return false
    
    // More detailed checks could be added here
    
    return true
  }

  /**
   * Cache page data
   */
  public cachePage(pageNo: number, rows: IRow[]): void {
    this.pageCache.set(pageNo, {
      pageNo,
      rows: [...rows], // Clone to prevent reference issues
      timestamp: Date.now()
    })
    
    // Maintain cache size limit
    this.enforcePageCacheLimit()
  }

  /**
   * Get cached page data if available
   */
  public getPage(pageNo: number): IRow[] | null {
    const cachedData = this.pageCache.get(pageNo)
    
    if (!cachedData) return null
    
    // Check if cache is expired
    if (Date.now() - cachedData.timestamp > this.cacheExpirationTime) {
      this.pageCache.delete(pageNo)
      return null
    }
    
    return cachedData.rows
  }

  /**
   * Invalidate cache for a specific page
   */
  public invalidatePageCache(pageNo: number): void {
    this.pageCache.delete(pageNo)
  }

  /**
   * Cache row calculation range
   */
  public cacheRowRange(startIndex: number, endIndex: number): void {
    this.elementRangeCache = { startIndex, endIndex }
  }

  /**
   * Get cached row range if available
   */
  public getRowCache(): { startIndex: number; endIndex: number } | null {
    return this.elementRangeCache
  }

  /**
   * Invalidate row range cache
   */
  public invalidateRowRangeCache(): void {
    this.elementRangeCache = null
  }

  /**
   * Enforce size limit for row cache
   */
  private enforceRowCacheLimit(): void {
    if (this.rowCache.size <= this.maxRowCacheEntries) return
    
    // Remove oldest entries first
    const entries = Array.from(this.rowCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Remove oldest entries until we're within limit
    const entriesToRemove = entries.slice(0, entries.length - this.maxRowCacheEntries)
    entriesToRemove.forEach(([key]) => {
      this.rowCache.delete(key)
    })
  }

  /**
   * Enforce size limit for page cache
   */
  private enforcePageCacheLimit(): void {
    if (this.pageCache.size <= this.maxPageCacheEntries) return
    
    // Remove oldest entries first
    const entries = Array.from(this.pageCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Remove oldest entries until we're within limit
    const entriesToRemove = entries.slice(0, entries.length - this.maxPageCacheEntries)
    entriesToRemove.forEach(([key]) => {
      this.pageCache.delete(key)
    })
  }

  /**
   * Clear all cached data
   */
  public clearAll(): void {
    this.rowCache.clear()
    this.pageCache.clear()
    this.elementRangeCache = null
  }
}
