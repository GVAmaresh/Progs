"use client"; 

import Image from 'next/image';
import cloudfrontLoader from './cloudFrontLoader'; 

export default function VideoComp() {
  return (
    <div className="h-72 w-full bg-slate-300 rounded-3xl overflow-hidden">
      <div className="relative h-3/4 w-full">
        <Image
          loader={cloudfrontLoader}
          src="Thumbnails/my_pic.png"  
          alt="Video Thumbnail"
          layout="fill"
          objectFit="cover"
          className="rounded-t-3xl"
        />
      </div>
      <div className="pl-4 text-black">
        <h2 className="text-black text-xl font-bold leading-tight">My Video Title</h2>
        <div className="">channel name</div>
        <div className="flex flex-row gap-6">
            <div className="">10M</div>
            <div className="">1 hour</div>
        </div>
      </div>
    </div>
  );
}
