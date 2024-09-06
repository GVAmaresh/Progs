// pages/channel.tsx

"use client";
import { CardMedia, Link } from "@mui/material";
import Grid from "@mui/material/Grid";
import Comp from "../../components/CreateComp/Comp";
import { useEffect, useState } from "react";
import { useUserDetails } from "../../components/Accounts/accountMenu";
import { getChannel } from "../../controllers/mongodbAPI";
import Image from "next/image";

const cloudfront = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT;

interface IChannel {
  channelIcon: string;
  channelName: string;
  createdAt: string;
  description: string;
  email: string;
  subscribersCount: number;
}

export default function Channel() {
  const [newEmail, setNewEmail] = useState<string>("");
  const [channelList, setChannelList] = useState<IChannel[]>([]);
  const answer = useUserDetails();
  console.log(cloudfront);

  useEffect(() => {
    if (answer.user) {
      setNewEmail(answer.user.email);
    }
  }, [answer]);

  useEffect(() => {
    if (newEmail) {
      const fetchData = async () => {
        const data = await getChannel({ email: newEmail });
        console.log(data);
        if (data) {
          setChannelList(data.data);
        }
      };
      fetchData();
    }
  }, [newEmail]);

  return (
    <>
      <div className="ml-12 lg:ml-32">
        <div className=" font-extrabold text-xl lg:text-3xl">Channel Page</div>
        <div className="bg-white h-1 mt-2 w-12 lg:w-20 rounded-xl"></div>
        <div className="mt-8">
          <Comp purpose="channels" />
        </div>
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
                  {channelList.map((channel, index) => (
                    <Grid
                      key={index}
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      className=" justify-center"
                    >
                      <Link
                        href={`/channels/${channel.channelName}`}
                        underline="none"
                        sx={{
                          textDecoration: "none"
                        }}
                      >
                        <div className="h-36 w-44 bg-white rounded-3xl">
                          <CardMedia
                            component="img"
                            image={`https://${cloudfront}/${channel.channelIcon}`}
                            alt={channel.channelName}
                            className="rounded-3xl"
                            sx={{
                              width: 200,
                              height: 200,
                              objectFit: "cover"
                            }}
                          />
                          <div className="text-center text-white no-underline">
                            {channel.channelName as string}
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
