import * as React from 'react';
import { useEffect, useState } from 'react';
import Terminal from './components/Terminal';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import socket from './Socket';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

function FileTree({ tree, onFileClick }) {
  const convertToPrimeTreeData = (nodes, currentPath = '') => {
    return Object.entries(nodes).map(([name, children]) => {
      const nodePath = currentPath ? `${currentPath}/${name}` : name;
      return {
        value: name,
        label: name,
        path: nodePath,
        children: children ? convertToPrimeTreeData(children, nodePath) : [],
      };
    });
  };

  const primeTreeData = convertToPrimeTreeData(tree);
  const handleFileClick = (event, path) => {
    event.preventDefault();
    onFileClick(path);
  };

  return (
    <Box sx={{ height: 220, flexGrow: 1, maxWidth: 400 }}>
      <SimpleTreeView>
        {primeTreeData.map((node, index) => (
          <TreeItem
            key={index}
            itemId={node.value}
            label={node.label}
            onClick={(event) => handleFileClick(event, node.path)}
          >
            {node.children.map((child, childIndex) => (
              <TreeItem
                key={`${index}-${childIndex}`}
                itemId={child.value}
                label={child.label}
                onClick={(event) => handleFileClick(event, child.path)}
              >
                {child.children.map((grandchild, grandchildIndex) => (
                  <TreeItem
                    key={`${index}-${childIndex}-${grandchildIndex}`}
                    itemId={grandchild.value}
                    label={grandchild.label}
                    onClick={(event) => handleFileClick(event, grandchild.path)}
                  />
                ))}
              </TreeItem>
            ))}
          </TreeItem>
        ))}
      </SimpleTreeView>
    </Box>
  );
}

function App() {
  const [code, setCode] = useState("");
  const [filetree, setFileTree] = useState({});
  const [selectedFilePath, setSelectedFilePath] = useState('');

  const getFiletree = async () => {
    const response = await fetch("http://localhost:9000/files");
    const result = await response.json();
    setFileTree(result.tree);
  };

  useEffect(() => {
    getFiletree();
  }, []);

  useEffect(() => {
    socket.on("file:refresh", getFiletree);
    return () => socket.off("file:refresh", getFiletree);
  }, []);

  const handleFileClick = (path) => {
    setSelectedFilePath(path);
  };

  useEffect(() => {
    if (code) {
      const timer = setTimeout(() => {
        console.log("saved succesfully")
        socket.emit("file:change", {
          path: selectedFilePath,
          content: code,
        })
      }, 5 * 1000);
      return () => {
        clearTimeout(timer)
      }
    }

  }, [code])

  const getFileContents = async () =>{
    if(!selectedFilePath.includes('/')) return;
    const response = await fetch(`http://localhost:9000/files/content/?path=${selectedFilePath}`);
    const result = await response.json();
    setCode(result.content)
  }

  useEffect(() => {
    if (selectedFilePath) getFileContents();
  }, [selectedFilePath]);

  return (
    <div className='play-ground'>
      <div className='editor-container'>
        <div className='files'>
          <FileTree tree={filetree} onFileClick={handleFileClick} />
        </div>
        <div className='editor'>
          <p>{selectedFilePath ? selectedFilePath.replaceAll("/", " > ") : "please select file"}</p>
          <AceEditor
          value={code}
            mode="javascript"
            theme="monokai"
            onChange={e => setCode(e)}
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
          />
        </div>
      </div>
      <div className='terminal-container'>
        <Terminal fileName={selectedFilePath} />
      </div>
    </div>
  );
}

export default App;
