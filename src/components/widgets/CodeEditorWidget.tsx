import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileText, Plus, Trash2, Download, Upload, Save, X } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';

interface CodeEditorWidgetProps {
  widgetId: string;
}

interface EditorFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

const languageExtensions: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  html: 'html',
  css: 'css',
  json: 'json',
  markdown: 'md',
  yaml: 'yaml',
  xml: 'xml',
  sql: 'sql',
  shell: 'sh',
  rust: 'rs',
  go: 'go',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
};

const defaultFiles: EditorFile[] = [
  {
    id: 'welcome',
    name: 'welcome.md',
    language: 'markdown',
    content: `# Welcome to Code Editor

This is a lightweight Monaco Editor (the editor that powers VS Code).

## Features
- 🎨 Syntax highlighting for 50+ languages
- 📁 Multi-file tabs
- 💾 Auto-save to localStorage
- 🌓 Theme-aware (follows Brains theme)
- 📥 Export files

## Getting Started
1. Click the "+" button to create a new file
2. Select a language from the dropdown
3. Start coding!

Files are automatically saved to localStorage.`,
  },
];

export function CodeEditorWidget({ widgetId }: CodeEditorWidgetProps) {
  const { themeId } = useThemeStore();
  const [files, setFiles] = useState<EditorFile[]>(defaultFiles);
  const [activeFileId, setActiveFileId] = useState<string>(defaultFiles[0].id);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('javascript');

  // Load files from localStorage on mount
  useEffect(() => {
    const savedFiles = localStorage.getItem(`code-editor-files-${widgetId}`);
    if (savedFiles) {
      try {
        const parsed = JSON.parse(savedFiles);
        setFiles(parsed);
        if (parsed.length > 0) {
          setActiveFileId(parsed[0].id);
        }
      } catch (error) {
        console.error('Failed to load saved files:', error);
      }
    }
  }, [widgetId]);

  // Save files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`code-editor-files-${widgetId}`, JSON.stringify(files));
  }, [files, widgetId]);

  const activeFile = files.find((f) => f.id === activeFileId);

  const handleEditorChange = (value: string | undefined) => {
    if (!activeFile || value === undefined) return;

    setFiles((prev) =>
      prev.map((file) =>
        file.id === activeFileId ? { ...file, content: value } : file
      )
    );
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;

    const id = `file-${Date.now()}`;
    const extension = languageExtensions[newFileLanguage] || 'txt';
    const name = newFileName.endsWith(`.${extension}`)
      ? newFileName
      : `${newFileName}.${extension}`;

    const newFile: EditorFile = {
      id,
      name,
      language: newFileLanguage,
      content: '',
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(id);
    setShowNewFile(false);
    setNewFileName('');
    setNewFileLanguage('javascript');
  };

  const handleDeleteFile = (id: string) => {
    if (files.length === 1) return; // Don't delete the last file

    setFiles((prev) => {
      const newFiles = prev.filter((f) => f.id !== id);
      if (activeFileId === id && newFiles.length > 0) {
        setActiveFileId(newFiles[0].id);
      }
      return newFiles;
    });
  };

  const handleExportFile = () => {
    if (!activeFile) return;

    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const name = file.name;
        const extension = name.split('.').pop()?.toLowerCase() || '';
        const language =
          Object.entries(languageExtensions).find(([_, ext]) => ext === extension)?.[0] ||
          'plaintext';

        const newFile: EditorFile = {
          id: `file-${Date.now()}`,
          name,
          language,
          content,
        };

        setFiles((prev) => [...prev, newFile]);
        setActiveFileId(newFile.id);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const editorTheme = themeId.includes('dark') || themeId === 'dark' ? 'vs-dark' : 'light';

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="h-12 border-b border-border bg-card px-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Code Editor</span>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNewFile(true)}
          aria-label="New file"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImportFile}
          aria-label="Import file"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportFile}
          disabled={!activeFile}
          aria-label="Export file"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* File Tabs */}
      <div className="border-b border-border bg-card px-2 flex items-center gap-1 overflow-x-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors group',
              activeFileId === file.id
                ? 'bg-background border-b-2 border-primary'
                : 'hover:bg-accent'
            )}
            onClick={() => setActiveFileId(file.id)}
          >
            <span className="truncate max-w-[150px]">{file.name}</span>
            {files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                aria-label={`Close ${file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {showNewFile ? (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-10">
            <Card className="p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">New File</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="file-name" className="block text-sm font-medium mb-2">
                    File Name
                  </label>
                  <input
                    id="file-name"
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
                    placeholder="myfile"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="file-language" className="block text-sm font-medium mb-2">
                    Language
                  </label>
                  <select
                    id="file-language"
                    value={newFileLanguage}
                    onChange={(e) => setNewFileLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.keys(languageExtensions).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateFile} className="flex-1">
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewFile(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : activeFile ? (
          <Editor
            height="100%"
            language={activeFile.language}
            value={activeFile.content}
            onChange={handleEditorChange}
            theme={editorTheme}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>No file selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
