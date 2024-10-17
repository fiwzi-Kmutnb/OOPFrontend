"use client"
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-regular-svg-icons";
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


    return (
        <>
            <div>

                <div className="ml-[320px]">
                    {typeShow == 'dcm' && url.length > 0 && (
                        <div onWheel={(e) => weelDetect(e.deltaY)} className="flex h-screen justify-center items-center">
                            <DicomViewer imageId={url} />
                        </div>
                    )}
                    {typeShow == 'csv' && csvData.length > 0 && (
                        <CsvGraph data={csvData} />
                    )}
                </div>
            </div>
        </>
    )
}