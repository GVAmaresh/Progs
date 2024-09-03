"use client"
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { randomBytes } from 'crypto';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunk size
const baseUrl = 'http://127.0.0.1:5000';

export default function Add_Contents() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [totalChunks, setTotalChunks] = useState<number>(0);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const generateUid = () => {
    return randomBytes(16).toString('hex'); 
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      const generatedFileName = generateUid()
      setFileName(generatedFileName);
      setTotalChunks(Math.ceil(selectedFile.size / CHUNK_SIZE));
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      return alert('Please select a file');
    }

    setUploading(true);

    try {
      const startTime = new Date();

      const res = await fetch(`${baseUrl}/initiateUpload`, {
        method: 'POST',
        body: JSON.stringify({ fileName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      const uploadId = data.uploadId as string;
      setUploadId(uploadId);

      const uploadPromises: Promise<void>[] = [];
      let uploadedChunks = 0;
      let start = 0;
      let end: number;

      for (let i = 0; i < totalChunks; i++) {
        end = start + CHUNK_SIZE;
        const chunk = file.slice(start, end);
        const formData = new FormData();
        formData.append('index', i.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('fileName', fileName);
        formData.append('file', chunk);

        const uploadPromise = fetch(`${baseUrl}/upload?uploadId=${uploadId}`, {
          method: 'POST',
          body: formData,
        }).then(() => {
          uploadedChunks++;
          const progressValue = Math.floor((uploadedChunks / totalChunks) * 100);
          setProgress(progressValue);
        });

        uploadPromises.push(uploadPromise);
        start = end;
      }

      await Promise.all(uploadPromises);

      const completeRes = await fetch(`${baseUrl}/completeUpload?fileName=${fileName}&uploadId=${uploadId}`, {
        method: 'POST',
      });

      const completeData = await completeRes.json();

      if (!completeData.success) {
        throw new Error('Error completing upload');
      }

      const endTime = new Date();
      const timeElapsed = (endTime.getTime() - startTime.getTime()) / 1000;
      console.log('Time elapsed:', timeElapsed, 'seconds');
      alert('File uploaded successfully');

      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setProgress(0);
    setFile(null);
    setFileName('');
    setTotalChunks(0);
    setUploadId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Send Files In Chunk to Backend</h5>
              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label htmlFor="fileInput">Select File:</label>
                  <input
                    type="file"
                    className="form-control-file"
                    id="fileInput"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
                <div className="progress mb-3">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    ref={progressBarRef}
                  >
                    {progress}%
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
