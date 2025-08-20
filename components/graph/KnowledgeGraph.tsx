"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Search, Users, FileText, GitBranch, Lightbulb, ZoomIn, ZoomOut, RotateCcw, GitPullRequest, Hash, MessageSquare, Filter, Eye, EyeOff, Maximize2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { mockGraphAPI } from "@/utils/mockApi"
import type { GraphNode, GraphEdge } from "@/utils/types"

interface GraphPosition {
  x: number
  y: number
}

interface GraphNodeWithPosition extends GraphNode {
  x: number
  y: number
  vx?: number
  vy?: number
}

export function KnowledgeGraph() {
  const [nodes, setNodes] = useState<GraphNodeWithPosition[]>([])
  const [originalNodes, setOriginalNodes] = useState<GraphNodeWithPosition[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNodeWithPosition | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null)
  const [showEdgeLabels, setShowEdgeLabels] = useState(false)
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(new Set())
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set())
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null)
  const nodeTypes = useMemo(() => Array.from(new Set(nodes.map((n) => n.type))), [nodes])

  // Compute and fit graph into viewBox (800x600) with padding
  const fitToScreen = (ids?: Set<string>) => {
    const consider = (ids && nodes.filter((n) => ids.has(n.id))) || nodes
    if (!consider.length) return
    const minX = Math.min(...consider.map((n) => n.x))
    const maxX = Math.max(...consider.map((n) => n.x))
    const minY = Math.min(...consider.map((n) => n.y))
    const maxY = Math.max(...consider.map((n) => n.y))
    const width = Math.max(1, maxX - minX)
    const height = Math.max(1, maxY - minY)
    const pad = 60
    const scaleX = (800 - pad * 2) / width
    const scaleY = (600 - pad * 2) / height
    const newZoom = Math.max(0.3, Math.min(3, Math.min(scaleX, scaleY)))
    setZoom(newZoom)
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    setPan({ x: 400 - centerX * newZoom, y: 300 - centerY * newZoom })
  }

  useEffect(() => {
    loadGraphData()
  }, [])

  const loadGraphData = async () => {
    setIsLoading(true)
    try {
      const { nodes: graphNodes, edges: graphEdges } = await mockGraphAPI.getGraph()
      // Deterministic layered layout by type (stationary)
      const typeOrder = [
        "person",
        "project",
        "decision",
        "jira",
        "pr",
        "slack",
        "document",
        "file",
      ]
      const groups = new Map<string, GraphNode[]>()
      graphNodes.forEach((n) => {
        const t = n.type || "other"
        if (!groups.has(t)) groups.set(t, [])
        groups.get(t)!.push(n)
      })
      const orderedTypes = Array.from(new Set([...typeOrder, ...groups.keys()]))
      const colWidth = 400 // Much larger for detailed nodes - increased to prevent overlap
      const rowHeight = 180 // Increased height for more content - increased for spacing
      const leftPad = 200 // Increased padding for better layout
      const topPad = 100 // Increased top padding
      
      // Calculate total dimensions to center the graph
      const totalCols = orderedTypes.length
      const maxRowsPerCol = Math.max(...orderedTypes.map(t => (groups.get(t) || []).length))
      const totalWidth = totalCols * colWidth
      const totalHeight = maxRowsPerCol * rowHeight
      
      // Center the entire graph in a much larger viewbox to accommodate big nodes
      const centerOffsetX = (3600 - totalWidth) / 2 // Much larger virtual space
      const centerOffsetY = (2400 - totalHeight) / 2
      
      const positionedNodes = orderedTypes.flatMap((t, col) => {
        const list = groups.get(t) || []
        // Center each column vertically based on its item count
        const colHeight = list.length * rowHeight
        const colOffsetY = (totalHeight - colHeight) / 2
        
        return list.map((n, i) => ({
          ...n,
          x: centerOffsetX + leftPad + col * colWidth,
          y: centerOffsetY + topPad + colOffsetY + i * rowHeight,
        }))
      })

      const positionedNodesTyped = positionedNodes as GraphNodeWithPosition[]
      setNodes(positionedNodesTyped)
      setOriginalNodes(positionedNodesTyped) // Store original positions
      setEdges(graphEdges)
      // Enable all types initially
      const allTypes = new Set(positionedNodesTyped.map((n) => n.type))
      setVisibleTypes(allTypes)

      // By default, reveal everything to avoid an empty graph
      setVisibleNodeIds(new Set(positionedNodesTyped.map((n) => n.id)))
      setPan({ x: 0, y: 0 })
    } catch (error) {
      console.error("Failed to load graph data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "person":
        return Users
      case "project":
        return GitBranch
      case "document":
        return FileText
      case "decision":
        return Lightbulb
      case "jira":
        return Hash
      case "pr":
        return GitPullRequest
      case "slack":
        return MessageSquare
      case "file":
        return FileText
      default:
        return FileText
    }
  }

  const getNodeStyle = (type: string): { fill: string; stroke: string; gradient: string; lightFill: string } => {
    switch (type) {
      case "person":
        return { fill: "#4F46E5", stroke: "#3730A3", gradient: "url(#personGradient)", lightFill: "#E0E7FF" }
      case "project":
        return { fill: "#059669", stroke: "#047857", gradient: "url(#projectGradient)", lightFill: "#D1FAE5" }
      case "document":
        return { fill: "#7C3AED", stroke: "#5B21B6", gradient: "url(#documentGradient)", lightFill: "#EDE9FE" }
      case "decision":
        return { fill: "#DC2626", stroke: "#991B1B", gradient: "url(#decisionGradient)", lightFill: "#FEE2E2" }
      case "jira":
        return { fill: "#0EA5E9", stroke: "#0284C7", gradient: "url(#jiraGradient)", lightFill: "#E0F2FE" }
      case "pr":
        return { fill: "#16A34A", stroke: "#15803D", gradient: "url(#prGradient)", lightFill: "#DCFCE7" }
      case "slack":
        return { fill: "#DB2777", stroke: "#BE185D", gradient: "url(#slackGradient)", lightFill: "#FCE7F3" }
      case "file":
        return { fill: "#6366F1", stroke: "#4338CA", gradient: "url(#fileGradient)", lightFill: "#E0E7FF" }
      default:
        return { fill: "#64748B", stroke: "#475569", gradient: "url(#defaultGradient)", lightFill: "#F1F5F9" }
    }
  }

  const handleNodeClick = (node: GraphNodeWithPosition) => {
    setSelectedNode(node)
    // Re-center graph around clicked node
    setPan({
      x: 400 - node.x * zoom,
      y: 300 - node.y * zoom,
    })

    // Reset to original positions first to prevent cumulative clustering
    setNodes(originalNodes.map(originalNode => {
      const currentNode = nodes.find(n => n.id === originalNode.id)
      return currentNode ? { ...currentNode, x: originalNode.x, y: originalNode.y } : originalNode
    }))

    // Arrange immediate neighbors around the selected node with improved spacing
    const neighborIds = edges
      .flatMap((e) => (e.source === node.id ? [e.target] : e.target === node.id ? [e.source] : []))
      .filter((id) => visibleNodeIds.has(id))
    
    if (neighborIds.length > 0) {
      // Group neighbors by type for better organization
      const groups: Record<string, string[]> = {}
      neighborIds.forEach((id) => {
        const neighborNode = originalNodes.find((n) => n.id === id)
        const t = neighborNode?.type || "other"
        groups[t] = groups[t] || []
        groups[t].push(id)
      })
      
      const types = Object.keys(groups)
      const nodeWidth = 280 // Match the actual node width
      const nodeHeight = 120 // Match the actual node height
      const minSpacing = 50 // Minimum spacing between nodes
      
      // Calculate optimal radius based on number of neighbors and node size
      const totalNeighbors = neighborIds.length
      const circumference = totalNeighbors * (nodeWidth + minSpacing)
      const minRadius = Math.max(400, circumference / (2 * Math.PI))
      
      // Use layered circular arrangement for many neighbors
      const maxNodesPerLayer = Math.floor((2 * Math.PI * minRadius) / (nodeWidth + minSpacing))
      
      // Use setTimeout to ensure the reset has been applied before rearranging
      setTimeout(() => {
        setNodes((prev) => {
          const newPositions = new Map<string, { x: number; y: number }>()
          let nodeIndex = 0
          
          // Process each type group
          types.forEach((type, typeIndex) => {
            const typeNodes = groups[type]
            const typeSliceSize = (2 * Math.PI) / types.length
            const typeStartAngle = typeIndex * typeSliceSize
            
            typeNodes.forEach((nodeId, indexInType) => {
              // Determine which layer this node should be on
              const layer = Math.floor(nodeIndex / maxNodesPerLayer)
              const positionInLayer = nodeIndex % maxNodesPerLayer
              const nodesInThisLayer = Math.min(maxNodesPerLayer, totalNeighbors - layer * maxNodesPerLayer)
              
              // Calculate radius for this layer
              const layerRadius = minRadius + (layer * (nodeHeight + minSpacing * 2))
              
              // Calculate angle within the type slice
              const angleStep = typeSliceSize / Math.max(1, typeNodes.length)
              const nodeAngle = typeStartAngle + (indexInType + 0.5) * angleStep
              
              // For multiple layers, slightly offset angles to prevent perfect alignment
              const angleOffset = layer * (Math.PI / 180) * 15 // 15 degree offset per layer
              const finalAngle = nodeAngle + angleOffset
              
              // Calculate position
              const x = node.x + Math.cos(finalAngle) * layerRadius
              const y = node.y + Math.sin(finalAngle) * layerRadius
              
              newPositions.set(nodeId, { x, y })
              nodeIndex++
            })
          })
          
          // Apply collision detection and adjustment
          const adjustedPositions = resolveCollisions(newPositions, nodeWidth, nodeHeight, minSpacing)
          
          return prev.map((n) => {
            if (n.id === node.id) return n // Keep selected node in place
            const newPos = adjustedPositions.get(n.id)
            return newPos ? { ...n, x: newPos.x, y: newPos.y } : n
          })
        })
      }, 50)
    }
  }
  
  // Helper function to resolve node collisions
  const resolveCollisions = (
    positions: Map<string, { x: number; y: number }>,
    nodeWidth: number,
    nodeHeight: number,
    minSpacing: number
  ): Map<string, { x: number; y: number }> => {
    const adjustedPositions = new Map(positions)
    const positionsArray = Array.from(adjustedPositions.entries())
    
    // Multiple passes to resolve all collisions
    for (let pass = 0; pass < 3; pass++) {
      let hasCollisions = false
      
      for (let i = 0; i < positionsArray.length; i++) {
        for (let j = i + 1; j < positionsArray.length; j++) {
          const [id1, pos1] = positionsArray[i]
          const [id2, pos2] = positionsArray[j]
          
          const dx = pos1.x - pos2.x
          const dy = pos1.y - pos2.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = Math.sqrt(
            Math.pow(nodeWidth + minSpacing, 2) + Math.pow(nodeHeight + minSpacing, 2)
          )
          
          if (distance < minDistance && distance > 0) {
            hasCollisions = true
            
            // Calculate push vector
            const pushDistance = (minDistance - distance) / 2
            const pushX = (dx / distance) * pushDistance
            const pushY = (dy / distance) * pushDistance
            
            // Update positions
            const newPos1 = { x: pos1.x + pushX, y: pos1.y + pushY }
            const newPos2 = { x: pos2.x - pushX, y: pos2.y - pushY }
            
            adjustedPositions.set(id1, newPos1)
            adjustedPositions.set(id2, newPos2)
            
            // Update the array for subsequent iterations
            positionsArray[i][1] = newPos1
            positionsArray[j][1] = newPos2
          }
        }
      }
      
      if (!hasCollisions) break
    }
    
    return adjustedPositions
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.3))
  }

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedNode(null)
  }

  const searchLower = searchQuery.toLowerCase()
  const filteredNodes = useMemo(() => {
    const base = nodes.filter((node) => node.label.toLowerCase().includes(searchLower) && visibleTypes.has(node.type))
    if (visibleNodeIds.size === 0) return []
    return base.filter((n) => visibleNodeIds.has(n.id))
  }, [nodes, searchLower, visibleNodeIds, visibleTypes])

  const filteredEdges = edges.filter(
    (edge) =>
      filteredNodes.some((node) => node.id === edge.source) && filteredNodes.some((node) => node.id === edge.target),
  )

  // Expansion helpers
  const expandNeighbors = (levels: number = 1) => {
    setVisibleNodeIds((prev) => {
      let current = new Set(prev)
      for (let i = 0; i < levels; i++) {
        const toAdd: string[] = []
        edges.forEach((e) => {
          if (current.has(e.source)) toAdd.push(e.target)
          if (current.has(e.target)) toAdd.push(e.source)
        })
        toAdd.forEach((id) => current.add(id))
      }
      return current
    })
  }

  const revealAll = () => {
    // Show every node, clear search, and enable all types
    setVisibleNodeIds(new Set(nodes.map((n) => n.id)))
    setSearchQuery("")
    setVisibleTypes(new Set(nodes.map((n) => n.type)))
  }
  const resetVisibility = () => setVisibleNodeIds(new Set())

  const focusSearch = () => {
    const exact = nodes.find((n) => n.id.toLowerCase() === searchLower)
    const match = exact || nodes.find((n) => n.label.toLowerCase().includes(searchLower))
    if (match) {
      setVisibleNodeIds(new Set([match.id]))
      setSelectedNode(match as GraphNodeWithPosition)
      setPan({ x: 400 - (match as GraphNodeWithPosition).x * zoom, y: 300 - (match as GraphNodeWithPosition).y * zoom })
    }
  }

  // Helpers to convert screen coords to graph coords considering pan/zoom
  const toGraphCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const x = (clientX - rect.left - pan.x) / zoom
    const y = (clientY - rect.top - pan.y) / zoom
    return { x, y }
  }

  const onSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning && lastMouseRef.current) {
      const dx = e.clientX - lastMouseRef.current.x
      const dy = e.clientY - lastMouseRef.current.y
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
    }
  }

  const onSvgMouseUp = () => {
    setDraggingNodeId(null)
    setIsPanning(false)
    lastMouseRef.current = null
  }
  // Start panning when clicking on the background grid
  const onBackgroundMouseDown = (e: React.MouseEvent<SVGRectElement>) => {
    e.preventDefault()
    setIsPanning(true)
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
  }

  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const delta = -e.deltaY
    const factor = delta > 0 ? 1.1 : 0.9
    const newZoom = Math.min(3, Math.max(0.3, zoom * factor))
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    // Adjust pan so zoom centers around cursor
    setPan((p) => ({ x: cx - ((cx - p.x) * newZoom) / zoom, y: cy - ((cy - p.y) * newZoom) / zoom }))
    setZoom(newZoom)
  }

  // Disable node dragging to keep layout stationary
  const onNodeMouseDown = (_node: GraphNodeWithPosition) => (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading knowledge graph...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-background via-background/95 to-background rounded-lg border border-border/50 p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Knowledge Graph</h2>
                <p className="text-muted-foreground text-sm">Explore connections between people, projects, and decisions</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-background/50 border-border/50 focus:border-primary/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter") focusSearch()
                }}
              />
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Switch id="edge-labels" checked={showEdgeLabels} onCheckedChange={setShowEdgeLabels} />
              <Label htmlFor="edge-labels" className="text-sm text-muted-foreground whitespace-nowrap">Edge labels</Label>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filters */}
          {nodeTypes.map((t) => {
            const isActive = visibleTypes.has(t)
            const nodeStyle = getNodeStyle(t)
            return (
              <Button
                key={t}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setVisibleTypes((prev) => {
                    const next = new Set(prev)
                    if (next.has(t)) next.delete(t)
                    else next.add(t)
                    return next
                  })
                }
                className={`capitalize transition-all duration-200 ${
                  isActive 
                    ? `bg-gradient-to-r text-white border-0 shadow-md hover:shadow-lg` 
                    : 'hover:border-primary/50 hover:bg-primary/5'
                }`}
                style={{
                  background: isActive 
                    ? `linear-gradient(135deg, ${nodeStyle.fill}, ${nodeStyle.stroke})` 
                    : undefined,
                  borderColor: isActive ? nodeStyle.stroke : undefined
                }}
              >
                <div className="flex items-center gap-1.5">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-white/90' : 'bg-current'
                    }`}
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.9)' : nodeStyle.fill
                    }}
                  />
                  {t}
                </div>
              </Button>
            )
          })}
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button variant="outline" size="sm" onClick={() => expandNeighbors(1)} className="bg-background/50">
            <Eye className="h-4 w-4 mr-1" />
            Expand 1-hop
          </Button>
          <Button variant="outline" size="sm" onClick={() => expandNeighbors(2)} className="bg-background/50">
            <Eye className="h-4 w-4 mr-1" />
            Expand 2-hop
          </Button>
          <Button variant="outline" size="sm" onClick={revealAll} className="bg-background/50">
            <Maximize2 className="h-4 w-4 mr-1" />
            Reveal All
          </Button>
          <Button variant="outline" size="sm" onClick={() => fitToScreen(visibleNodeIds)} className="bg-background/50">
            <RotateCcw className="h-4 w-4 mr-1" />
            Fit
          </Button>
          <Button variant="ghost" size="sm" onClick={resetVisibility}>
            <EyeOff className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
            {filteredNodes.length} nodes • {filteredEdges.length} connections
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Visualization */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] overflow-hidden">
            <CardContent className="p-0 h-full">
              <div ref={containerRef} className="relative w-full h-full bg-muted/20">
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  className="cursor-grab active:cursor-grabbing"
                  viewBox="0 0 800 600"
                  onMouseMove={onSvgMouseMove}
                  onMouseUp={onSvgMouseUp}
                  onMouseLeave={onSvgMouseUp}
                  onWheel={onWheel}
                  role="application"
                  aria-label="Developer knowledge graph"
                >
                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    <defs>
                      {/* subtle dotted grid */}
                      <pattern id="grid-dot" width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="hsl(var(--muted-foreground)/0.25)" />
                      </pattern>
                      {/* Enhanced arrow marker */}
                      <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
                        <path d="M2,2 L2,10 L10,6 z" fill="#64748B" stroke="#64748B" strokeWidth="1" />
                      </marker>
                      <marker id="arrow-hover" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
                        <path d="M2,2 L2,10 L10,6 z" fill="#4F46E5" stroke="#4F46E5" strokeWidth="1" />
                      </marker>
                      {/* Gradients for nodes */}
                      <defs>
                        <linearGradient id="personGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366F1" />
                          <stop offset="100%" stopColor="#4F46E5" />
                        </linearGradient>
                        <linearGradient id="projectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="documentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#A855F7" />
                          <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                        <linearGradient id="decisionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#EF4444" />
                          <stop offset="100%" stopColor="#DC2626" />
                        </linearGradient>
                        <linearGradient id="jiraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38BDF8" />
                          <stop offset="100%" stopColor="#0EA5E9" />
                        </linearGradient>
                        <linearGradient id="prGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22C55E" />
                          <stop offset="100%" stopColor="#16A34A" />
                        </linearGradient>
                        <linearGradient id="slackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#EC4899" />
                          <stop offset="100%" stopColor="#DB2777" />
                        </linearGradient>
                        <linearGradient id="fileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818CF8" />
                          <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                        <linearGradient id="defaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#94A3B8" />
                          <stop offset="100%" stopColor="#64748B" />
                        </linearGradient>
                      </defs>
                    </defs>
                    {/* Background capture for panning */}
                    <rect x={-2000} y={-2000} width={4000} height={4000} fill="url(#grid-dot)" onMouseDown={onBackgroundMouseDown} />
                    {/* Edges */}
                    {filteredEdges.map((edge, index) => {
                      const sourceNode = filteredNodes.find((n) => n.id === edge.source)
                      const targetNode = filteredNodes.find((n) => n.id === edge.target)
                      if (!sourceNode || !targetNode) return null

                      // Get edge color based on source node type
                      const sourceStyle = getNodeStyle(sourceNode.type)
                      const edgeColor = hoveredEdge === index ? "#4F46E5" : sourceStyle.fill
                      const edgeOpacity = hoveredEdge === index ? 1 : 0.7

                      // Curve control point for better readability
                      const mx = (sourceNode.x + targetNode.x) / 2
                      const my = (sourceNode.y + targetNode.y) / 2
                      const dx = targetNode.x - sourceNode.x
                      const dy = targetNode.y - sourceNode.y
                      const norm = Math.max(1, Math.hypot(dx, dy))
                      const off = 20 // curve offset
                      const cx = mx - (dy / norm) * off
                      const cy = my + (dx / norm) * off

                      return (
                        <g key={index} onMouseEnter={() => setHoveredEdge(index)} onMouseLeave={() => setHoveredEdge(null)}>
                          {/* Main edge line */}
                          <path
                            d={`M ${sourceNode.x} ${sourceNode.y} Q ${cx} ${cy} ${targetNode.x} ${targetNode.y}`}
                            fill="none"
                            stroke={edgeColor}
                            strokeOpacity={edgeOpacity}
                            strokeWidth={hoveredEdge === index ? Math.max(edge.strength * 5, 4) : Math.max(edge.strength * 3, 2)}
                            markerEnd={hoveredEdge === index ? "url(#arrow-hover)" : "url(#arrow)"}
                            className="transition-all duration-200"
                          />
                          
                          {/* Connection dots at endpoints */}
                          <circle
                            cx={sourceNode.x}
                            cy={sourceNode.y}
                            r={hoveredEdge === index ? 6 : 4}
                            fill={edgeColor}
                            fillOpacity={edgeOpacity}
                            className="transition-all duration-200"
                          />
                          <circle
                            cx={targetNode.x}
                            cy={targetNode.y}
                            r={hoveredEdge === index ? 6 : 4}
                            fill={edgeColor}
                            fillOpacity={edgeOpacity}
                            className="transition-all duration-200"
                          />
                          {(showEdgeLabels || hoveredEdge === index) && (
                            <g>
                              <rect
                                x={cx - edge.relationship.length * 3.2 - 4}
                                y={cy - 9}
                                width={edge.relationship.length * 6.4 + 8}
                                height={14}
                                rx={4}
                                ry={4}
                                fill="white"
                                stroke={edgeColor}
                                strokeOpacity={0.8}
                                strokeWidth={1.5}
                                className="dark:fill-slate-800"
                              />
                              <text 
                                x={cx} 
                                y={cy + 2} 
                                className="text-[10px] font-medium dark:fill-slate-100" 
                                textAnchor="middle"
                                fill="#1e293b"
                              >
                                {edge.relationship}
                              </text>
                            </g>
                          )}
                        </g>
                      )
                    })}

                    {/* Nodes */}
                    {filteredNodes.map((node) => {
                      const Icon = getNodeIcon(node.type)
                      const isSelected = selectedNode?.id === node.id
                      const isHovered = hoveredNodeId === node.id

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          tabIndex={0}
                          role="button"
                          aria-label={`${node.type} ${node.label}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") handleNodeClick(node)
                            if (e.key === "ArrowLeft") setPan((p) => ({ ...p, x: p.x + 20 }))
                            if (e.key === "ArrowRight") setPan((p) => ({ ...p, x: p.x - 20 }))
                            if (e.key === "ArrowUp") setPan((p) => ({ ...p, y: p.y + 20 }))
                            if (e.key === "ArrowDown") setPan((p) => ({ ...p, y: p.y - 20 }))
                          }}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                        >
                          {/* Large detailed node card */}
                          {(() => {
                            const { fill, stroke, gradient } = getNodeStyle(node.type)
                            const nodeWidth = 280
                            const nodeHeight = 120
                            const hasAlert = node.id.includes('jira') || node.id.includes('file') // Only specific nodes have alerts
                            const columnCount = Object.keys(node.metadata || {}).length
                            
                            return (
                              <g>
                                {/* Drop shadow */}
                                <rect 
                                  x={-nodeWidth/2 + 2} 
                                  y={-nodeHeight/2 + 2} 
                                  width={nodeWidth} 
                                  height={nodeHeight} 
                                  rx={12} 
                                  ry={12} 
                                  fill="rgba(0, 0, 0, 0.1)" 
                                />
                                
                                {/* Main card background - light in dark mode, dark in light mode */}
                                <rect 
                                  x={-nodeWidth/2} 
                                  y={-nodeHeight/2} 
                                  width={nodeWidth} 
                                  height={nodeHeight} 
                                  rx={12} 
                                  ry={12} 
                                  fill="white" 
                                  stroke={isSelected ? stroke : "hsl(var(--border))"} 
                                  strokeWidth={isSelected ? 2 : 1}
                                  className="cursor-pointer transition-all duration-200 dark:fill-slate-900"
                                  onClick={() => handleNodeClick(node)}
                                  onMouseDown={onNodeMouseDown(node)}
                                />
                                
                                {/* Header section */}
                                <rect 
                                  x={-nodeWidth/2} 
                                  y={-nodeHeight/2} 
                                  width={nodeWidth} 
                                  height={36} 
                                  rx={12} 
                                  ry={12} 
                                  fill="#f8fafc" 
                                  className="pointer-events-none dark:fill-slate-800"
                                />
                                <rect 
                                  x={-nodeWidth/2} 
                                  y={-nodeHeight/2 + 24} 
                                  width={nodeWidth} 
                                  height={12} 
                                  fill="#f8fafc" 
                                  className="pointer-events-none dark:fill-slate-800"
                                />
                                
                                {/* Icon */}
                                <circle 
                                  cx={-nodeWidth/2 + 20} 
                                  cy={-nodeHeight/2 + 18} 
                                  r={10} 
                                  fill={fill} 
                                  className="pointer-events-none"
                                />
                                <foreignObject 
                                  x={-nodeWidth/2 + 12} 
                                  y={-nodeHeight/2 + 10} 
                                  width={16} 
                                  height={16} 
                                  className="pointer-events-none"
                                >
                                  <Icon className="h-4 w-4 text-white" />
                                </foreignObject>
                                
                                {/* Title */}
                                <text 
                                  x={-nodeWidth/2 + 42} 
                                  y={-nodeHeight/2 + 14} 
                                  className="text-[14px] font-bold pointer-events-none dark:fill-slate-100"
                                  fill="#1e293b"
                                >
                                  {node.label.toUpperCase()}
                                </text>
                                
                                {/* Status indicator */}
                                {hasAlert ? (
                                  <circle 
                                    cx={nodeWidth/2 - 20} 
                                    cy={-nodeHeight/2 + 18} 
                                    r={8} 
                                    fill="#ef4444" 
                                    className="pointer-events-none"
                                  />
                                ) : (
                                  <circle 
                                    cx={nodeWidth/2 - 20} 
                                    cy={-nodeHeight/2 + 18} 
                                    r={8} 
                                    fill="#22c55e" 
                                    className="pointer-events-none"
                                  />
                                )}
                                <text 
                                  x={nodeWidth/2 - 20} 
                                  y={-nodeHeight/2 + 22} 
                                  textAnchor="middle" 
                                  className="fill-white text-[10px] font-bold pointer-events-none"
                                  fill="white"
                                >
                                  {hasAlert ? "!" : "✓"}
                                </text>
                                
                                {/* Content area */}
                                <text 
                                  x={-nodeWidth/2 + 16} 
                                  y={-nodeHeight/2 + 50} 
                                  className="fill-muted-foreground text-[11px] pointer-events-none"
                                  fill="hsl(var(--muted-foreground))"
                                >
                                  {columnCount} columns
                                </text>
                                
                                {/* Show columns link */}
                                <text 
                                  x={-nodeWidth/2 + 16} 
                                  y={-nodeHeight/2 + 68} 
                                  className="fill-primary text-[10px] pointer-events-none underline"
                                  fill={fill}
                                >
                                  Show columns
                                </text>
                                
                                {/* Sample metadata items */}
                                {Object.entries(node.metadata || {}).slice(0, 2).map(([key, value], idx) => (
                                  <text 
                                    key={key}
                                    x={-nodeWidth/2 + 16} 
                                    y={-nodeHeight/2 + 85 + (idx * 12)} 
                                    className="fill-muted-foreground text-[9px] pointer-events-none"
                                    fill="hsl(var(--muted-foreground))"
                                  >
                                    {key}: {String(value).slice(0, 20)}{String(value).length > 20 ? '...' : ''}
                                  </text>
                                ))}
                                
                                {/* Expand/collapse buttons for selected nodes */}
                                {isSelected && (
                                  <g>
                                    <circle 
                                      cx={-nodeWidth/2 - 15} 
                                      cy={0} 
                                      r={8} 
                                      fill={fill} 
                                      className="cursor-pointer"
                                    />
                                    <text 
                                      x={-nodeWidth/2 - 15} 
                                      y={3} 
                                      textAnchor="middle" 
                                      className="fill-white text-[10px] font-bold cursor-pointer"
                                      fill="white"
                                    >
                                      +
                                    </text>
                                    
                                    <circle 
                                      cx={nodeWidth/2 + 15} 
                                      cy={0} 
                                      r={8} 
                                      fill={fill} 
                                      className="cursor-pointer"
                                    />
                                    <text 
                                      x={nodeWidth/2 + 15} 
                                      y={3} 
                                      textAnchor="middle" 
                                      className="fill-white text-[10px] font-bold cursor-pointer"
                                      fill="white"
                                    >
                                      -
                                    </text>
                                  </g>
                                )}
                                
                                {/* Alert section for nodes with issues */}
                                {hasAlert && isSelected && (
                                  <g>
                                    <rect 
                                      x={-nodeWidth/2} 
                                      y={nodeHeight/2 - 30} 
                                      width={nodeWidth} 
                                      height={30} 
                                      rx={0} 
                                      ry={0} 
                                      fill="#fef2f2" 
                                      stroke="#ef4444" 
                                      strokeWidth={1}
                                      className="pointer-events-none"
                                    />
                                    <text 
                                      x={-nodeWidth/2 + 16} 
                                      y={nodeHeight/2 - 15} 
                                      className="fill-red-600 text-[10px] font-semibold pointer-events-none"
                                      fill="#dc2626"
                                    >
                                      Monte Carlo Alert
                                    </text>
                                    <text 
                                      x={-nodeWidth/2 + 16} 
                                      y={nodeHeight/2 - 5} 
                                      className="fill-red-500 text-[9px] pointer-events-none"
                                      fill="#ef4444"
                                    >
                                      Data quality test failed
                                    </text>
                                  </g>
                                )}
                              </g>
                            )
                          })()}
                        </g>
                      )
                    })}
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details Panel */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Legend</h3>
              <div className="space-y-2">
                {[
                  { type: "person", label: "People", icon: Users },
                  { type: "project", label: "Projects", icon: GitBranch },
                  { type: "document", label: "Documents", icon: FileText },
                  { type: "decision", label: "Decisions", icon: Lightbulb },
                  { type: "jira", label: "Jira Ticket", icon: Hash },
                  { type: "pr", label: "Pull Request", icon: GitPullRequest },
                  { type: "slack", label: "Slack Conversation", icon: MessageSquare },
                  { type: "file", label: "Code File", icon: FileText },
                ].map(({ type, label, icon: Icon }) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: getNodeStyle(type).fill, outline: `2px solid ${getNodeStyle(type).stroke}` }}
                    />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedNode && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Node Details</h3>
                <div className="space-y-3">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {selectedNode.type}
                    </Badge>
                    <h4 className="font-medium text-foreground">{selectedNode.label}</h4>
                  </div>

                  {selectedNode.metadata && (
                    <div className="space-y-2">
                      {Object.entries(selectedNode.metadata).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className="ml-2 text-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">Click other nodes to explore connections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedNode && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Getting Started</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Click any node to explore its connections</p>
                  <p>• Use search to filter nodes</p>
                  <p>• Zoom and pan to navigate large graphs</p>
                  <p>• Different colors represent different types</p>
                  <p>• Edges are directional and labeled (e.g., led to, discusses, modifies)</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
