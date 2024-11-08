import React, { useRef, useEffect } from 'react';

interface TerminalComponentProps {
  terminalContent: string;
}

const TerminalComponent: React.FC<TerminalComponentProps> = ({
  terminalContent,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalContent]);

  return (
    <div
      ref={terminalRef}
      className="h-1/4 bg-black text-green-500 p-2 font-mono text-sm overflow-auto mt-4"
    >
      {terminalContent}
    </div>
  );
};

export default TerminalComponent;
