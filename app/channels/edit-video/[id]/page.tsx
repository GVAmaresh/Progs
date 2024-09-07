"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getVideo } from "../../../../controllers/mongodbAPI";
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

const cloudfront = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT;

export default function EditVideo() {
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
        {videoDetails?<div className="">
          <div className="flex flex-col md:flex-row p-6 pl-1 md:pl-24 pt-8 gap-6">
            <div className="" style={{ height: "360", width: "640" }}>
            <video width="640" height="360" controls className="rounded-3xl">
                <source
                  src={`https://${cloudfront}/${videoDetails.keyID}`}
                  type="video/mp4"
                />
              </video>
            </div>
  
            <div className="mt-12 w-full md:w-1/2">
              <div className="font-extrabold text-3xl">{videoDetails.title}</div>
              <div className=" overflow-y-scroll max-h-60">{videoDetails.description}</div>
              <div className="">*Comment goes here*</div>
            </div>
          </div>
        </div>:<>Loading</>}
        </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      </>
    );
  }
  