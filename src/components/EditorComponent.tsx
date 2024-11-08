import React from 'react';
import Editor from "@monaco-editor/react";

interface EditorComponentProps {
  files: any[];
  activeFile: number;
  handleEditorChange: (value: string | undefined) => void;
}

const EditorComponent: React.FC<EditorComponentProps> = ({ files, activeFile, handleEditorChange }) => {
  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      value={files[activeFile].content}
      onChange={handleEditorChange}
    />
  );
};

export default EditorComponent;
