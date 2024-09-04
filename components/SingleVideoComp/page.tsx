import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import GetAllVideos from "../AllVideosComp/page";

interface IVideDetails extends Document{
  title:string;
  description: string;
  key:string
}
export default function GetSingleVideo({title="", description="", key=""}:IVideDetails) {
  return (
    <>
      <SignedIn>
        <div className="">
          <div className="flex flex-col md:flex-row p-6 pl-1 md:pl-24 pt-8">
            <div className="" style={{height:"360",width:"640"  }}>
              <video
                width="640" 
                height="360" 
                controls
                className="rounded-3xl"
              >
                <source
                  src="https://d1kcwss8shbz4z.cloudfront.net/Contents/b1f3765dde073f42bf48ede81a600a42"
                  type="video/mp4"
                />
              </video>
            </div>

            <div className="mt-12 w-full md:w-1/2">
              <div className="font-extrabold text-3xl">
              {title}
              </div>
              <div className=" overflow-y-scroll max-h-60">
                {description}
              </div>
              <div className="">*Comment goes here*</div>
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
