"use client"
import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
import axios from "@/utils/axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolder} from "@fortawesome/free-solid-svg-icons";
import {faFile} from "@fortawesome/free-regular-svg-icons";
import Accordion from "@/components/Accordion";
import React from "react";
import { parse } from 'csv-parse'; 
import CsvGraph from "@/components/CsvGraph";
const DicomViewer = dynamic(() => import('@/components/Dcm'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
})

const CsvViewer = dynamic(() => import('@/components/CsvGraph'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
})
export default function Home(): JSX.Element {
    const [path, setPath] = useState<FileStructure>(
        {
            file: {
                subdir: {
                    "loading...": {
                        subdir: {},
                        internal: []
                    }
                },
                internal: []
            },
            fileCount: 0,
            findFileCount: 0
        }
    );
    const [file, setFile] = useState<listPath>({});
    const [selectedUrl, setSelectedUrl] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [typeShow, setTypeShow] = useState<string>('dcm');

    const [start, setStart] = useState(0);
    const addpagePath = () => {
        if(Math.floor(path.fileCount / 100) > start) {
            setStart(start + 1)
            getPath(start + 1)
        }
    }
    const subpagePath = () => {
        if(start > 0) {
            setStart(start - 1)
            getPath(start - 1)
        }
    }

    useEffect(() => {
        Promise.all([getPath()])
    }, []);

    const getPath = async (start: number = 0) => {
        await axios.get('/path/list?start='+(start)).then((e) => {
            setPath(e.data.data)
        }).catch((e) => {
            console.log(e)
        })
    }

    const recursiveGetKeys = (obj: any, prefix: string[] = []): string[][] => {
        let keys: string[][] = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newPrefix = [...prefix, key];
                if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                    keys = keys.concat(recursiveGetKeys(obj[key], newPrefix));
                } else {
                    keys.push(newPrefix);
                }
            }
        }
        return keys;
    };

    const getDicom = async (path: string) => {
        await axios.get('/file/list?path='+path).then((e) => {
            const keys = recursiveGetKeys(e.data);
            const inherit = JSON.parse(JSON.stringify(e.data));
            const inheritFile: listPath = JSON.parse(JSON.stringify(file));
            if (Object.keys(e.data).length > 0) {
                keys.forEach((keyPath) => {
                    let tempInherit = inherit;
                    let tempInheritFile = inheritFile;
                    let value = e.data;
                    for (let i = 0; i < keyPath.length; i++) {
                        const key = keyPath[i];

                        if (i === keyPath.length - 1) {
                            tempInheritFile[key] = value[key];
                        } else {
                            if (tempInheritFile[key] === undefined) {
                                tempInheritFile[key] = {} as never;
                            }
                            if (tempInherit[key] === undefined) {
                                tempInherit[key] = {} as never;
                            }
                            tempInherit = tempInherit[key] as never;
                            tempInheritFile = tempInheritFile[key] as never;
                            value = value[key];
                        }
                    }
                });
                setFile(inheritFile);
            }
        }).catch((e) => {
            console.log(e)
        })
    }

    const loadImage = (
        path: string
    ) => {
        if(path.endsWith('.dcm')){
            setUrl(`wadouri:${process.env.NEXT_PUBLIC_DCM_API_URL}${path.substring(1)}`);
            setSelectedUrl(path);
            setTypeShow('dcm');
        }
    }
    const [csvData, setCsvData] = useState<string>("");
    const getCsv = async (path: string) => {
        if(!path.endsWith('.csv'))
            return;
        await axios.get('/csv?filename='+path).then((e) => {
            setTypeShow('csv');
            setSelectedUrl(path);
            setCsvData(e.data);
        }).catch((e) => {
            console.log(e)
        })
    }
    const weelDetect = (weel: number) => {
            const s = selectedUrl.split('/').slice(1)
            const fileP = s[3].split('.')[0];
            const countF = file[s[0] as keyof listPath]?.[s[1] as never]?.[s[2] as never]?.length + 1;
            const fileN = weel > 0 ? Math.max(1,(Number(fileP) + 1) % countF) : Math.max(1,(Number(fileP) - 1) % countF);
            setUrl(`wadouri:${process.env.NEXT_PUBLIC_DCM_API_URL}${s[0]}/${s[1]}/${s[2]}/${fileN}.dcm`);
            setSelectedUrl(`/${s[0]}/${s[1]}/${s[2]}/${fileN}.dcm`);
    }

    const componantFile = (key:string,path:string) => {
    return (
        <div key={key}>
            <div className="ml-5">
                <button
                    onClick={() => loadImage(path)}
                    className={`pathFileBtn ${ selectedUrl == `${path}` ? 'active' : ''  }`}>
                    <FontAwesomeIcon
                        icon={faFile}/> &nbsp; {key}
                </button>
            </div>
        </div>
    )
    }

    const inheritVairableFile = (path: string) => {
        if (Object.keys(file).length === 0)
            return;
        const keys = path.split('/').slice(1);
        let fileTempDeepCopy = JSON.parse(JSON.stringify(file));
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (i === keys.length - 1) {
                fileTempDeepCopy = fileTempDeepCopy[key];
            } else {
                if (fileTempDeepCopy[key] === undefined) {
                     fileTempDeepCopy[key] = {} as never;
                }
                fileTempDeepCopy = fileTempDeepCopy[key] as never;
              }
       }
       if(typeof fileTempDeepCopy?.internal != 'undefined') {
              return (
                <>
                     {fileTempDeepCopy?.internal?.sort((a: string, b: string) => {
                         const numA = parseInt(a.split('.')[0], 10);
                         const numB = parseInt(b.split('.')[0], 10);
                         return numA - numB;
                     })?.map((ikey: string) => {
                          return componantFile(ikey,path + '/' + ikey)
                     })}
                </>
              )
       } else {
           if(!Array.isArray(fileTempDeepCopy))
            return ;
          return (
              <>
                  {fileTempDeepCopy?.sort((a: string, b: string) => {
                      const numA = parseInt(a.split('.')[0], 10);
                      const numB = parseInt(b.split('.')[0], 10);

                      return numA - numB;
                  })?.map((ikey: string) => {
                      return componantFile(ikey,path + '/' + ikey)
                  })}
              </>
          )
       }
    }

    const recusiveFileTree = (node: SubDirectory,key:string,path:string) => {
        return (
            <div className="ml-5 my-2">
                {node?.internal.map((ikey) => {
                    return (
                        <div key={ikey}>
                            <Accordion
                                btnClass={"pathList"} title={() => {
                                return (
                                    <>
                                        <FontAwesomeIcon icon={faFolder}/> &nbsp;{ikey}
                                    </>
                                )
                            }}>
                                <div className="ml-5 my-2">
                                    {inheritVairableFile(`${path}/${ikey}`)}
                                </div>
                            </Accordion>
                        </div>
                    )
                })}

                {Object.entries(node?.subdir || {}).map(([ikey, ivalue]) => {
                    return (
                        <div key={ikey}>
                            <Accordion
                                btnAction={() => getDicom(`${path}/${ikey}`)}
                                btnClass={"pathList"} title={() => {
                                return (
                                    <>
                                        <FontAwesomeIcon icon={faFolder}/> &nbsp;{ikey}
                                    </>
                                )
                            }}>
                                <div className="ml-5 my-2">
                                    {inheritVairableFile(`${path}/${ikey}`)}
                                    {recusiveFileTree(ivalue, ikey, `${path}/${ikey}`)}
                                </div>
                            </Accordion>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <>
            <div>
                <div className="grid grid-cols-12">
                    <div className="col-span-3">
                        <div className="bg-white shadow-2xl h-screen flex-col flex pt-2 max-h-screen">
                            <div className="basis-11/12 pb-3 overflow-y-auto">
                                {Object.entries(path.file.subdir).map(([key, value]) => {
                                    return (
                                        <div key={key}>
                                            <Accordion btnClass={"pathList"} title={() => {
                                                return (
                                                    <>
                                                        <FontAwesomeIcon icon={faFolder}/> &nbsp;{key}
                                                    </>
                                                )
                                            }}>
                                                <div className="ml-5 my-2">
                                                    {recusiveFileTree(value,key,`/${key}`)}
                                                </div>
                                            </Accordion>
                                        </div>
                                    )
                                })}
                                <div className="mt-3">
                                    {Object.entries(path.file.internal).map(([, value]) => {
                                        return (
                                            <>
                                                <div key={value}>
                                                    <div className="ml-5">
                                                        <button
                                                            onClick={() => getCsv(value)}
                                                            className={`pathFileBtn ${ selectedUrl == `${value}` ? 'active' : ''  }`}>
                                                            <FontAwesomeIcon
                                                                icon={faFile}/> &nbsp; {value}
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    })}
                                </div>

                            </div>

                            <div className="basis-1/12 bg-slate-800">
                                <div className="flex mt-2 justify-center ">
                                    <button onClick={() => subpagePath()}
                                            className="bg-white p-3 hover:bg-slate-200">«
                                    </button>
                                    <div
                                        className="bg-white underline text-sm border p-3">{start + 1}&nbsp;/&nbsp;{Math.floor(path.fileCount / 100) + 1}</div>
                                    <button onClick={() => addpagePath()}
                                            className="bg-white p-3  hover:bg-slate-200">»
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-9">
                        {typeShow == 'dcm' && url.length > 0 && (
                        <div onWheel={(e) => weelDetect(e.deltaY)} className="flex h-screen justify-center items-center">
                            <DicomViewer imageId={url}/>
                        </div>
                    )}
                        {typeShow == 'csv' && csvData.length > 0 && (
                            <CsvGraph data={csvData}/>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}