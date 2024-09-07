import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import GetAllVideos from "../AllVideosComp/page";
import { CardMedia } from "@mui/material";
const cloudfront = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT;

interface IVideDetails {
  title: string;
  description: string;
  keyID: string;
  channelName: string;
  channelIcon: string;
}

export default function GetSingleVideo({
  title,
  description,
  keyID,  
  channelIcon,
  channelName
}: IVideDetails) {
  
  return (
    <>
      <SignedIn>
        <div className="">
          <div className="flex flex-col md:flex-row p-6 pl-1 md:pl-24 pt-8 gap-6">
            <div className="" style={{ height: "360", width: "640" }}>
              <video width="640" height="360" controls className="rounded-3xl">
                <source
                  src={`https://${cloudfront}/${keyID}`}
                  type="video/mp4"
                />
              </video>
            </div>

            <div className="mt-12 w-full md:w-1/2 flex gap-10">
              <div className="">
                <CardMedia
                  component="img"
                  image={`https://${cloudfront}/${channelIcon}`}
                  alt="Video Thumbnail"
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: "cover"
                  }}
                  className="rounded-full"
                />
                <div className=" text-center">{channelName}</div>
              </div>
              <div className="">
                <div className="font-extrabold text-3xl">{title}</div>
                <div className=" max-h-60">{description}</div>
                <div className="">*Comment goes here*</div>
              </div>
            </div>
          </div>
        </div>

        <div className="related-videos overflow-y-scroll h-96 p-6">
          <GetAllVideos />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
