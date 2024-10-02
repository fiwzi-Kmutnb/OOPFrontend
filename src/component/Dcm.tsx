"use client"
import React, { useRef, useState, useEffect } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';

const initializeCornerstoneWADOImageLoader = () => {
  try {
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
      maxWebWorkers: navigator.hardwareConcurrency || 1,
      startWebWorkersOnDemand: true,
      taskConfiguration: {
        decodeTask: {
          initializeCodecsOnStartup: false,
          usePDFJS: false,
          strict: false,
        },
      },
    });
  } catch (error) {
    console.error('เกิดปัญหา:', error);
  }
};

interface ImageInfo {
  transferSyntax: string;
  sopClassUID: string;
  sopInstanceUID: string;
  rows: number;
  columns: number;
  spacing: string;
  direction: string;
  origin: string;
  modality: string;
  pixelRepresentation: number;
  bitsAllocated: number;
  bitsStored: number;
  highBit: number;
  photometricInterpretation: string;
  windowWidth: number;
  windowCenter: number;
}

function DicomViewer({ imageId }: { imageId: string }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeCornerstoneWADOImageLoader();
    if (elementRef.current) {
      try {
        cornerstone.enable(elementRef.current);
      } catch (e) {
        setError('ไม่สามารถเปิดรูปภาพได้');
      }
    }

    return () => {
      if (elementRef.current) {
        try {
          cornerstone.disable(elementRef.current);
        } catch (e) {
        }
      }
    };
  }, []);

  useEffect(() => {
    if (imageId && elementRef.current) {
      setError(null);
      const fullImageId = imageId;
      cornerstone.loadImage(fullImageId).then((image: {
        data: {
          string: (tag: string) => string | undefined,
          uint16: (tag: string) => number | undefined,
        },
        windowWidth: number,
        windowCenter: number,
      }) => {
        if (typeof image !== 'object' || !image) {
          setError('ไฟล์ไม่ถูกค้อง');
          return;
        }

        const viewport = cornerstone.getDefaultViewportForImage(elementRef.current!, image);
        cornerstone.displayImage(elementRef.current!, image, viewport);

        try {
          const metadata = image.data;
          const getString = (tag: string) => metadata.string(tag) || 'undefined';
          const getNumber = (tag: string) => metadata.uint16(tag) || 0;

          setImageInfo({
            transferSyntax: getString('x00020010'),
            sopClassUID: getString('x00080016'),
            sopInstanceUID: getString('x00080018'),
            rows: getNumber('x00280010'),
            columns: getNumber('x00280011'),
            spacing: `${getString('x00280030')}`,
            direction: `${getString('x00200037')}`,
            origin: `${getString('x00200032')}`,
            modality: getString('x00080060'),
            pixelRepresentation: getNumber('x00280103'),
            bitsAllocated: getNumber('x00280100'),
            bitsStored: getNumber('x00280101'),
            highBit: getNumber('x00280102'),
            photometricInterpretation: getString('x00280004'),
            windowWidth: image.windowWidth || getNumber('x00281051'),
            windowCenter: image.windowCenter || getNumber('x00281050'),
          });
        } catch (error) {
          setError('ไม่สามารถโหลด MetaData ได้');
        }
      }).catch((error: never) => {
        setError('ระบบไฟล์ไม่รองรับ');
      });
    }
  }, [imageId]);

  return (
      <div className="p-4 bg-white flex justify-center items-center self-center h-screen text-black">
        <div className="flex flex-wrap  gap-4">
          <div className=" p-4 rounded-lg" style={{height: '500px', width: '500px'}}>
            {error ? (
                <div className="text-white text-center h-full flex items-center justify-center">
                  {error}
                </div>
            ) : (
                <div ref={elementRef} style={{width: '100%', height: '100%'}} />
            )}
          </div>

          <div className="">
            {imageInfo && (
                <div className="space-y-1 text-sm">
                  {Object.entries(imageInfo).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium mr-2">{key}:</span>
                        <span>{value.toString()}</span>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default DicomViewer;