import { Draw } from '../draw/Draw'

/**
 * Tracks visible content in the editor to optimize rendering and calculations
 */
export class VirtualizationViewport {
  private draw: Draw | null = null
  private visiblePages: Set<number> = new Set()
  private previousVisiblePages: Set<number> = new Set()
  
  /**
   * Initialize with Draw instance
   */
  public initialize(draw: Draw): void {
    this.draw = draw
    this.updateVisiblePages()
  }

  /**
   * Update viewport dimensions based on container size
   */
  public updateDimensions(): void {
    this.updateVisiblePages()
  }

  /**
   * Update which pages are currently visible in the viewport
   */
  public updateVisiblePages(): { pages: number[]; changed: boolean } {
    if (!this.draw) {
      return { pages: [], changed: false }
    }
    
    // Store previous visible pages for change detection
    this.previousVisiblePages = new Set(this.visiblePages)
    this.visiblePages.clear()
    
    // Get container and pages
    const container = this.draw.getContainer()
    const pageList = this.draw.getPageList()
    if (!container || !pageList?.length) {
      return { pages: [], changed: false }
    }
    
    // Get container bounding rect
    const containerRect = container.getBoundingClientRect()
    
    // Check which pages intersect with viewport
    for (let i = 0; i < pageList.length; i++) {
      const page = pageList[i]
      const pageRect = page.getBoundingClientRect()
      
      // Check if page intersects with viewport
      if (this.doRectsIntersect(containerRect, pageRect)) {
        this.visiblePages.add(i)
      }
    }
    
    // Check if visible pages changed
    const visiblePagesArray = Array.from(this.visiblePages)
    const changed = this.haveVisiblePagesChanged()
    
    return {
      pages: visiblePagesArray,
      changed
    }
  }

  /**
   * Check if two rectangles intersect
   */
  private doRectsIntersect(rect1: DOMRect, rect2: DOMRect): boolean {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    )
  }

  /**
   * Check if visible pages have changed since last update
   */
  private haveVisiblePagesChanged(): boolean {
    if (this.visiblePages.size !== this.previousVisiblePages.size) {
      return true
    }
    
    // Check if any pages were added or removed
    for (const pageNo of this.visiblePages) {
      if (!this.previousVisiblePages.has(pageNo)) {
        return true
      }
    }
    
    return false
  }

  /**
   * Get currently visible pages
   */
  public getVisiblePages(): number[] {
    return Array.from(this.visiblePages)
  }

  /**
   * Check if a specific page is visible
   */
  public isPageVisible(pageNo: number): boolean {
    return this.visiblePages.has(pageNo)
  }

  /**
   * Reset viewport state
   */
  public reset(): void {
    this.visiblePages.clear()
    this.previousVisiblePages.clear()
  }
}
