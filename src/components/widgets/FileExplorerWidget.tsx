import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Folder, File, ChevronRight, ChevronDown, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FileExplorerWidgetProps {
  widgetId: string;
}

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
  expanded?: boolean;
}

// Mock file system for now - will be replaced with real FS access
const mockFileSystem: FileNode = {
  name: 'home',
  type: 'directory',
  path: '/home',
  expanded: true,
  children: [
    {
      name: 'Documents',
      type: 'directory',
      path: '/home/Documents',
      children: [
        { name: 'readme.md', type: 'file', path: '/home/Documents/readme.md' },
        { name: 'notes.txt', type: 'file', path: '/home/Documents/notes.txt' },
      ],
    },
    {
      name: 'Projects',
      type: 'directory',
      path: '/home/Projects',
      children: [
        {
          name: 'brains',
          type: 'directory',
          path: '/home/Projects/brains',
          children: [
            { name: 'package.json', type: 'file', path: '/home/Projects/brains/package.json' },
            { name: 'README.md', type: 'file', path: '/home/Projects/brains/README.md' },
          ],
        },
      ],
    },
    {
      name: 'Downloads',
      type: 'directory',
      path: '/home/Downloads',
      children: [],
    },
  ],
};

function FileTree({ node, onSelect, depth = 0 }: { node: FileNode; onSelect: (path: string) => void; depth?: number }) {
  const [expanded, setExpanded] = useState(node.expanded ?? false);

  const toggleExpand = () => {
    if (node.type === 'directory') {
      setExpanded(!expanded);
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
            <FileTree key={`${child.path}-${idx}`} node={child} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorerWidget({ widgetId }: FileExplorerWidgetProps) {
  const [currentPath, setCurrentPath] = useState('/home');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border p-3 flex items-center gap-2">
        <Home className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{currentPath}</span>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <FileTree node={mockFileSystem} onSelect={setSelectedFile} />
      </div>

      <div className="border-t border-border p-3 bg-card">
        <div className="text-xs text-muted-foreground">
          {selectedFile ? `Selected: ${selectedFile}` : 'No file selected'}
        </div>
      </div>

      {/* Info card */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">File Explorer (Demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              This is a demo file explorer with mock data. Real file system integration will be added with
              Electron IPC handlers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
