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

export default function Page() {
    return (
        <div>
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
                    {/* <button className="flex h-full gap-6 w-full hover:bg-slate-200 py-2 transition-all">
                        <HiOutlinePencilAlt className="text-2xl ml-8 font-bold" />
                        <div className="text-lg">
                        Your Work
                        </div>
                    </button>  */}
                    
                    
                    {/* <button className="flex">
                        <CiTrophy className="text-xl" />
                        <div>
                        Competitions
                        </div>
                    </button> */}
                </div>
            </div>
        </div>
    )
}