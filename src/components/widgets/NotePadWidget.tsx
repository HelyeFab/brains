import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Plus,
  Trash2,
  Search,
  Download,
  Upload,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Edit2,
  Check,
} from 'lucide-react';
import { useNotesStore } from '@/stores/useNotesStore';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';
import * as Popover from '@radix-ui/react-popover';

interface NotePadWidgetProps {
  widgetId: string;
}

const lowlight = createLowlight(common);

const colorOptions = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Teal', value: 'bg-teal-500' },
];

export function NotePadWidget({ widgetId }: NotePadWidgetProps) {
  const notes = useNotesStore((state) => state.notes);
  const createNote = useNotesStore((state) => state.createNote);
  const updateNote = useNotesStore((state) => state.updateNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const getNote = useNotesStore((state) => state.getNote);
  const activeNoteId = useUIStore((state) => state.activeNoteId);
  const setActiveNoteId = useUIStore((state) => state.setActiveNoteId);

  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const activeNote = activeNoteId ? getNote(activeNoteId) : null;

  // Debounce timer for auto-save
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false, // Prevent SSR hydration mismatches
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: activeNote ? JSON.parse(activeNote.content) : null,
    onUpdate: ({ editor }) => {
      // Debounced auto-save
      if (saveTimer) clearTimeout(saveTimer);
      const timer = setTimeout(() => {
        if (activeNoteId) {
          const content = JSON.stringify(editor.getJSON());
          updateNote(activeNoteId, { content });
        }
      }, 500);
      setSaveTimer(timer);
    },
  });

  // Update editor content when active note changes
  useEffect(() => {
    if (editor && activeNote) {
      const content = JSON.parse(activeNote.content);
      editor.commands.setContent(content);
    } else if (editor && !activeNote) {
      editor.commands.setContent('');
    }
  }, [activeNoteId, editor]);

  // Create first note if none exist
  useEffect(() => {
    if (notes.length === 0) {
      const id = createNote('My First Note');
      setActiveNoteId(id);
    } else if (!activeNoteId && notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes.length]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [saveTimer]);

  const handleCreateNote = () => {
    const id = createNote();
    setActiveNoteId(id);
  };

  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  };

  const handleSelectNote = (noteId: string) => {
    setActiveNoteId(noteId);
  };

  const handleStartEdit = (noteId: string, currentTitle: string) => {
    setEditingId(noteId);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (noteId: string) => {
    if (editTitle.trim()) {
      updateNote(noteId, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const handleColorChange = (noteId: string, color: string) => {
    updateNote(noteId, { color });
  };

  const handleExport = async () => {
    if (!activeNote || !window.api?.notes) return;
    setIsExporting(true);
    try {
      const result = await window.api.notes.export(activeNote);
      if (!result.ok) {
        console.error('Export failed:', result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!window.api?.notes) return;
    setIsImporting(true);
    try {
      const result = await window.api.notes.import();
      if (result.ok && result.note) {
        // Generate new ID to avoid conflicts
        const newId = `note-${Date.now()}`;
        const importedNote: Note = {
          ...result.note,
          id: newId,
        };

        // Add to store by creating a new note and updating it
        const id = createNote(importedNote.title);
        updateNote(id, {
          content: importedNote.content,
          createdAt: importedNote.createdAt,
          updatedAt: Date.now(),
        });
        setActiveNoteId(id);
      }
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-background">
      {/* Notes Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-card" aria-label="Notes sidebar">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-semibold">Notes</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreateNote}
              aria-label="Create new note"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search notes"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1" role="list" aria-label="Notes list">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground" role="status">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isEditing = editingId === note.id;
              const isActive = activeNoteId === note.id;

              return (
                <div
                  key={note.id}
                  role="listitem"
                  className={cn(
                    'group relative p-3 rounded-md cursor-pointer transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => !isEditing && handleSelectNote(note.id)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {/* Color indicator */}
                  {note.color && (
                    <div className={cn('w-1 h-full absolute left-0 top-0 rounded-l-md', note.color)} aria-hidden="true" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(note.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full font-medium text-sm bg-background text-foreground px-2 py-1 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label="Edit note title"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-sm truncate block">
                          {note.title}
                        </span>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isEditing ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-6 w-6',
                            isActive && 'hover:bg-primary-foreground/20'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(note.id);
                          }}
                          aria-label="Save title"
                        >
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      ) : (
                        <>
                          <Popover.Root>
                            <Popover.Trigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-6 w-6',
                                  isActive && 'hover:bg-primary-foreground/20'
                                )}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Choose color for ${note.title}`}
                              >
                                <div className={cn('h-3 w-3 rounded-full border-2', note.color || 'border-current')} aria-hidden="true" />
                              </Button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content
                                className="bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-3 z-50"
                                sideOffset={5}
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Color picker"
                              >
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold">Note Color</p>
                                  <div className="grid grid-cols-5 gap-2" role="group" aria-label="Color options">
                                    {colorOptions.map((color) => (
                                      <button
                                        key={color.value}
                                        className={cn(
                                          'h-6 w-6 rounded-full transition-transform hover:scale-110',
                                          color.value,
                                          note.color === color.value && 'ring-2 ring-offset-2 ring-primary'
                                        )}
                                        onClick={() => handleColorChange(note.id, color.value)}
                                        aria-label={color.name}
                                        aria-pressed={note.color === color.value}
                                      />
                                    ))}
                                  </div>
                                  <button
                                    className="w-full text-xs text-muted-foreground hover:text-foreground mt-2"
                                    onClick={() => handleColorChange(note.id, '')}
                                    aria-label="Clear color"
                                  >
                                    Clear color
                                  </button>
                                </div>
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-6 w-6',
                              isActive && 'hover:bg-primary-foreground/20'
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(note.id, note.title);
                            }}
                            aria-label={`Edit ${note.title} title`}
                          >
                            <Edit2 className="h-3 w-3" aria-hidden="true" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-6 w-6',
                              isActive && 'hover:bg-primary-foreground/20'
                            )}
                            onClick={(e) => handleDeleteNote(note.id, e)}
                            aria-label={`Delete ${note.title}`}
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Import/Export */}
        <div className="p-3 border-t border-border flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleImport}
            disabled={isImporting}
            aria-label="Import note from file"
          >
            <Upload className="h-3 w-3" aria-hidden="true" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleExport}
            disabled={!activeNote || isExporting}
            aria-label="Export current note to file"
          >
            <Download className="h-3 w-3" aria-hidden="true" />
            Export
          </Button>
        </div>
      </aside>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden" role="region" aria-label="Note editor">
        {/* Toolbar */}
        {activeNote && (
          <div className="border-b border-border bg-card p-2 flex items-center gap-1 overflow-x-auto" role="toolbar" aria-label="Text formatting">
            <Button
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="icon"
              onClick={() => editor.chain().focus().toggleBold().run()}
              aria-label="Bold"
              aria-pressed={editor.isActive('bold')}
              className="h-8 w-8"
            >
              <Bold className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="icon"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              aria-label="Italic"
              aria-pressed={editor.isActive('italic')}
              className="h-8 w-8"
            >
              <Italic className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={editor.isActive('underline') ? 'default' : 'ghost'}
              size="icon"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              aria-label="Underline"
              aria-pressed={editor.isActive('underline')}
              className="h-8 w-8"
            >
              <UnderlineIcon className="h-4 w-4" aria-hidden="true" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" aria-hidden="true" />

            <Button
              variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
              size="icon"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              aria-label="Heading 1"
              aria-pressed={editor.isActive('heading', { level: 1 })}
              className="h-8 w-8"
            >
              <Heading1 className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
              size="icon"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              aria-label="Heading 2"
              aria-pressed={editor.isActive('heading', { level: 2 })}
              className="h-8 w-8"
            >
              <Heading2 className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
              size="icon"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              aria-label="Heading 3"
              aria-pressed={editor.isActive('heading', { level: 3 })}
              className="h-8 w-8"
            >
              <Heading3 className="h-4 w-4" aria-hidden="true" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" aria-hidden="true" />

            <Button
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="icon"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              aria-label="Bullet list"
              aria-pressed={editor.isActive('bulletList')}
              className="h-8 w-8"
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="icon"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              aria-label="Numbered list"
              aria-pressed={editor.isActive('orderedList')}
              className="h-8 w-8"
            >
              <ListOrdered className="h-4 w-4" aria-hidden="true" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" aria-hidden="true" />

            <Button
              variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
              size="icon"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              aria-label="Code block"
              aria-pressed={editor.isActive('codeBlock')}
              className="h-8 w-8"
            >
              <Code className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto">
          {activeNote ? (
            <div className="max-w-4xl mx-auto p-8">
              <EditorContent
                editor={editor}
                className="prose prose-sm dark:prose-invert max-w-none focus:outline-none"
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a note to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
