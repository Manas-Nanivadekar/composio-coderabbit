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
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    loadGraphData()
  }, [])

  const loadGraphData = async () => {
    setIsLoading(true)
    try {
      const { nodes: graphNodes, edges: graphEdges } = await mockGraphAPI.getGraph()

      // Position nodes in a force-directed layout
      const positionedNodes = graphNodes.map((node, index) => ({
        ...node,
        x: 400 + Math.cos((index * 2 * Math.PI) / graphNodes.length) * 150,
        y: 300 + Math.sin((index * 2 * Math.PI) / graphNodes.length) * 150,
      }))

      setNodes(positionedNodes)
      setEdges(graphEdges)

      // Seed initial visibility so the graph isn't empty
      const preferredSeed =
        positionedNodes.find((n) => n.type === "project") ||
        positionedNodes.find((n) => n.type === "pr") ||
        positionedNodes[0]
      if (preferredSeed) {
        const initialVisible = new Set<string>([preferredSeed.id])
        // Show 1-hop neighbors by default for context
        graphEdges.forEach((e) => {
          if (e.source === preferredSeed.id) initialVisible.add(e.target)
          if (e.target === preferredSeed.id) initialVisible.add(e.source)
        })
        setVisibleNodeIds(initialVisible)
        // Center the view on the seed
        setPan({ x: 400 - preferredSeed.x * zoom, y: 300 - preferredSeed.y * zoom })
      }
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

  const getNodeStyle = (type: string): { fill: string; stroke: string; gradient: string } => {
    switch (type) {
      case "person":
        return { fill: "#3B82F6", stroke: "#1D4ED8", gradient: "url(#personGradient)" }
      case "project":
        return { fill: "#22C55E", stroke: "#15803D", gradient: "url(#projectGradient)" }
      case "document":
        return { fill: "#A855F7", stroke: "#7E22CE", gradient: "url(#documentGradient)" }
      case "decision":
        return { fill: "#F59E0B", stroke: "#B45309", gradient: "url(#decisionGradient)" }
      case "jira":
        return { fill: "#2563EB", stroke: "#1E3A8A", gradient: "url(#jiraGradient)" }
      case "pr":
        return { fill: "#10B981", stroke: "#047857", gradient: "url(#prGradient)" }
      case "slack":
        return { fill: "#A21CAF", stroke: "#701A75", gradient: "url(#slackGradient)" }
      case "file":
        return { fill: "#6B7280", stroke: "#374151", gradient: "url(#fileGradient)" }
      default:
        return { fill: "#9CA3AF", stroke: "#6B7280", gradient: "url(#defaultGradient)" }
    }
  }

  const handleNodeClick = (node: GraphNodeWithPosition) => {
    setSelectedNode(node)
    // Re-center graph around clicked node
    setPan({
      x: 400 - node.x * zoom,
      y: 300 - node.y * zoom,
    })
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
    const base = nodes.filter((node) => node.label.toLowerCase().includes(searchLower))
    if (visibleNodeIds.size === 0) return []
    return base.filter((n) => visibleNodeIds.has(n.id))
  }, [nodes, searchLower, visibleNodeIds])

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

  const revealAll = () => setVisibleNodeIds(new Set(nodes.map((n) => n.id)))
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

  const onBackgroundMouseDown = (e: React.MouseEvent<SVGRectElement>) => {
    setIsPanning(true)
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
  }

  const onSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNodeId) {
      const { x, y } = toGraphCoords(e.clientX, e.clientY)
      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: x - dragOffset.dx, y: y - dragOffset.dy } : n)),
      )
      return
    }
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

  const onNodeMouseDown = (node: GraphNodeWithPosition) => (e: React.MouseEvent) => {
    e.stopPropagation()
    const { x, y } = toGraphCoords(e.clientX, e.clientY)
    setDraggingNodeId(node.id)
    setDragOffset({ dx: x - node.x, dy: y - node.y })
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
                      <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="hsl(var(--muted-foreground))" />
                      </marker>
                    </defs>
                    {/* Background capture for panning */}
                    <rect x={-2000} y={-2000} width={4000} height={4000} fill="transparent" onMouseDown={onBackgroundMouseDown} />
                    {/* Edges */}
                    {filteredEdges.map((edge, index) => {
                      const sourceNode = filteredNodes.find((n) => n.id === edge.source)
                      const targetNode = filteredNodes.find((n) => n.id === edge.target)
                      if (!sourceNode || !targetNode) return null

                      return (
                        <g key={index} onMouseEnter={() => setHoveredEdge(index)} onMouseLeave={() => setHoveredEdge(null)}>
                          <line
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={Math.max(edge.strength * 3, 1)}
                            strokeOpacity={0.6}
                            markerEnd="url(#arrow)"
                          />
                          {(showEdgeLabels || hoveredEdge === index) && (
                            <text
                              x={(sourceNode.x + targetNode.x) / 2}
                              y={(sourceNode.y + targetNode.y) / 2}
                              className="fill-muted-foreground text-[10px] bg-background"
                              textAnchor="middle"
                            >
                              {edge.relationship}
                            </text>
                          )}
                        </g>
                      )
                    })}

                    {/* Nodes */}
                    {filteredNodes.map((node) => {
                      const Icon = getNodeIcon(node.type)
                      const isSelected = selectedNode?.id === node.id

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
                        >
                          {/* Shape varies by type for clarity */}
                          {(() => {
                            const { fill, stroke } = getNodeStyle(node.type)
                            if (node.type === "person") {
                              return (
                                <circle
                                  r={isSelected ? 32 : 28}
                                  fill={fill}
                                  stroke={stroke}
                                  strokeWidth={isSelected ? 3 : 2}
                                  className="cursor-pointer transition-all duration-200 hover:drop-shadow"
                                  onClick={() => handleNodeClick(node)}
                                  onMouseDown={onNodeMouseDown(node)}
                                />
                              )
                            }
                            return (
                              <rect
                                x={-60}
                                y={-24}
                                rx={node.type === "slack" ? 16 : 8}
                                ry={node.type === "slack" ? 16 : 8}
                                width={isSelected ? 130 : 120}
                                height={isSelected ? 50 : 48}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={isSelected ? 3 : 2}
                                className="cursor-pointer transition-all duration-200 hover:drop-shadow"
                                onClick={() => handleNodeClick(node)}
                                onMouseDown={onNodeMouseDown(node)}
                              />
                            )
                          })()}
                          <foreignObject x={-12} y={-12} width={24} height={24} className="pointer-events-none">
                            <Icon className="h-6 w-6 text-white" />
                          </foreignObject>
                          <text
                            y={node.type === "person" ? 40 : 32}
                            textAnchor="middle"
                            className="fill-white text-sm font-semibold pointer-events-none drop-shadow"
                          >
                            {node.label.length > 18 ? `${node.label.slice(0, 18)}...` : node.label}
                          </text>
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
