"use client";
import { createClerkClient } from "@clerk/backend";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Input,
  TextField
} from "@mui/material";
import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { randomBytes } from "crypto";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const secretKey = process.env.CLERK_SECRET_KEY;

import { createVideoAPI } from "../../controllers/mongodbAPI";
import { useUserDetails } from "../Accounts/accountMenu";

const clerkClient = createClerkClient({ secretKey });

const baseUrl = "http://127.0.0.1:5000";

interface IVideo {
  videoName: string;
  videoDescription: string;
  Thumbnail: string;
  channelName: string;
  VideoUrl: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunk size

export default function CreateCompVideo({ purpose = "" }: { purpose: string }) {
  const [file, setFile] = useState<File | null>(null);
  const[fileThumbnail, setFileThumbnail] = useState<File|null>(null);
  const [video, setVideo] = useState<IVideo | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileNameThumbnail, setFileNameThumbnail] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newEmail, setNewEmail] = useState<string>("");
  const [channelName, setChannelName] = useState<string>("");
  const [totalChunks, setTotalChunks] = useState<number>(0);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const answer = useUserDetails();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("pathname:", pathname);
    if (!pathname) {
      throw new Error("Path name not specified");
    }
    const pathSegments = pathname.split("/");

    const lastSegment = pathSegments[pathSegments.length - 1];
    setChannelName(lastSegment);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (answer.user != null) setNewEmail(answer.user.email);
  }, [answer]);

  const generateUid = () => {
    return randomBytes(16).toString("hex");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(generateUid());
      setTotalChunks(Math.ceil(selectedFile.size / CHUNK_SIZE));
    }
  };
  const handleFileThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      setFileThumbnail(selectedFile);
      setFileNameThumbnail(generateUid());
      // setTotalChunks(Math.ceil(selectedFile.size / CHUNK_SIZE));
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!video?.videoName || !video.videoDescription) {
      return alert("Please fill in all required fields");
    }
    if (!file) {
      return alert("Please select a video file");
    }

    setUploading(true);

    try {
      // Initiate the video upload
      const res = await fetch(`${baseUrl}/initiateUpload`, {
        method: "POST",
        body: JSON.stringify({ fileName }),
        headers: {
          "Content-Type": "application/json"
        }
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
        formData.append("index", i.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("fileName", fileName);
        formData.append("file", chunk);

        const uploadPromise = fetch(`${baseUrl}/upload?uploadId=${uploadId}`, {
          method: "POST",
          body: formData
        }).then(() => {
          uploadedChunks++;
          const progressValue = Math.floor(
            (uploadedChunks / totalChunks) * 100
          );
          setProgress(progressValue);
        });

        uploadPromises.push(uploadPromise);
        start = end;
      }

      await Promise.all(uploadPromises);

      // Complete the upload
      const completeRes = await fetch(
        `${baseUrl}/completeUpload?fileName=${fileName}&uploadId=${uploadId}`,
        {
          method: "POST"
        }
      );

      const completeData = await completeRes.json();

      if (!completeData.success) {
        throw new Error("Error completing upload");
      }
      console.log(completeData.data)
      console.log(completeData.data.Key);
      // setVideo((prev=>{...prev }))

      if (!fileThumbnail) {
        return alert("Please select a Thumbnail file");
      }

      const formData = new FormData();
      formData.append("file", fileThumbnail);
      formData.append("fileName", fileNameThumbnail);

      const res_thumbnail = await fetch(`${baseUrl}/upload-thumbnail-icon`, {
        method: "POST",
        body: formData
      });

      const data_thumbnail = await res_thumbnail.json();
      if (!res_thumbnail.ok) {
        throw new Error(data_thumbnail.message || "Error uploading file");
      }
      console.log(data_thumbnail);
      console.log(data_thumbnail.key)


      if (!channelName) throw new Error("Channel name is required");
      setVideo((prev) => ({
        ...prev,
        key: completeData.data.Key as string,
        videoName: prev?.videoName || "",
        channelName: channelName || "",
        videoDescription: prev?.videoDescription || "",
        Thumbnail: data_thumbnail.key as string || "",
        VideoUrl: completeData.key || ""
      }));

      if (video) {
        console.log(video);
        await createVideoAPI({
          key: completeData.data.Key ,
          email: newEmail,
          channelName: channelName,
          videoName: video.videoName,
          videoDescription: video.videoDescription,
          thumbnail: data_thumbnail.key
        });
      }

      alert("Video uploaded successfully");
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error uploading video");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setProgress(0);
    setFile(null);
    setVideo(null);
    setFileName("");
    setUploadId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <Accordion
          sx={{
            backgroundColor: "#0D0D3C",
            color: "white"
          }}
          className="w-1/2"
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
            aria-controls="panel3-content"
            id="panel2-header"
          >
            Upload A New Video
          </AccordionSummary>
          <AccordionDetails>
            <div className="flex justify-center flex-col w-3/4">
              <TextField
                id="video-name"
                label="Video Name"
                onChange={(e) =>
                  setVideo((prev) => ({
                    ...prev,
                    videoName: e.target.value,
                    channelName: prev?.channelName || "",
                    videoDescription: prev?.videoDescription || "",
                    Thumbnail: prev?.Thumbnail || "",
                    VideoUrl: prev?.VideoUrl || ""
                  }))
                }
                variant="standard"
                fullWidth
                InputLabelProps={{ style: { color: "white" } }}
                InputProps={{
                  style: { color: "white" }
                }}
                sx={{ marginBottom: 2 }}
              />
              <TextField
                id="video-description"
                label="Video Description"
                variant="standard"
                onChange={(e) =>
                  setVideo((prev) => ({
                    ...prev,
                    videoDescription: e.target.value,
                    channelName: prev?.channelName || "",
                    videoName: prev?.videoName || "",
                    Thumbnail: prev?.Thumbnail || "",
                    VideoUrl: prev?.VideoUrl || ""
                  }))
                }
                fullWidth
                InputLabelProps={{ style: { color: "white" } }}
                InputProps={{ style: { color: "white" } }}
                sx={{ marginBottom: 2 }}
              />
              <div className="">
                <div className="">Video Thumbnail</div>
                <Input
                  type="file"
                  onChange={handleFileThumbnailChange}
                  inputProps={{ accept: "image/*" }}
                />
              </div>
              <div className="mt-4">
                <div className="">Video File</div>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  inputProps={{ accept: "video/*" }}
                />
              </div>
            </div>
          </AccordionDetails>
          <AccordionActions>
            <Button
              onClick={handleUpload}
              sx={{
                color: "white",
                "&:hover": { fontWeight: "bold", color: "white" }
              }}
            >
              Upload
            </Button>
          </AccordionActions>
        </Accordion>
      </div>
    </>
  );
}
