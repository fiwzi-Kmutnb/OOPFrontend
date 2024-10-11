"use client"
import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
import axios from "@/utils/axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolder} from "@fortawesome/free-solid-svg-icons";
import {faFile, faFolder as faRFolder} from "@fortawesome/free-regular-svg-icons";
import Accordion from "@/components/Accordion";
import React from "react";
const DicomViewer = dynamic(() => import('@/components/Dcm'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
})

interface pathFileData {
    file: pathFile;
    fileCount: number;
    findFileCount: number;
}

interface pathFile {
    train_images: string[];
    test_images: string[];
}



export default function Home(): JSX.Element {
    const [path, setPath] = useState<pathFileData>({
        file: {
            test_images: [],
            train_images: [],
        },
        fileCount: 0,
        findFileCount: 0,
    });
    const [file, setFile] = useState<pathFile>({
        train_images: [],
        test_images: [],
    });
    const [selectedUrl, setSelectedUrl] = useState<string>('');
    const [url, setUrl] = useState<string>('');

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
    const getDicom = async (path: string) => {
        await axios.get('/file/list?path='+path).then((e) => {
            setFile(e.data)
        }).catch((e) => {
            console.log(e)
        })
    }

    const loadImage = (
        key: string,
        kkey: string,
        e: string,
        ee: string
    ) => {
        setUrl(`wadouri:${process.env.NEXT_PUBLIC_DCM_API_URL}${key}/${kkey}/${e}/${ee}`);
        setSelectedUrl(`${key}/${kkey}/${e}/${ee}`);

    }
    const weelDetect = (weel: number) => {
            const s = selectedUrl.split('/')
            const fileP = s[3].split('.')[0];
            const countF = file[s[0] as keyof pathFile]?.[s[1] as never]?.[s[2] as never]?.length + 1;
            const fileN = weel > 0 ? Math.max(1,(Number(fileP) + 1) % countF) : Math.max(1,(Number(fileP) - 1) % countF);
            setUrl(`wadouri:${process.env.NEXT_PUBLIC_DCM_API_URL}${s[0]}/${s[1]}/${s[2]}/${fileN}.dcm`);
            setSelectedUrl(`${s[0]}/${s[1]}/${s[2]}/${fileN}.dcm`);
    }

    return (
        <div>
            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-3">
                    <div className="bg-white shadow-2xl h-screen flex-col flex pt-2 max-h-screen">
                        <div className="basis-11/12 pb-3 overflow-y-auto">
                            {Object.entries(path.file).map(([key, value]) => {
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
                                                    {
                                                        Object.entries(value).map(([kkey, kvalue]) => {
                                                            return (
                                                                <>
                                                                    <div>
                                                                        <Accordion btnClass={"pathList-sub-1"}
                                                                                   title={() => {
                                                                                       return (
                                                                                           <>

                                                                                               <FontAwesomeIcon
                                                                                                   icon={faRFolder}/> &nbsp;{kkey}
                                                                                           </>
                                                                                       )
                                                                                   }}>
                                                                            <div className="ml-5 my-2">
                                                                                {
                                                                                    (kvalue as string[]).map((e: string) => {
                                                                                        return (
                                                                                            <>
                                                                                                <div>
                                                                                                    <Accordion
                                                                                                        btnClass={"pathList-sub-2"}
                                                                                                        btnAction={() => {
                                                                                                            getDicom(`/${key}/${kkey}/${e}`)
                                                                                                        }}
                                                                                                        title={() => {
                                                                                                            return (
                                                                                                                <>
                                                                                                                    <FontAwesomeIcon
                                                                                                                        icon={faRFolder}/> &nbsp;{e}
                                                                                                                </>
                                                                                                            )
                                                                                                        }}>
                                                                                                        {(file[key as keyof pathFile]?.[kkey as keyof typeof file[keyof pathFile]]?.[e as keyof typeof file[keyof pathFile][keyof typeof file[keyof pathFile]]] as string[])?.sort((a: string, b: string) => {
                                                                                                            // Extract the numeric part from the filenames
                                                                                                            const numA = parseInt(a.split('.')[0], 10);
                                                                                                            const numB = parseInt(b.split('.')[0], 10);

                                                                                                            return numA - numB; // Compare the numbers
                                                                                                        })?.map((ee) => {
                                                                                                            return (
                                                                                                                <>
                                                                                                                    <div className="ml-10">
                                                                                                                        <button onClick={() => loadImage(key,kkey,e,ee)} className={`pathFileBtn ${ selectedUrl == `${key}/${kkey}/${e}/${ee}` ? 'active' : ''  }`}>
                                                                                                                            <FontAwesomeIcon
                                                                                                                                icon={faFile}/> &nbsp; {ee}
                                                                                                                        </button>
                                                                                                                    </div>
                                                                                                                </>
                                                                                                            )
                                                                                                        })}
                                                                                                    </Accordion>
                                                                                                </div>
                                                                                            </>
                                                                                        )
                                                                                    })
                                                                                }
                                                                            </div>
                                                                            <hr className="mb-3"/>
                                                                        </Accordion>

                                                                    </div>
                                                                </>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </Accordion>
                                        </div>
                                )
                            })}
                        </div>

                        <div className="basis-1/12 bg-slate-800">
                            <div className="flex mt-2 justify-center ">
                                <button onClick={() => subpagePath()} className="bg-white p-3 hover:bg-slate-200">«</button>
                                <div className="bg-white underline text-sm border p-3">{start+1}&nbsp;/&nbsp;{ Math.floor(path.fileCount / 100)+1}</div>
                                <button onClick={() => addpagePath()} className="bg-white p-3  hover:bg-slate-200">»</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-9 flex h-screen justify-center items-center" onWheel={(e) => weelDetect(e.deltaY)}>
                    {url.length > 0 && (
                        <DicomViewer imageId={url}/>
                    )}
                </div>
            </div>
        </div>
    )
}