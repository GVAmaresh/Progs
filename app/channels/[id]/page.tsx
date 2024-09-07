"use client";
import GetAllVideos from "../../../components/AllVideosComp/page";
import Grid from "@mui/material/Grid";
import { CardMedia } from "@mui/material";
import CreateCompVideo from "../../../components/CreateComp/CreateComp";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUserDetails } from "../../../components/Accounts/accountMenu";
import { usePathname } from "next/navigation";
import { getVideoFromChannel } from "../../../controllers/mongodbAPI";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

interface IChannel {
  title: string;
  thumbnail: string;
  _id: string;
}

interface IChannelDescription {
  channelName: string;
  channelIcon:string;
  description:string;
}

const cloudfront = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT;

export default function ChannelPage({ params }: { params: { id: string } }) {

  const [newEmail, setNewEmail] = useState<string>("");
  const [channelName, setChannelName] = useState<string>("");
  const [channelDescription, setChannelDescription] = useState<IChannelDescription | null>(null);
  const [videoList, setVideoList] = useState<IChannel[]>([]);

  const answer = useUserDetails();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split("/");
      const lastSegment = pathSegments[pathSegments.length - 1];
      const decodedChannelName = decodeURIComponent(lastSegment);

      setChannelName(decodedChannelName);
    }
  }, [pathname]);

  useEffect(() => {
    if (answer.user) {
      setNewEmail(answer.user.email);
    }
  }, [answer]);

  useEffect(() => {
    const fetchVideos = async () => {
      if (newEmail && channelName) {
        const data = await getVideoFromChannel({
          channelName,
          email: newEmail
        });
        console.log(data);
        if (data) {
          setVideoList(data.data.videos);
          setChannelDescription(data.data.channel)
        }
      }
    };
    fetchVideos();
  }, [newEmail, channelName]);

  return (
    <>
    <SignedIn>
      <div className="ml-12 lg:ml-32">
        <div className="flex flex-row ml-3 lg:ml-12 gap-4">
          <CardMedia
            sx={{
              height: 140,
              width: 140,
              borderRadius: "50%",
              marginTop: ""
            }}
            image={`https://${cloudfront}/${channelDescription?.channelIcon}`}
          />
          <div className="mt-8 mr-20">
            <div className="font-extrabold text-xl lg:text-3xl">{channelDescription?.channelName}</div>
            <div className="bg-white h-1 mt-2 w-12 lg:w-20 rounded-xl"></div>
            <div className="">{channelDescription?.description}</div>
          </div>
        </div>
        <CreateCompVideo purpose="video" />
        <div className="mt-12">
          <div className="mt-20 justify-evenly">
            <Grid
              sx={{ flexGrow: 1 }}
              container
              spacing={1}
              justifyContent="center"
              marginTop={5}
            >
              <Grid item xs={11}>
                <Grid container justifyContent="center" spacing={2}>
                  {videoList.map((video) => (
                    <Grid
                      key={video._id}
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      className="justify-center"
                    >
                      <Link href={`/channels/edit-video/${video._id}`}>
                        <div className="h-52 w-80 bg-white rounded-3xl relative overflow-hidden">
                          <CardMedia
                            component="img"
                            image={`https://${cloudfront}/${video.thumbnail}`}
                            alt={video.title}
                            className="rounded-3xl"
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                          />
                          <div className="text-center text-white absolute bottom-0 w-full bg-black bg-opacity-50 py-2 rounded-b-3xl">
                            {video.title}
                          </div>
                        </div>
                      </Link>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
