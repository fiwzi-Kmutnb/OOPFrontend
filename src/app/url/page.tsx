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
    console.error('Error initializing Cornerstone WADO Image Loader:', error);
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

const DicomViewer: React.FC = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    initializeCornerstoneWADOImageLoader();
    if (elementRef.current) {
      try {
        cornerstone.enable(elementRef.current);
      } catch (error) {
        console.error('Error enabling Cornerstone:', error);
        setError('Failed to initialize the image viewer.');
      }
    }

    return () => {
      if (elementRef.current) {
        try {
          cornerstone.disable(elementRef.current);
        } catch (error) {
          console.error('Error disabling Cornerstone:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (imageId && elementRef.current) {
      setIsLoading(true);
      setError(null);
      cornerstone.loadImage(imageId).then((image: {
        data: {
            string: (tag: string) => string | undefined,
            uint16: (tag: string) => number | undefined,
        },
        windowWidth: number,
        windowCenter: number,
      }) => {
        if (typeof image !== 'object' || !image) {
            setError('Failed to load the DICOM image. The URL may be invalid or the image format is unsupported.');
            setIsLoading(false);
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
          console.error('Error extracting metadata:', error);
          setError('Failed to extract image metadata.');
        }
        setIsLoading(false);
      }).catch((error: never) => {
        console.error('Error loading image:', error);
        setError('Failed to load the DICOM image. The URL may be invalid or the image format is unsupported.');
        setIsLoading(false);
      });
    }
  }, [imageId]);

  const handleUrlSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError(null);

    // Construct the imageId for URL
    const imageId = `wadouri:${url}`;
    setImageId(imageId);
  };

  return (
    <div className="p-4 bg-white h-screen text-black">
      
      <form onSubmit={handleUrlSubmit} className="mb-4">
        <div className="w-full">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter DICOM URL"
          className="mr-2 p-2 border rounded w-full"
        />
        </div>
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'กดกดกดกด'}
        </button>
      </form>
      
      <div className="flex flex-row gap-4">
        <div className="flex-1 p-4 rounded-lg" style={{height: '500px', width: '500px'}}>
          {error ? (
            <div className="text-white text-center h-full flex items-center justify-center">
              {error}
            </div>
          ) : (
            <div ref={elementRef} style={{width: '100%', height: '100%'}} />
          )}
        </div>
        
        <div className="flex-1">
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
};

export default DicomViewer;