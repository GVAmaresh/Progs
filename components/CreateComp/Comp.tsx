"use client";
import { createClerkClient } from "@clerk/backend";
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

import { createChannelAPI } from "../../controllers/mongodbAPI";
import { useUserDetails } from "../Accounts/accountMenu";

const clerkClient = createClerkClient({ secretKey });

const baseUrl = "http://127.0.0.1:5000";

interface IChannel {
  channelName: string;
  channelDescription: string;
  Thumbnail: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024;
export default function CreateComp({ purpose = "" }: { purpose: string }) {
  const clerkClient = createClerkClient({ secretKey });
  const [file, setFile] = useState<File | null>(null);
  const [channel, setChannel] = useState<IChannel | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newEmail, setNewEmail] = useState<string>("");
  const answer = useUserDetails();
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
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!channel?.channelName || !channel.channelDescription) {
      return alert("Please fill in all required fields");
    }
    if (!file) {
      return alert("Please select a file");
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);

      const res = await fetch(`${baseUrl}/upload-channel-icon`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error uploading file");
      }

      setChannel((prev) => ({
        ...prev,
        channelName: prev?.channelName || "",
        channelDescription: prev?.channelDescription || "",
        Thumbnail: data.key || ""
      }));

      if (channel) {
        await createChannelAPI({
          key: data.key,
          email: newEmail,
          channelName: channel.channelName,
          channelDescription: channel.channelDescription
        });
      }

      alert("File uploaded successfully");
      console.log("File URL:", data.fileUrl);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setProgress(0);
    setFile(null);
    setChannel(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
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
          Create A New Channel
        </AccordionSummary>
        <AccordionDetails>
          <div className="flex justify-center flex-col w-3/4">
            <TextField
              id="channel-name"
              label="Channel Name"
              onChange={(e) =>
                setChannel((prev) => ({
                  ...prev,
                  channelName: e.target.value,
                  channelDescription: prev?.channelDescription || "",
                  Thumbnail: prev?.Thumbnail || ""
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
              id="channel-description"
              label="Channel Description"
              variant="standard"
              onChange={(e) =>
                setChannel((prev) => ({
                  ...prev,
                  channelDescription: e.target.value,
                  channelName: prev?.channelName || "",
                  Thumbnail: prev?.Thumbnail || ""
                }))
              }
              fullWidth
              InputLabelProps={{ style: { color: "white" } }}
              InputProps={{ style: { color: "white" } }}
              sx={{ marginBottom: 2 }}
            />
            <div className="">
              <div className="">Channel Icon</div>
              <Input
                type="file"
                onChange={handleFileChange}
                inputProps={{ accept: "image/*" }}
              />
            </div>
          </div>
        </AccordionDetails>
        <AccordionActions>
          <Button
            onClick={handleUpload}
            sx={{
              color: "white",
              "&:hover": {
                fontWeight: "bold",
                color: "white",
                backgroundColor: "green"
              },
              "&:active": {
                backgroundColor: "darkgreen"
              },
              backgroundColor: "green"
            }}
          >
            Create
          </Button>
        </AccordionActions>
      </Accordion>
    </div>
  );
}
