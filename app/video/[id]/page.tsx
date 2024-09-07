"use client";

import { useParams } from "next/navigation";
import { getVideo } from "../../../controllers/mongodbAPI";
import { useEffect, useState } from "react";
import GetSingleVideo from "../../../components/SingleVideoComp/page";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

interface IVideo {
  title: string;
  description: string;
  keyID: string;
  channelID: {
    channelName: string;
    channelIcon: string;
  };
}

export default function OpeVideo() {
  const params = useParams();
  const [videoDetails, setVideoDetails] = useState<IVideo | null>(null);

  useEffect(() => {
    if (params?.id) {
      getVideo(params.id as string)
        .then((d) => {
          console.log("Video details:", d.data);
          setVideoDetails(d.data);
        })
        .catch((error) => {
          console.error("Error fetching video details:", error);
          setVideoDetails(null);
        });
    }
  }, [params?.id]);

  return (
    <>
      <SignedIn>
        <div>
          {videoDetails ? (
            <GetSingleVideo
              title={videoDetails.title}
              description={videoDetails.description}
              keyID={videoDetails.keyID} // Ensure you use keyID here
              channelName={videoDetails.channelID.channelName}
              channelIcon={videoDetails.channelID.channelIcon}
            />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
