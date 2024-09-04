import React from "react";
import Grid from "@mui/material/Grid";
import VideoComp from "./VideoComp";
import Link from "next/link";

export default function GetAllVideos({
  gotoLink = "video/"
}: {
  gotoLink: string;
}) {
  return (
    <>
      <div className="mt-20 ">
        <Grid
          sx={{ flexGrow: 1 }}
          container
          spacing={1}
          justifyContent="center"
          marginTop={5}
        >
          <Grid item xs={11}>
            <Grid container justifyContent="center" spacing={4}>
              {Array.from({ length: 10 }, (_, index) => (
                <Grid key={index} item xs={12} sm={6} md={4} lg={4}>
                  <Link href={`${gotoLink}id={data.key}`}>
                    <VideoComp />
                  </Link>
                </Grid>
              ))}
              {/* {Object.values(10).map( index=> (
                <Grid key={index} item xs={6} sm={3}>
                  <VideoComp/>
                </Grid>
              ))} */}
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
}
