"use client"
import React, { useRef, useState, useEffect } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';

// Initialize cornerstone and its image loader
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
  patientName: string;
  patientId: string;
  studyDate: string;
  modality: string;
  windowCenter: number | string;
  windowWidth: number | string;
}

const DicomViewer: React.FC = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      cornerstone.loadImage(imageId).then((image: any) => {
        const viewport = cornerstone.getDefaultViewportForImage(elementRef.current!, image);
        cornerstone.displayImage(elementRef.current!, image, viewport);
        
        // Extract and set image information
        try {
          const metadata = image.data;
          const getString = (tag: string) => {
            const element = metadata.string(tag);
            return element !== undefined ? element : 'N/A';
          };

          setImageInfo({
            patientName: getString('x00100010'),
            patientId: getString('x00100020'),
            studyDate: getString('x00080020'),
            modality: getString('x00080060'),
            windowCenter: image.windowCenter || 'N/A',
            windowWidth: image.windowWidth || 'N/A',
          });
        } catch (error) {
          console.error('Error extracting metadata:', error);
          setError('Failed to extract image metadata.');
        }
        setIsLoading(false);
      }).catch((error: any) => {
        console.error('Error loading image:', error);
        setError('Failed to load the DICOM image. The file may be corrupt or in an unsupported format.');
        setIsLoading(false);
      });
    }
  }, [imageId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Attempt to parse DICOM file
      dicomParser.parseDicom(new Uint8Array(arrayBuffer));

      // If parsing succeeds, add file to Cornerstone
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      setImageId(imageId);
    } catch (error) {
      console.error('Error processing DICOM file:', error);
      setError('Failed to process the file. It may not be a valid DICOM file.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">DICOM Image Viewer</h1>
      
      <div className="flex flex-row gap-4">
        <div className="flex-1 bg-purple-900 p-4 rounded-lg" style={{height: '600px'}}>
          {error ? (
            <div className="text-white text-center h-full flex items-center justify-center">
              {error}
            </div>
          ) : (
            <div ref={elementRef} style={{width: '100%', height: '100%'}} />
          )}
        </div>
        
        <div className="w-80 bg-white p-4 rounded-lg overflow-y-auto" style={{height: '600px'}}>
          <h2 className="text-lg font-semibold mb-2">Image Information</h2>
          <div className="space-y-1 text-sm">
            {imageInfo && Object.entries(imageInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{value.toString()}</span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => document.getElementById('fileInput')?.click()}
            disabled={isLoading}
            className="w-full mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Processing...' : 'Upload DICOM'}
          </button>
          
          <input
            id="fileInput"
            type="file"
            accept=".dcm"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default DicomViewer;