import Link from "next/link";
import Grid from "@mui/material/Grid";
import GetAllVideos from "../../../components/AllVideosComp/page";
import { CardMedia } from "@mui/material";

export default function ChannelPage({ params }: { params: { id: string } }) {
  return (
    <>
      <div className="ml-12 lg:ml-32">
        <div className=" flex flex-row ml-3 lg:ml-12">
          <div className="">
            <CardMedia
              sx={{
                height: 140,
                width: 140,
                borderRadius: "50%",
                marginTop: ""
              }}
              image="/images/avatar.png"
            />
          </div>
          <div className="mt-8 mr-20">
            <div className="font-extrabold text-xl lg:text-3xl">Title</div>

            <div className="bg-white h-1 mt-2 w-12 lg:w-20 rounded-xl"></div>
            <div className=""></div>description</div>
        </div>
        <div className="mt-12">
          <GetAllVideos gotoLink="/channels/edit-video/"/>
        </div>
      </div>
    </>
  );
}
