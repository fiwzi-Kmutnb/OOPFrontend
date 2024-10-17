"use client"
import Image from "next/image";
import { FaBars, FaPlus } from "react-icons/fa";
import { LuCompass } from "react-icons/lu";
import { MdOutlineTableChart,
    MdCode,
    MdExpandMore,
    MdOutlineComment,
    MdOutlineEmojiEvents,
    MdOutlineSchool,} from "react-icons/md";
    import { AiOutlineNodeIndex } from "react-icons/ai";
    import { HiOutlinePencilAlt } from "react-icons/hi";
import { HiDotsHorizontal } from "react-icons/hi";
import { IoMdLink } from "react-icons/io";
import React, {useEffect, useState} from "react";
import { FaTerminal } from "react-icons/fa";
import { FaRegCopy } from "react-icons/fa6";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaDownload } from "react-icons/fa";
import { CiFileOn } from "react-icons/ci";
import { CiFolderOn } from "react-icons/ci";
import { CiViewColumn } from "react-icons/ci";
import { FaKey } from "react-icons/fa";
import { FaHashtag } from "react-icons/fa";
import { AiOutlineFontColors } from "react-icons/ai";

import dynamic from "next/dynamic";
import axios from "@/utils/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-regular-svg-icons";
import Accordion from "@/components/Accordion";
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


