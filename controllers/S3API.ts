// // S3API.ts
// export default async function S3API(file: File, fileName: string, totalChunks: number, setProgress: Function) {
//   const baseUrl = 'http://127.0.0.1:5000';
//   const CHUNK_SIZE = 5 * 1024 * 1024;

//   if (!file) {
//     alert('Please select a file');
//     return;
//   }

//   try {
//     const startTime = new Date();

//     const res = await fetch(`${baseUrl}/initiateUpload`, {
//       method: 'POST',
//       body: JSON.stringify({ fileName }),
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     const data = await res.json();
//     const uploadId = data.uploadId as string;

//     const uploadPromises: Promise<void>[] = [];
//     let uploadedChunks = 0;
//     let start = 0;
//     let end: number;

//     for (let i = 0; i < totalChunks; i++) {
//       end = start + CHUNK_SIZE;
//       const chunk = file.slice(start, end);
//       const formData = new FormData();
//       formData.append('index', i.toString());
//       formData.append('totalChunks', totalChunks.toString());
//       formData.append('fileName', fileName);
//       formData.append('file', chunk);

//       const uploadPromise = fetch(`${baseUrl}/upload?uploadId=${uploadId}`, {
//         method: 'POST',
//         body: formData,
//       }).then(() => {
//         uploadedChunks++;
//         const progressValue = Math.floor((uploadedChunks / totalChunks) * 100);
//         setProgress(progressValue);
//       });

//       uploadPromises.push(uploadPromise);
//       start = end;
//     }

//     await Promise.all(uploadPromises);

//     const completeRes = await fetch(`${baseUrl}/completeUpload?fileName=${fileName}&uploadId=${uploadId}`, {
//       method: 'POST',
//     });

//     const completeData = await completeRes.json();

//     if (!completeData.success) {
//       throw new Error('Error completing upload');
//     }

//     const endTime = new Date();
//     const timeElapsed = (endTime.getTime() - startTime.getTime()) / 1000;
//     console.log('Time elapsed:', timeElapsed, 'seconds');
//     alert('File uploaded successfully');
//   } catch (err) {
//     console.error(err);
//     alert('Error uploading file');
//   }
// }
