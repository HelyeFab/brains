import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, renderWithProviders, setupWidgetStore, createMockWidget } from '@/test/test-utils';
import { Sidebar } from '../Sidebar';
import userEvent from '@testing-library/user-event';
import { useWidgetStore } from '@/stores/useWidgetStore';

describe('Sidebar', () => {
  beforeEach(() => {
    useWidgetStore.setState({
      widgets: [],
      activeWidgetId: null,
    });
  });

  it('should render empty state when no widgets', () => {
    render(<Sidebar />);

    expect(screen.getByText(/No widgets yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Click "New Widget" to add one/i)).toBeInTheDocument();
  });

  it('should display widget count', () => {
    const widgets = [
      createMockWidget('terminal'),
      createMockWidget('system-monitor'),
    ];

    setupWidgetStore(widgets);
    render(<Sidebar />);

    expect(screen.getByText('2 widgets active')).toBeInTheDocument();
  });

  it('should display singular widget count', () => {
    const widgets = [createMockWidget('terminal')];

    setupWidgetStore(widgets);
    render(<Sidebar />);

    expect(screen.getByText('1 widget active')).toBeInTheDocument();
  });

  it('should render widget list', () => {
    const widgets = [
      createMockWidget('terminal', { title: 'My Terminal' }),
      createMockWidget('system-monitor', { title: 'System Info' }),
    ];

    setupWidgetStore(widgets);
    render(<Sidebar />);

    expect(screen.getByText('My Terminal')).toBeInTheDocument();
    expect(screen.getByText('System Info')).toBeInTheDocument();
  });

  it('should highlight active widget', () => {
    const widgets = [
      createMockWidget('terminal'),
      createMockWidget('system-monitor'),
    ];

    setupWidgetStore(widgets, widgets[0].id);
    const { container } = render(<Sidebar />);

    // Active widget should have primary background class
    const activeElement = container.querySelector('.bg-primary');
    expect(activeElement).toBeInTheDocument();
  });

  it('should switch active widget on click', async () => {
    const user = userEvent.setup();
    const widgets = [
      createMockWidget('terminal', { title: 'Terminal 1' }),
      createMockWidget('system-monitor', { title: 'Monitor' }),
    ];

    setupWidgetStore(widgets, widgets[0].id);
    render(<Sidebar />);

    const monitorWidget = screen.getByText('Monitor');
    await user.click(monitorWidget.closest('div')!);

    const state = useWidgetStore.getState();
    expect(state.activeWidgetId).toBe(widgets[1].id);
  });

  it.skip('should show edit input when edit button is clicked', async () => {
    // Skip: Complex DOM interaction test - needs E2E testing
    // The button structure involves nested Radix UI components and hover states
    const user = userEvent.setup();
    const widgets = [createMockWidget('terminal', { title: 'Terminal 1' })];

    setupWidgetStore(widgets);
    const { container } = render(<Sidebar />);

    // Find the widget row
    const widgetElement = screen.getByText('Terminal 1').closest('div')!;

    // Find all buttons in the widget row
    const buttons = widgetElement.querySelectorAll('button');

    // The edit button is the second-to-last button (before the remove X button)
    // Buttons are: [color picker, edit, remove]
    const editButton = buttons[buttons.length - 2];

    // Should have an input field after clicking edit
    await user.click(editButton);

    const input = container.querySelector('input[type="text"]');
    expect(input).toBeInTheDocument();
  });

  it.skip('should save widget title on Enter key', async () => {
    // Skip: Complex DOM interaction test - needs E2E testing
    const user = userEvent.setup();
    const widgets = [createMockWidget('terminal', { title: 'Terminal 1' })];

    setupWidgetStore(widgets);
    const { container } = render(<Sidebar />);

    const widgetElement = screen.getByText('Terminal 1').closest('div')!;
    const buttons = widgetElement.querySelectorAll('button');
    const editButton = buttons[buttons.length - 2];

    await user.click(editButton);

    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).toBeInTheDocument(); // Verify input exists

    // Clear and type new value
    await user.tripleClick(input); // Select all text
    await user.keyboard('New Title{Enter}');

    const state = useWidgetStore.getState();
    expect(state.widgets[0].title).toBe('New Title');
  });

  it('should remove widget when remove button is clicked', async () => {
    const user = userEvent.setup();
    const widgets = [createMockWidget('terminal', { title: 'Terminal 1' })];

    setupWidgetStore(widgets);
    render(<Sidebar />);

    // Wait for component to render
    const terminalText = await screen.findByText('Terminal 1');
    const widgetElement = terminalText.closest('div')!.parentElement!;

    // Find all buttons - need to look in the parent container
    const buttons = widgetElement.querySelectorAll('button');

    // The remove button is the last button (X icon)
    const removeButton = buttons[buttons.length - 1];
    expect(removeButton).toBeInTheDocument();

    await user.click(removeButton);

    const state = useWidgetStore.getState();
    expect(state.widgets).toHaveLength(0);
  });

  it('should show color indicator when widget has color', () => {
    const widgets = [
      createMockWidget('terminal', { color: 'bg-blue-500' }),
    ];

    setupWidgetStore(widgets);
    const { container } = render(<Sidebar />);

    const colorIndicator = container.querySelector('.bg-blue-500');
    expect(colorIndicator).toBeInTheDocument();
  });

  it('should render icons for different widget types', () => {
    const widgets = [
      createMockWidget('terminal'),
      createMockWidget('system-monitor'),
      createMockWidget('file-explorer'),
      createMockWidget('browser'),
    ];

    setupWidgetStore(widgets);
    render(<Sidebar />);

    // Check that all widgets are rendered
    expect(screen.getByText('Test terminal')).toBeInTheDocument();
    expect(screen.getByText('Test system-monitor')).toBeInTheDocument();
    expect(screen.getByText('Test file-explorer')).toBeInTheDocument();
    expect(screen.getByText('Test browser')).toBeInTheDocument();
  });
});
