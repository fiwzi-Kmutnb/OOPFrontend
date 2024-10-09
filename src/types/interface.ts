interface SubDirectory {
    subdir: Record<string, SubDirectory>;
    internal: string[];
  }
  
  interface FileStructure {
    file: SubDirectory;
    fileCount: number;
    findFileCount: number;
}

interface listPath {
    [key: string]: string[];
}