# Virtualization Module

This module provides optimization for the Canvas Editor when working with large documents. It implements a virtualization system that:

1. Only calculates and renders visible content
2. Reuses previous calculations when possible
3. Intelligently determines what needs to be recalculated when changes are made

## Key Components

- **VirtualizationManager**: Coordinates the virtualization functionality
- **VirtualizationCache**: Manages caching of calculated rows and pages
- **VirtualizationViewport**: Tracks what's visible and what needs rendering
- **VirtualizationDiffTracker**: Tracks changes to determine what needs recalculation

## Integration

The virtualization system integrates with the Draw.ts component to optimize:
- Row calculation (computeRowList)
- Page rendering
- Element change detection

## Usage

The virtualization system is automatically enabled for large documents. No additional configuration is required.

## Performance Impact

- Significantly reduces computation time for documents with large amounts of text
- Improves responsiveness when editing tables or complex layouts
- Reduces memory usage by only keeping necessary data in memory
