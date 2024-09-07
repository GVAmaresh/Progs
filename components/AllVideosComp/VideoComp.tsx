"use client";

import { CardMedia } from "@mui/material";
import { uploadChannelIcon } from "../../api/s3/components";
const cloudfront = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT;

export default function VideoComp({
  thumbnail,
  title,
  channelName,
  channelIcon
}: {
  thumbnail: string;
  title: string;
  channelName: string;
  channelIcon: string;
}) {
  return (
    <div className="h-72 w-full bg-slate-300 rounded-3xl overflow-hidden">
      <div className="relative h-3/4 w-full">
        <CardMedia
          component="img"
          image={`https://${cloudfront}/${thumbnail}`}
          alt="Video Thumbnail"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
          className="rounded-t-3xl"
        />
      </div>
      <div className="pl-4 text-black flex gap-5">
        <div className="">
          <CardMedia
            component="img"
            image={`https://${cloudfront}/${channelIcon}`}
            alt="Channel Icon"
            sx={{
              width: 60,
              height: 60,
              objectFit: "cover"
            }}
            className="rounded-full"
          />
        </div>
        <div className="">
          <h2 className="text-black text-xl font-bold leading-tight">
            {title}
          </h2>
          <div className="">{channelName}</div>
          <div className="flex flex-row gap-6">
            <div className="">10M</div>
            <div className="">1 hour</div>
          </div>
        </div>
      </div>
    </div>
  );
}
