import { ElementType } from '../../dataset/enum/Element'
// IElement import removed as it's not used

interface IDiffChange {
  index: number;
  elementType: ElementType;
  content?: string;
  timestamp: number;
}

/**
 * Tracks changes in the document to determine what needs recalculation
 */
export class VirtualizationDiffTracker {
  private changes: IDiffChange[] = []
  private maxChangesToTrack = 100 // Limit tracked changes to avoid memory issues
  private changeExpirationTime = 2000 // Time in ms after which changes are considered stale
  
  /**
   * Track a change in the document
   */
  public trackChange(payload: any): void {
    if (!payload || !payload.index) return
    
    // Create change record
    const change: IDiffChange = {
      index: payload.index,
      elementType: payload.element?.type || ElementType.TEXT,
      content: payload.content,
      timestamp: Date.now()
    }
    
    // Add to changes list
    this.changes.push(change)
    
    // Maintain size limit
    this.enforceChangesLimit()
  }
  
  /**
   * Get all tracked changes, filtering out stale changes
   */
  public getDiffChanges(): IDiffChange[] {
    // Clean up stale changes
    this.removeStaleChanges()
    return this.changes
  }
  
  /**
   * Remove changes that are older than the expiration time
   */
  private removeStaleChanges(): void {
    const now = Date.now()
    this.changes = this.changes.filter(change => 
      now - change.timestamp <= this.changeExpirationTime
    )
  }
  
  /**
   * Enforce the limit on the number of changes to track
   */
  private enforceChangesLimit(): void {
    if (this.changes.length <= this.maxChangesToTrack) return
    
    // Remove oldest changes first
    this.changes = this.changes.slice(this.changes.length - this.maxChangesToTrack)
  }
  
  /**
   * Reset all tracked changes
   */
  public reset(): void {
    this.changes = []
  }
}
