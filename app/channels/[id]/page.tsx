"use client"
import GetAllVideos from "../../../components/AllVideosComp/page";
import Grid from "@mui/material/Grid";
import { CardMedia } from "@mui/material";
import CreateCompVideo from "../../../components/CreateComp/CreateComp";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUserDetails } from "../../../components/Accounts/accountMenu";
import { usePathname } from "next/navigation";
import { getVideoFromChannel } from "../../../controllers/mongodbAPI";

interface IChannel {
  title: string;
  thumbnail: string;
  _id: string;
}

const cloudfront = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT;

export default function ChannelPage({ params }: { params: { id: string } }) {
  console.log(cloudfront)
  const [newEmail, setNewEmail] = useState<string>("");
  const [channelName, setChannelName] = useState<string>("");
  const [videoList, setVideoList] = useState<IChannel[]>([]);

  const answer = useUserDetails();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split("/");
      const lastSegment = pathSegments[pathSegments.length - 1];
      setChannelName(lastSegment);
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
        const data  = await getVideoFromChannel({
          channelName,
          email: newEmail
        });
        console.log(data);
        if (data) {
          setVideoList(data.data);
        }
      }
    };
    fetchVideos();
  }, [newEmail, channelName]);

  return (
    <>
      <div className="ml-12 lg:ml-32">
        <div className="flex flex-row ml-3 lg:ml-12">
          <CardMedia
            sx={{
              height: 140,
              width: 140,
              borderRadius: "50%",
              marginTop: ""
            }}
            image="/images/avatar.png"
          />
          <div className="mt-8 mr-20">
            <div className="font-extrabold text-xl lg:text-3xl">Title</div>
            <div className="bg-white h-1 mt-2 w-12 lg:w-20 rounded-xl"></div>
            <div className="">description</div>
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
                      <Link
                        href={`/video/${video._id}`}
                      >
                        <div className="h-36 w-44 bg-white rounded-3xl">
                          <CardMedia
                            component="img"
                            image={`https://${cloudfront}/${video.thumbnail}`}
                            alt={video.title}
                            className="rounded-3xl"
                            sx={{
                              width: 200,
                              height: 200,
                              objectFit: "cover"
                            }}
                          />
                          <div className="text-center text-white no-underline">
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
    </>
  );
}
