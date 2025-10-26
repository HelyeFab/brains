import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Folder, File, ChevronRight, ChevronDown, Home, RefreshCw, FolderUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FileExplorerWidgetProps {
  widgetId: string;
}

interface FileEntry {
  name: string;
  type: 'file' | 'directory';
  path: string;
  isHidden: boolean;
}

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
  expanded?: boolean;
  loaded?: boolean;
}

function FileTree({
  node,
  onSelect,
  onExpand,
  depth = 0
}: {
  node: FileNode;
  onSelect: (path: string, type: 'file' | 'directory') => void;
  onExpand: (path: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(node.expanded ?? false);

  const toggleExpand = async () => {
    if (node.type === 'directory') {
      const newExpanded = !expanded;
      setExpanded(newExpanded);
      if (newExpanded && !node.loaded) {
        onExpand(node.path);
      }
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={toggleExpand}
      >
        {node.type === 'directory' && (
          <span className="flex-shrink-0">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        )}
        {node.type === 'directory' ? (
          <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
        ) : (
          <File className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-4" />
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {node.type === 'directory' && expanded && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <FileTree
              key={`${child.path}-${idx}`}
              node={child}
              onSelect={onSelect}
              onExpand={onExpand}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorerWidget({ widgetId }: FileExplorerWidgetProps) {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    // Get home directory and initialize
    async function init() {
      if (!window.api?.files) {
        setError('File system API not available');
        setLoading(false);
        return;
      }

      const homeResult = await window.api.files.getHomeDir();
      if (homeResult?.ok) {
        const homePath = homeResult.path;
        setCurrentPath(homePath);
        await loadDirectory(homePath);
      } else {
        setError('Failed to get home directory');
      }
      setLoading(false);
    }

    init();
  }, []);

  const loadDirectory = async (dirPath: string, parentNode?: FileNode) => {
    if (!window.api?.files) return;

    const result = await window.api.files.readDir(dirPath);

    if (!result?.ok) {
      console.error('Failed to read directory:', result?.error);
      return;
    }

    const files = result.files || [];
    const filteredFiles = showHidden ? files : files.filter((f: FileEntry) => !f.isHidden);

    const children: FileNode[] = filteredFiles.map((file: FileEntry) => ({
      name: file.name,
      type: file.type,
      path: file.path,
      children: file.type === 'directory' ? [] : undefined,
      loaded: false,
    }));

    if (parentNode) {
      // Update a specific node in the tree
      setFileTree((prev) => {
        if (!prev) return prev;
        return updateNodeInTree(prev, parentNode.path, children);
      });
    } else {
      // Create root node
      const pathParts = dirPath.split('/').filter(Boolean);
      const dirName = pathParts[pathParts.length - 1] || 'home';

      setFileTree({
        name: dirName,
        type: 'directory',
        path: dirPath,
        children,
        expanded: true,
        loaded: true,
      });
    }
  };

  const updateNodeInTree = (node: FileNode, targetPath: string, newChildren: FileNode[]): FileNode => {
    if (node.path === targetPath) {
      return {
        ...node,
        children: newChildren,
        loaded: true,
        expanded: true,
      };
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) => updateNodeInTree(child, targetPath, newChildren)),
      };
    }

    return node;
  };

  const handleExpand = async (path: string) => {
    const node = findNodeByPath(fileTree, path);
    if (node && !node.loaded) {
      await loadDirectory(path, node);
    }
  };

  const findNodeByPath = (node: FileNode | null, targetPath: string): FileNode | null => {
    if (!node) return null;
    if (node.path === targetPath) return node;

    if (node.children) {
      for (const child of node.children) {
        const found = findNodeByPath(child, targetPath);
        if (found) return found;
      }
    }

    return null;
  };

  const handleSelect = (path: string, type: 'file' | 'directory') => {
    setSelectedFile(path);
    if (type === 'directory') {
      setCurrentPath(path);
    }
  };

  const goToParent = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
    loadDirectory(parentPath);
  };

  const refresh = () => {
    loadDirectory(currentPath);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading file explorer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>File Explorer Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border p-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToParent}
          className="h-8 w-8"
          title="Go to parent directory"
        >
          <FolderUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={refresh}
          className="h-8 w-8"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Home className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium flex-1 truncate">{currentPath}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowHidden(!showHidden);
            loadDirectory(currentPath);
          }}
          className="text-xs"
        >
          {showHidden ? 'Hide' : 'Show'} Hidden
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {fileTree ? (
          <FileTree node={fileTree} onSelect={handleSelect} onExpand={handleExpand} />
        ) : (
          <div className="text-center text-muted-foreground p-4">
            No files to display
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 bg-card">
        <div className="text-xs text-muted-foreground">
          {selectedFile ? `Selected: ${selectedFile}` : 'No file selected'}
        </div>
      </div>
    </div>
  );
}
