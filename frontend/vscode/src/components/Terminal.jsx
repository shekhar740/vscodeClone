import { useEffect, useRef } from "react";
import { Terminal as XTerminal } from 'xterm';
import 'xterm/css/xterm.css';
import socket from "../Socket.js";

const Terminal = ({fileName}) => {
  const terminalRef = useRef(null);
  const isRendered = useRef(false);

  useEffect(() => {
    if (isRendered.current) return;
    isRendered.current = true;

    const term = new XTerminal({
      rows: 20,
    });

    if (terminalRef.current) {
      term.open(terminalRef.current);
    }

    term.onData(data => {
      socket.emit("terminal:write", data);
    });

    const handleTerminalData = data => {
      term.write(data);
    };

    socket.on("terminal:data", handleTerminalData);

    return () => {
      term.dispose(); // Dispose of the terminal instance
      socket.off("terminal:data", handleTerminalData); // Remove the event listener
    };
  }, []);

  return (
    <div ref={terminalRef} id="terminal" style={{ width: '100%', height: '100%' }}>
        
    </div>
  );
};

export default Terminal;