export default function Page() {
    const [page,setPage] = useState<string>("Data");
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
        if (Math.floor(path.fileCount / 100) > start) {
            setStart(start + 1)
            getPath(start + 1)
        }
    }
    const subpagePath = () => {
        if (start > 0) {
            setStart(start - 1)
            getPath(start - 1)
        }
    }

    useEffect(() => {
        Promise.all([getPath()])
    }, []);

    const getPath = async (start: number = 0) => {
        await axios.get('/path/list?start=' + (start)).then((e) => {
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
        await axios.get('/file/list?path=' + path).then((e) => {
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
        if (path.endsWith('.dcm')) {
            setUrl(`wadouri:${process.env.NEXT_PUBLIC_DCM_API_URL}${path.substring(1)}`);
            setSelectedUrl(path);
            setTypeShow('dcm');
        }
    }
    const [csvData, setCsvData] = useState<string>("");
    const getCsv = async (path: string) => {
        if (!path.endsWith('.csv'))
            return;
        await axios.get('/csv?filename=' + path).then((e) => {
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
        const fileN = weel > 0 ? Math.max(1, (Number(fileP) + 1) % countF) : Math.max(1, (Number(fileP) - 1) % countF);
        setUrl(`wadouri:${process.env.NEXT_PUBLIC_DCM_API_URL}${s[0]}/${s[1]}/${s[2]}/${fileN}.dcm`);
        setSelectedUrl(`/${s[0]}/${s[1]}/${s[2]}/${fileN}.dcm`);
    }

    const componantFile = (key: string, path: string) => {
        return (
            <div key={key}>
                <div className="ml-5">
                    <button
                        onClick={() => loadImage(path)}
                        className={`pathFileBtn ${selectedUrl == `${path}` ? 'active' : ''}`}>
                        <FontAwesomeIcon
                            icon={faFile} /> &nbsp; {key}
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
        if (typeof fileTempDeepCopy?.internal != 'undefined') {
            return (
                <>
                    {fileTempDeepCopy?.internal?.sort((a: string, b: string) => {
                        const numA = parseInt(a.split('.')[0], 10);
                        const numB = parseInt(b.split('.')[0], 10);
                        return numA - numB;
                    })?.map((ikey: string) => {
                        return componantFile(ikey, path + '/' + ikey)
                    })}
                </>
            )
        } else {
            if (!Array.isArray(fileTempDeepCopy))
                return;
            return (
                <>
                    {fileTempDeepCopy?.sort((a: string, b: string) => {
                        const numA = parseInt(a.split('.')[0], 10);
                        const numB = parseInt(b.split('.')[0], 10);

                        return numA - numB;
                    })?.map((ikey: string) => {
                        return componantFile(ikey, path + '/' + ikey)
                    })}
                </>
            )
        }
    }

    const recusiveFileTree = (node: SubDirectory, key: string, path: string) => {
        return (
            <div className="ml-5 my-2">
                {node?.internal.map((ikey) => {
                    return (
                        <div key={ikey}>
                            <Accordion
                                btnClass={"pathList"} title={() => {
                                return (
                                    <>
                                        <FontAwesomeIcon icon={faFolder} /> &nbsp;{ikey}
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
                                        <FontAwesomeIcon icon={faFolder} /> &nbsp;{ikey}
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
        <div className="flex">
            <div className="fixed w-[320px] bg-white shadow-xl h-screen">
                <div className="flex gap-3 p-3">
                    <button className="p-4 hover:bg-slate-100 hover:rounded-full">
                        <FaBars className="text-xl" />
                    </button>
                    <div className=" self-center">
                        <Image src="/assets/logo/logo.svg" alt="logo" width={80} height={80} />
                    </div>
                </div>
                <div className="px-2">
                    <button className="shadow py-3 px-5 rounded-full hover:shadow-xl flex gap-3">
                        <FaPlus className="text-xl" color="#20beff" />
                        <div>
                            Create
                        </div>
                    </button>
                </div>
                <div className="mt-8 text-[#5f6368]">
                    <button className="flex gap-6 w-full hover:bg-slate-200 py-2 transition-all">
                        <LuCompass className="text-2xl ml-8 font-bold" />
                        <div className="text-lg">
                        Home
                        </div>
                    </button>
                    <button className="flex gap-6 w-full bg-slate-200 py-2 transition-all border-black border-r-4">
                        <MdOutlineEmojiEvents className="text-2xl ml-8 font-bold" />
                        <div className="text-lg">
                        Competitions
                        </div>
                    </button>
                    <button className="flex gap-6 w-full hover:bg-slate-200 py-2 transition-all">
                        <MdOutlineTableChart className="text-2xl ml-8 font-bold" />
                        <div className="text-lg">
                        Datasets
                        </div>
                    </button>

                    <button className="flex gap-6 w-full hover:bg-slate-200 py-2 transition-all">
                        <AiOutlineNodeIndex className="text-2xl ml-8 font-bold" />
                        <div className="text-lg">
                        Models
                        </div>
                    </button>

                    <button className="flex gap-6 w-full hover:bg-slate-200 py-2 transition-all">
                        <MdCode className="text-2xl ml-8 font-bold" />
                        <div className="text-lg">
                        Code
                        </div>
                    </button>

                    <button className="flex gap-6 w-full hover:bg-slate-200 py-2 transition-all">
                        <MdOutlineComment className="text-2xl ml-8 font-bold" />
                        <div className="text-lg">
                        Discussions
                        </div>
                    </button>
                    <button className="flex gap-6 w-full hover:bg-slate-200 py-2 transition-all">
                        <MdOutlineSchool className="text-2xl ml-8 font-bold" />
                        <div className="text-lg">
                        Lerns
                        </div>
                    </button>
                    <button className="flex gap-6 w-full hover:bg-slate-200 py-2 transition-all">
                        <MdExpandMore className="text-2xl ml-8 font-bold" />
                        <div className="text-lg">
                        More
                        </div>
                    </button>

                    <div className="mt-3 px-4">
                    <hr />
                    </div>

                    <button className="flex gap-6 w-full hover:bg-slate-200 py-2 transition-all mt-2">
                        <HiOutlinePencilAlt className="text-2xl ml-8 font-bold" />
                        <div className="text-lg">
                        Your Work
                        </div>
                    </button>
                </div>
            </div>
            <div className="ml-[320px] px-10 w-full">
                <div className="">
                    <div className="mt-5 sticky">
                        <label className="input input-bordered rounded-full flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="h-4 w-4 opacity-70">
                                <path
                                    fill-rule="evenodd"
                                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                    clip-rule="evenodd"/>
                            </svg>
                            <input type="text" className="grow" placeholder="Search"/>
                        </label>
                    </div>
                    <div className="mt-10 flex justify-between">
                        <div className="self-center">
                            <div className="text-sm ">
                                Radiological Society of North America · Featured Code Competition · 8 days ago
                            </div>
                        </div>
                        <div>
                            <button className="btn bg-black text-white rounded-full">Late Submission</button>
                            <button className=" ml-3 rounded-full">
                                <HiDotsHorizontal className="text-xl"/>
                            </button>
                        </div>
                    </div>
                    <div className="flex mt-10 justify-between w-full">
                        <div>
                            <div className="text-3xl font-bold">
                                RSNA 2024 Lumbar Spine Degenerative Classification
                            </div>
                            <div className="text-md">
                                Classify lumbar spine degenerative conditions
                            </div>
                        </div>
                        <div className="">
                            <img src="https://www.kaggle.com/competitions/71549/images/header"
                                 className="w-6/12 ml-auto" alt="contest"/>
                        </div>
                    </div>
                    <div className="mt-5 flex gap-5 text-[#5f6368]">
                        <button onClick={() => setPage("Overview")} className={`text-md py-3 ${page == 'Overview' ? "border-black border-b-2" : ""}`}>
                            Overview
                        </button>
                        <button onClick={() => setPage("Data")} className={`text-md py-3 ${page == 'Data' ? "border-black border-b-2" : ""}`}>
                            Data
                        </button>
                        <button className="text-md py-3">
                            Code
                        </button>
                        <button className="text-md py-3">
                            Models
                        </button>
                        <button className="text-md py-3">
                            Discussion
                        </button>
                        <button className="text-md py-3">
                            Leaderboard
                        </button>
                        <button className="text-md py-3">
                            Rules
                        </button>
                        <button className="text-md py-3">
                            Team
                        </button>
                        <button className="text-md py-3">
                            Submissions
                        </button>
                    </div>
                    <hr/>
                    {page == "Overview" && (
                        <div className="grid grid-cols-12 gap-10 mt-10">
                            <div className="col-span-8">
                                <div>
                                    <div className="text-3xl font-bold">
                                        Overview
                                    </div>
                                    <div className="mt-4">
                                        The goal of this competition is to create models that can be used to aid in the
                                        detection and classification of degenerative spine conditions using lumbar spine
                                        MR images. Competitors will develop models that simulate a radiologist's
                                        performance in diagnosing spine conditions.
                                    </div>
                                </div>
                                <div className="mt-10">
                                    <div className="relative w-full  mx-auto h-12">
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300"></div>
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2">
                                            <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                                            <div
                                                className="absolute left-1/2 -translate-x-1/2 mt-2 text-[10px] text-center">
                                                <div className="text-gray-600">Start</div>
                                                <div className="text-gray-400">May 17, 2024</div>
                                            </div>
                                        </div>

                                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                            <div
                                                className="absolute right-1/2 translate-x-1/2 mt-2 text-[10px] text-center">
                                                <div className="text-gray-600">Close</div>
                                                <div className="text-gray-400">Oct 9, 2024</div>
                                            </div>
                                        </div>

                                        <div className="absolute right-0 top-full mt-0.5 text-[10px] text-green-500">
                                            Merger & Entry
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-28">
                                    <div className="collapse collapse-arrow rounded-[0] border-t-2">
                                        <input type="radio" name="my-accordion-2" defaultChecked/>
                                        <div className="collapse-title text-xl font-medium">Description</div>
                                        <div className="collapse-title text-xl text-right font-medium">
                                            <IoMdLink className="text-xl ml-auto mt-1"/>
                                        </div>
                                        <div className="collapse-content">
                                            <p className="mt-3">Low back pain is the leading cause of disability
                                                worldwide,
                                                according to the World Health Organization, affecting 619 million people
                                                in
                                                2020. Most people experience low back pain at some point in their lives,
                                                with the frequency increasing with age. Pain and restricted mobility are
                                                often symptoms of spondylosis, a set of degenerative spine conditions
                                                including degeneration of intervertebral discs and subsequent narrowing
                                                of
                                                the spinal canal (spinal stenosis), subarticular recesses, or neural
                                                foramen
                                                with associated compression or irritations of the nerves in the low
                                                back.</p>
                                            <p className="mt-3">Magnetic resonance imaging (MRI) provides a detailed
                                                view of
                                                the lumbar spine vertebra, discs and nerves, enabling radiologists to
                                                assess
                                                the presence and severity of these conditions. Proper diagnosis and
                                                grading
                                                of these conditions help guide treatment and potential surgery to help
                                                alleviate back pain and improve overall health and quality of life for
                                                patients.</p>
                                            <p className="mt-3">RSNA has teamed with the American Society of
                                                Neuroradiology
                                                (ASNR) to conduct this competition exploring whether artificial
                                                intelligence
                                                can be used to aid in the detection and classification of degenerative
                                                spine
                                                conditions using lumbar spine MR images.</p>
                                            <p className="mt-3">The challenge will focus on the classification of five
                                                lumbar spine degenerative conditions: Left Neural Foraminal Narrowing,
                                                Right
                                                Neural Foraminal Narrowing, Left Subarticular Stenosis, Right
                                                Subarticular
                                                Stenosis, and Spinal Canal Stenosis. For each imaging study in the
                                                dataset,
                                                we’ve provided severity scores (Normal/Mild, Moderate, or Severe) for
                                                each
                                                of the five conditions across the intervertebral disc levels L1/L2,
                                                L2/L3,
                                                L3/L4, L4/L5, and L5/S1.</p>
                                            <p className="mt-3">To create the ground truth dataset, the RSNA challenge
                                                planning task force collected imaging data sourced from eight sites on
                                                five
                                                continents. This multi-institutional, expertly curated dataset promises
                                                to
                                                improve standardized classification of degenerative lumbar spine
                                                conditions
                                                and enable development of tools to automate accurate and rapid disease
                                                classification.</p>
                                            <p className="mt-3">Challenge winners will be recognized at an event during
                                                the
                                                RSNA 2024 annual meeting. For more information on the challenge, contact
                                                RSNA Informatics staff at informatics@rsna.org.</p>
                                        </div>
                                    </div>
                                    <div className="collapse collapse-arrow rounded-[0] border-t-2">
                                        <input type="radio" name="my-accordion-2" defaultChecked/>
                                        <div className="collapse-title text-xl font-medium">Evaluation</div>
                                        <div className="collapse-title text-xl text-right font-medium">
                                            <IoMdLink className="text-xl ml-auto mt-1"/>
                                        </div>
                                        <div className="collapse-content">
                                            <p>
                                                Submissions are evaluated using the average of sample weighted log
                                                losses and an any_severe_spinal prediction generated by the metric. The
                                                metric notebook can be found here.
                                            </p>
                                            <p className="mt-3">The sample weights are as follows:</p>
                                            <ul className="">
                                                <li>1 for normal/mild.</li>
                                                <li>2 for moderate.</li>
                                                <li>4 for severe.</li>
                                            </ul>
                                            <p className="mt-3">
                                                For each row ID in the test set, you must predict a probability for each
                                                of the different severity levels. The file should contain a header and
                                                have the following format:
                                            </p>
                                            <div className="bg-slate-200 rounded p-3 mt-3">
                                                <code>
                                                    row_id,normal_mild,moderate,severe
                                                    123456_left_neural_foraminal_narrowing_l1_l2,0.333,0.333,0.333
                                                    123456_left_neural_foraminal_narrowing_l2_l3,0.333,0.333,0.333
                                                    123456_left_neural_foraminal_narrowing_l3_l4,0.333,0.333,0.333
                                                    etc.
                                                </code>
                                            </div>
                                            <p className="mt-3">In rare cases the lowest vertebrae aren't visible in the
                                                imagery. You still need to make predictions (nulls will cause errors),
                                                but those rows will not be scored.</p>
                                            <p className="mt-3">For this competition, the any_severe_scalar has been set
                                                to 1.0.</p>
                                        </div>
                                    </div>
                                    <div className="collapse collapse-arrow rounded-[0] border-t-2">
                                        <input type="radio" name="my-accordion-2" defaultChecked/>
                                        <div className="collapse-title text-xl font-medium">Timeline</div>
                                        <div className="collapse-title text-xl text-right font-medium">
                                            <IoMdLink className="text-xl ml-auto mt-1"/>
                                        </div>
                                        <div className="collapse-content">
                                            <ul>
                                                <li className="mt-3"><span className="font-bold">May 16, 2024</span> -
                                                    Start Date.
                                                </li>
                                                <li className="mt-3"><span
                                                    className="font-bold">October 1, 2024</span> - Entry Deadline. You
                                                    must accept the competition rules before this date in order to
                                                    compete.
                                                </li>
                                                <li className="mt-3"><span
                                                    className="font-bold">October 1, 2024 </span> - Team Merger
                                                    Deadline. This is the last day participants may join or merge teams.
                                                </li>
                                                <li className="mt-3"><span
                                                    className="font-bold">October 8, 2024</span> - Final Submission
                                                    Deadline.
                                                </li>
                                                <li className="mt-3"><span
                                                    className="font-bold">October 28, 2024</span> - Winners’
                                                    Requirements Deadline. This is the deadline for winners to submit to
                                                    the host/Kaggle their training code, video, method description.
                                                </li>
                                            </ul>
                                            <p className="mt-3">All deadlines are at 11:59 PM UTC on the corresponding
                                                day unless otherwise noted. The competition organizers reserve the right
                                                to update the contest timeline if they deem it necessary.</p>
                                        </div>
                                    </div>
                                    <div className="collapse collapse-arrow rounded-[0] border-t-2">
                                        <input type="radio" name="my-accordion-2" defaultChecked/>
                                        <div className="collapse-title text-xl font-medium">Code Requirements</div>
                                        <div className="collapse-title text-xl text-right font-medium">
                                            <IoMdLink className="text-xl ml-auto mt-1"/>
                                        </div>
                                        <div className="collapse-content">
                                            <p className="text-xl font-bold">This is a Code Competition</p>
                                            <div className="flex justify-between gap-10">
                                                <div>
                                                    Submissions to this competition must be made through Notebooks. In
                                                    order
                                                    for the "Submit" button to be active after a commit, the following
                                                    conditions must be met:
                                                </div>
                                                <div>
                                                    <img
                                                        src="https://storage.googleapis.com/kaggle-media/competitions/general/Kerneler-white-desc2_transparent.png"/>
                                                </div>
                                            </div>
                                            <ul>
                                                <li className="mt-3">
                                                    <span>CPU Notebook {"<="} 9 hours run-time</span>
                                                </li>
                                                <li className="mt-3">
                                                    GPU Notebook {"<="} 9 hours run-time
                                                </li>
                                                <li className="mt-3">Internet access disabled</li>
                                                <li className="mt-3">Freely & publicly available external data is
                                                    allowed, including
                                                    pre-trained models
                                                </li>
                                                <li className="mt-3">Submission file must be named submission.csv</li>
                                                <li className="mt-3">Submission runtimes have been slightly obfuscated.
                                                    If you repeat the
                                                    exact same submission you will see up to 15 minutes of variance in
                                                    the
                                                    time before you receive your score.
                                                </li>
                                            </ul>
                                            <p className="mt-3">Please see the Code Competition FAQ for more information
                                                on
                                                how to submit. And review the code debugging doc if you are encountering
                                                submission errors.</p>

                                        </div>
                                    </div>
                                    <div className="collapse collapse-arrow rounded-[0] border-t-2">
                                        <input type="radio" name="my-accordion-2" defaultChecked/>
                                        <div className="collapse-title text-xl font-medium">Acknowledgements</div>
                                        <div className="collapse-title text-xl text-right font-medium">
                                            <IoMdLink className="text-xl ml-auto mt-1"/>
                                        </div>
                                        <div className="collapse-content">
                                            <div className="sc-ezTrPE cWBTpb"><p><strong>Challenge Organizing
                                                Team</strong><br/>
                                                - Tyler Richards, MD - University of Utah<br/>
                                                - Jason Talbott, MD, PhD - University of California San Francisco<br/>
                                                - Adam Flanders, MD - Thomas Jefferson University<br/>
                                                - Robyn Ball, PhD - The Jackson Laboratory<br/>
                                                - Errol Colak, MD - Unity Health Toronto<br/>
                                                - Felipe C. Kitamura, MD, PhD - Universidade Federal de São Paulo<br/>
                                                - Luciano M. Prevedello, MD, MPH - Ohio State University<br/>
                                                - John Mongan, MD, PhD - University of California San Francisco</p>
                                                <p><strong>Data Contributors</strong><br/>
                                                    Thanks to the following institutions, which contributed
                                                    de-identified MR
                                                    images that were assembled to create the challenge dataset:</p>
                                                <ul>
                                                    <li>Chiang Mai University, Thailand</li>
                                                    <li>Dasa, Brazil</li>
                                                    <li>Gold Coast University Hospital, Southport, Queensland, Australia
                                                    </li>
                                                    <li>Koç University, Istanbul, Turkey</li>
                                                    <li>University of Sarajevo, Bosnia and Herzegovina</li>
                                                    <li>Thomas Jefferson University Hospital, Philadelphia, PA, USA</li>
                                                    <li>Universidade Federal de São Paulo, Brazil</li>
                                                    <li>University of California San Francisco, USA</li>
                                                    <li>University of Utah, Salt Lake City, Utah, USA<br/>
                                                        <br/><br/>Additional thanks to the following contributing sites:
                                                    </li>
                                                    <li>Queen's University at Kingston, Ontario, Canada</li>
                                                    <li>Tallaght University Hospital, Dublin, Ireland</li>
                                                    <li>University Hospitals Cleveland Medical Center, Cleveland, OH,
                                                        USA<br/>
                                                        <img alt=""
                                                             src="https://www.googleapis.com/download/storage/v1/b/kaggle-user-content/o/inbox%2F1918503%2F089b78683230be27122eb20fe3e571f8%2Flumbar_spine_contrib_map.png?generation=1715984933919064&amp;alt=media"/>
                                                    </li>
                                                </ul>
                                                <p><strong>Data Curators</strong></p>
                                                <ul>
                                                    <li>Maryam Vazirabad – RSNA</li>
                                                    <li>Hui-Ming Lin, HBSc – Unity Health Toronto</li>
                                                </ul>
                                                <p><strong>Data Annotators</strong></p>
                                                <p>The challenge organizers wish to thank the American Society of
                                                    Neuroradiology for helping to members to label the dataset used in
                                                    the
                                                    challenge. ASNR is the world’s leading organization for the future
                                                    of
                                                    neuroradiology representing more than 5,300 radiologists,
                                                    researchers,
                                                    interventionalists, and imaging scientists.</p>
                                                <p><a rel="noreferrer nofollow" href="https://www.asnr.org"><img
                                                    src="https://storage.googleapis.com/kaggle-media/competitions/RSNA-2022/ASNR%20logo.png"
                                                    alt=""/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a></p>
                                                <p>More than 50 volunteers dedicated their time to label exams for the
                                                    challenge dataset.</p>
                                                <p>Arsany Hakim, MD - Bern University Hospital, Inselspital<br/>
                                                    Lai Peng Chan, FRCR, MBBS - Singapore General Hospital <br/>
                                                    Vinson Louis Uytana, MD - Cedars-Sinai Medical Center<br/>
                                                    Anthony Kam, MD, PhD - Loyola University Medical Center<br/>
                                                    Venkata Naga Srinivas Dola, DM, FRCR - Children’s National Hospital,
                                                    George Washington University <br/>
                                                    Girish Bathla, MD, FRCR - Associate Professor, Mayo Clinic,
                                                    Rochester<br/>
                                                    Yonghan Ting, FRCR - National University Hospital, Singapore<br/>
                                                    Daniel Murphy, MD - University of Utah<br/>
                                                    David Vu, MD - Scripps Clinic Medical Group<br/>
                                                    Gagandeep Choudhary, MD, MBBS - Oregon Health and Science
                                                    University <br/>
                                                    Tze Chwan Lim, FRCR, MBBS - Woodlands Health<br/>
                                                    Luciano Farage, MD - UNIEURO <br/>
                                                    Christie Lincoln, MD - MD Anderson Cancer Center<br/>
                                                    Kian Ming Chew, MBChB - Woodlands Health Singapore<br/>
                                                    Katie Bailey, MD - University of South Florida<br/>
                                                    Eduardo Portela de Oliveira, MD - The Ottawa Hospital, University of
                                                    Ottawa<br/>
                                                    Fanny Moron, MD - Baylor College of Medicine<br/>
                                                    Achint Kumar Singh , MD - UT Health San Antonio <br/>
                                                    Nico Sollmann, MD, PhD - University Hospital Ulm<br/>
                                                    Kim Seifert, MD, MS - Stanford<br/>
                                                    Eric D. Schwartz, MD - Director of Neuroradiology, St. Elizabeth's
                                                    Medical Center<br/>
                                                    Mariana Sanchez Montaño, MD - Rh Radiologos <br/>
                                                    Charlotte Yuk-Yan Chung, MD, PhD - NYU Langone Health<br/>
                                                    Lubdha Shah , MD - University of Utah<br/>
                                                    Ling Ling Chan, FRCR, MBBS - Singapore General Hospital <br/>
                                                    Scott R. Andersen, MD - Colorado Kaiser<br/>
                                                    Troy Hutchins, MD - University of Utah<br/>
                                                    Rita Nassanga, Mmed Radiology, MBChB - Makerere University, Kampala
                                                    Uganda<br/>
                                                    Rukya Ali Masum - Ohio State Wexner Medical Center<br/>
                                                    Karl Soderlund, MD - Naval Medical Center Portsmouth<br/>
                                                    Le Roy Chong, MBBS, FRCR - Changi General Hospital<br/>
                                                    Jonathan D. Clemente, MD - Carolinas Medical Center<br/>
                                                    Ali Haikal Hussain, FRCR, MBChB - University of Rochester<br/>
                                                    Keynes Low - Woodlands Health<br/>
                                                    Mohiuddin Hadi, MD - University of Louisville<br/>
                                                    Michael Hollander, MD - Danbury Radiology Associates<br/>
                                                    Nurul Hafidzah Binti Rahim, MD - Hospital Putrajaya, Malaysia<br/>
                                                    Angela Guarnizo Capera, MD - Fundación Santa Fe de Bogotá<br/>
                                                    Lex A. Mitchell, MD - Hawaii Permanente Medical Group<br/>
                                                    Gennaro D'Anna, MD - ASST Ovest Milanese<br/>
                                                    Ellen Hoeffner, MD - University of Michigan<br/>
                                                    John L. Go, MD - University of Southern Califotnia<br/>
                                                    Facundo Nahuel Diaz, MD - Atrys Health / Hospital Italiano de Buenos
                                                    Aires<br/>
                                                    Jacob Ormsby, MD, MBA - University of New Mexico<br/>
                                                    Jaya Nath, MD - Northport VA Medical center<br/>
                                                    Nathaniel von Fischer, MD - Kaiser Permanente South San
                                                    Francisco<br/>
                                                    Vahe M. Zohrabian, MD - Northwell Health, North Shore University
                                                    Hospital<br/>
                                                    Mary Niroshinee Muthukumarasamy, MBBS, MD - Ministry of Health, Sri
                                                    Lanka<br/>
                                                    Sucari Vlok, MBChB, MMed - Tygerberg Hospital, University of
                                                    Stellenbosch<br/>
                                                    Nafisa Paruk, FCRad diagnostics, 2 SA, MBChB - Dr. Oosthuizen and
                                                    Partners <br/>
                                                    Shayan Sirat Maheen Anwar, MBBS, FCPS - Aga Khan University
                                                    Hospital <br/>
                                                    Giuseppe Cruciata, MD - Stony Brook University Hospital<br/>
                                                    Omar Islam, MD, FRCPC - Queen's University<br/>
                                                    Loizos Siakallis, MD - University College London <br/>
                                                    Ichiro Ikuta, MD, MMSc - Mayo Clinic Arizona</p>
                                                <p><a rel="noreferrer nofollow" href="https://www.md.ai"><img
                                                    src="https://storage.googleapis.com/kaggle-media/competitions/RSNA-2022/MD.ai%20logo.png"
                                                    alt=""/></a><br/>
                                                    Special thanks to <a rel="noreferrer nofollow"
                                                                         aria-label="MD.ai (opens in a new tab)"
                                                                         target="_blank"
                                                                         href="https://md.ai/">MD.ai</a> for
                                                    providing tooling for the data annotation process. </p></div>
                                        </div>
                                    </div>
                                    <div className="collapse collapse-arrow rounded-[0] border-t-2">
                                        <input type="radio" name="my-accordion-2" defaultChecked/>
                                        <div className="collapse-title text-xl font-medium">Citation</div>
                                        <div className="collapse-title text-xl text-right font-medium">
                                            <IoMdLink className="text-xl ml-auto mt-1"/>
                                        </div>
                                        <div className="collapse-content">
                                            <div className="flex gap-5">
                                                <div>
                                                    <p>
                                                        Tyler Richards, Jason Talbott, Robyn Ball, Errol Colak, Adam
                                                        Flanders, Felipe Kitamura, John Mongan, Luciano Prevedello,
                                                        Maryam
                                                        Vazirabad.. (2024). RSNA 2024 Lumbar Spine Degenerative
                                                        Classification. Kaggle.
                                                        https://kaggle.com/competitions/rsna-2024-lumbar-spine-degenerative-classification
                                                    </p>
                                                </div>
                                                <div>
                                                    <button className="btn border px-8 bg-white rounded-full">Cite
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <div className="space-y-6 p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-1">Competition Host</h2>
                                            <p className="text-gray-600">Radiological Society of North America</p>
                                        </div>
                                        <a href="/organizations/RSNA" aria-label="Radiological Society of North America"
                                           className="relative">
                                            <div className="w-12 h-12 rounded-full bg-cover bg-center"
                                                 style={{backgroundImage: "url('https://storage.googleapis.com/kaggle-organizations/1817/thumbnail.png')"}}></div>
                                            <svg width="48" height="48" viewBox="0 0 48 48"
                                                 className="absolute top-0 left-0">
                                                <circle r="22.5" cx="24" cy="24" fill="none" strokeWidth="3"
                                                        stroke="rgb(32, 33, 36)"></circle>
                                            </svg>
                                        </a>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold mb-1">Prizes &amp; Awards</h2>
                                        <div className="flex flex-col">
                                            <p className="text-gray-600">$50,000 <a
                                                href="/competitions/rsna-2024-lumbar-spine-degenerative-classification/host/prizes"
                                                className="text-blue-600 hover:underline">Edit</a></p>
                                            <p className="text-gray-600">Awards Points &amp; Medals</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold mb-1">Participation</h2>
                                        <p className="text-gray-600">14,660 Entrants</p>
                                        <p className="text-gray-600">2,423 Participants</p>
                                        <p className="text-gray-600">1,874 Teams</p>
                                        <p className="text-gray-600">23,203 Submissions</p>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold mb-3">Tags</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {['Computer Vision', 'Image', 'Binary Classification', 'Custom Metric'].map((tag, index) => (
                                                <a key={index} href={`/competitions?tagIds=${tag.replace(' ', '+')}`}
                                                   className="px-3 py-1 border rounded-full text-sm hover:bg-gray-300 transition-colors">
                                                    {tag}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xl font-bold mt-5">Table of Contents</p>
                                    <div className="flex-col flex gap-3 mt-3 border-l-4 px-4">
                                        <div>
                                            <button>Overview</button>
                                        </div>
                                        <div>
                                            <button>Discription</button>
                                        </div>
                                        <div>
                                            <button>Evaluation</button>
                                        </div>
                                        <div>
                                            <button>Timeline</button>
                                        </div>
                                        <div>
                                            <button>Prizes</button>
                                        </div>
                                        <div>
                                            <button>Code Requirements</button>
                                        </div>
                                        <div>
                                            <button>Acknowledgements</button>
                                        </div>
                                        <div>
                                            <button>Citation</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {page == "Data" && (
                        <>
                            <div className="grid grid-cols-12 gap-10 mt-10">
                                <div className="col-span-8">
                                    <div className="sc-hcMnnX dpWoFL">
                                        <div className="sc-kPsOMv iJCVyo">
                                            <div className="sc-cYnRcR AGcYs sc-dLMgjy btqUPn">
                                                <div className="sc-hkcRYQ cLSyxq">
                                                    <div className="sc-tSpkn glJxsB"><h2
                                                        className="sc-cBYhjr sc-cbeHKN cMAYca jsrKlh text-xl font-bold mb-5">Dataset
                                                        Description</h2></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div>
                                                <div className="sc-dBKto dSwEGX">
                                                    <div>
                                                        <div>
                                                            <div className="sc-ezTrPE cWBTpb flex flex-col gap-3"><p>The
                                                                goal of this
                                                                competition is to identify medical conditions affecting
                                                                the lumbar spine in MRI scans.</p>
                                                                <p>This competition uses a hidden test. When your
                                                                    submitted notebook is scored, the actual test data
                                                                    (including a full length sample submission) will be
                                                                    made available to your notebook.</p>
                                                                <h2 className=" text-xl font-bold my-5">Files</h2>
                                                                <p><strong>train.csv</strong> Labels for the train set.
                                                                </p>
                                                                <ul>
                                                                    <li><code>study_id</code> - The study ID. Each study
                                                                        may include multiple series of images.
                                                                    </li>
                                                                    <li><code>[condition]_[level]</code> - The target
                                                                        labels, such
                                                                        as <code>spinal_canal_stenosis_l1_l2</code>,
                                                                        with the severity levels
                                                                        of <code>Normal/Mild</code>, <code>Moderate</code>,
                                                                        or <code>Severe</code>. Some entries have
                                                                        incomplete labels.
                                                                    </li>
                                                                </ul>
                                                                <p><strong>train_label_coordinates.csv</strong></p>
                                                                <ul>
                                                                    <li><code>study_id</code></li>
                                                                    <li><code>series_id</code> - The imagery series ID.
                                                                    </li>
                                                                    <li><code>instance_number</code> - The image's order
                                                                        number within the 3D stack.
                                                                    </li>
                                                                    <li><code>condition</code> - There are three core
                                                                        conditions: spinal canal stenosis,
                                                                        neural_foraminal_narrowing, and
                                                                        subarticular_stenosis. The latter two are
                                                                        considered for each side of the spine.
                                                                    </li>
                                                                    <li><code>level</code> - The relevant vertebrae,
                                                                        such as <code>l3_l4</code></li>
                                                                    <li><code>[x/y]</code> - The x/y coordinates for the
                                                                        center of the area that defined the label.
                                                                    </li>
                                                                </ul>
                                                                <p><strong>sample_submission.csv</strong></p>
                                                                <ul>
                                                                    <li><code>row_id</code> - A slug of the study ID,
                                                                        condition, and level such
                                                                        as <code>12345_spinal_canal_stenosis_l3_l4</code>.
                                                                    </li>
                                                                    <li><code>[normal_mild/moderate/severe]</code> - The
                                                                        three prediction columns.
                                                                    </li>
                                                                </ul>
                                                                <p>
                                                                    <strong>[train/test]_images/[study_id]/[series_id]/[instance_number].dcm</strong> The
                                                                    imagery data. </p>
                                                                <p><strong>[train/test]_series_descriptions.csv</strong>
                                                                </p>
                                                                <ul>
                                                                    <li><code>study_id</code></li>
                                                                    <li><code>series_id</code></li>
                                                                    <li><code>series_description</code> The scan's
                                                                        orientation.
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-4">
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold">Files</h2>
                                        <span className="mt-1">147320 files</span>
                                        <h2 className="text-xl font-bold mt-6">Size</h2>
                                        <span className="mt-1">35.34 GB</span>
                                        <h2 className="text-xl font-bold mt-6">Type</h2>
                                        <span className="">dcm, csv</span>
                                        <h2 className="text-xl font-bold mt-6">License</h2>
                                        <span className=" text-black"><a className="hover:underline">Subject to Competition Rules</a></span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-12 gap-10 mt-10">
                                <div className="col-span-8 ">
                                   <div className="max-h-[500px] overflow-y-auto">
                                       {typeShow == 'dcm' && url.length > 0 && (
                                           <div onWheel={(e) => weelDetect(e.deltaY)} className="flex justify-center items-center">
                                               <DicomViewer imageId={url} />
                                           </div>
                                       )}
                                       {typeShow == 'csv' && csvData.length > 0 && (
                                           <CsvGraph data={csvData} />
                                       )}
                                   </div>
                                </div>
                                <div className="col-span-4">
                                    <div>
                                        <p className="text-lg font-bold">Data Explorer</p>
                                        <p>35.34 GB</p>
                                    </div>
                                    <div>
                                        <div
                                            className="flex-col flex pt-2 max-h-[300px]">
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
                                                                    {recusiveFileTree(value, key, `/${key}`)}
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
                                                                            className={`pathFileBtn ${selectedUrl == `${value}` ? 'active' : ''}`}>
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

                                            <div className="basis-1/12 ">
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
                                    <hr className="my-5"/>
                                    <div>
                                        <p className="text-lg font-bold">Summary</p>
                                        <div className="collapse">
                                            <input type="radio" name="my-accordion-1" defaultChecked/>
                                            <div className="collapse-title text-sm ">
                                                <div>
                                                    <div className="flex gap-3">
                                                        <CiFolderOn className="text-lg"/>
                                                        147k files
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="collapse-content">
                                                <div className="flex justify-between text-sm">
                                                    <div className="flex gap-3">
                                                        <CiFileOn className="text-sm"/>
                                                        <span>.dcm</span>
                                                    </div>
                                                    <div>
                                                        <span>147k</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <div className="flex gap-3">
                                                        <CiViewColumn className="text-sm"/>
                                                        <span>.csv</span>
                                                    </div>
                                                    <div>
                                                        <span>5</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="collapse">
                                            <input type="radio" name="my-accordion-1"/>
                                            <div className="collapse-title text-sm font-bold ">
                                                <div className="flex gap-3">
                                                    <CiViewColumn className="text-lg"/>
                                                    43 columns
                                                </div>
                                            </div>
                                            <div className="collapse-content flex flex-col gap-2">
                                                <div className="flex justify-between text-sm">
                                                    <div className="flex gap-3">
                                                        <AiOutlineFontColors className="text-sm"/>
                                                        <span>String</span>
                                                    </div>
                                                    <div>
                                                        <span>30</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <div className="flex gap-3">
                                                        <FaKey className="text-sm"/>
                                                        <span>Id</span>
                                                    </div>
                                                    <div>
                                                        <span>7</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <div className="flex gap-3">
                                                        <FaHashtag className="text-sm"/>
                                                        <span>Decimal</span>
                                                    </div>
                                                    <div>
                                                        <span>5</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <div className="flex gap-3">
                                                        <span>Other</span>
                                                    </div>
                                                    <div>
                                                        <span>1</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="my-5"/>
                                    <div className="mb-5">
                                        <button className="btn bg-black text-white rounded-full flex"><FaDownload/>Download
                                            All
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="relative border p-5 rounded-xl">
                                    <div className="absolute text-sm -top-2 bg-white">
                                        DOWNLOAD DATA
                                    </div>

                                    <div className="flex justify-between">
                                    <div className="flex gap-8">
                                            <div className="self-center">
                                                <FaTerminal className="text-xl" />
                                            </div>
                                            <div className="text-md font-bold">
                                                kaggle competitions download -c rsna-2024-lumbar-spine-degenerative-classification
                                            </div>
                                        </div>
                                        <div className="flex self-center gap-5">
                                            <FaRegCopy  className="text-3xl" />
                                            <IoIosInformationCircleOutline  className="text-3xl" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10">
                                    <div className="flex gap-5">
                                        <IoDocumentTextOutline className="text-3xl self-center"/>
                                        <p className="text-3xl font-bold">Metadata</p>
                                    </div>
                                    <hr className="my-5"/>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            License
                                        </p>
                                        <p className="underline mt-3 text-lg">
                                            Subject to Competition Rules
                                        </p>
                                    </div>
                                    <hr className="my-5"/>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}