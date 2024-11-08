export const handleKeyboardShortcuts = (
  event: KeyboardEvent,
  handleSend: () => void,
  toggleListening: () => void,
  newLine: () => void
) => {
  // Enter to send message (without Shift)
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
    event.preventDefault();
    handleSend();
  }

  // Shift + Enter for new line
  if (event.key === 'Enter' && event.shiftKey) {
    event.preventDefault();
    newLine();
  }

  // Ctrl/Cmd + M to toggle microphone
  if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
    event.preventDefault();
    toggleListening();
  }
};