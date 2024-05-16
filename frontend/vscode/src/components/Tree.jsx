const FileTreNode = ({ fileName, nodes }) => {
    const isDir = !!nodes // herechecking its node or nor for recursive fujction
    return (
        <div style={{ marginLeft: "10px" }}>
            <p className={isDir ? "file-nodes" : ""}>{fileName}</p> 
            {nodes && <ul>
                {Object.keys(nodes).map(child => (
                    <li key={child}>
                        <FileTreNode fileName={child} nodes={nodes[child]} />
                    </li>
                ))}
            </ul>}
        </div>
    )
}

const FileTree = ({ tree }) => {
    return (
        <FileTreNode fileName="/" nodes={tree} />
    )
}



export default FileTree
// first of al it receives a tree prop which represents the entire file tree structure.
// it calls fileTreenode with the root directory and the ree object
//  isDir is a boolean that checks if nodes is truthy. if odes is an object which mean its a directory , so is dire will be truee