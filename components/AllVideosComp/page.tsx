"use client";
import React, { useEffect, useState, useRef } from "react";
import Grid from "@mui/material/Grid";
import VideoComp from "./VideoComp";
import Link from "next/link";

interface Video {
  _id: string;
  thumbnail: string;
  title: string;
  channelID: {
    channelName: string;
    channelIcon: string;
  };
}

export default function GetAllVideos({
  gotoLink = "video"
}: {
  gotoLink?: string;
}) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const existingVideoIds = useRef<Set<string>>(new Set());

  const fetchVideos = async (page: number) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/videos/get-all-videos?page=${page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();
      console.log(data);

      if (data.success && data.data.length > 0) {
        const newVideos = data.data.filter((video: Video) => !existingVideoIds.current.has(video._id));
        
        // Update the existing video IDs set
        newVideos.forEach((video:any) => existingVideoIds.current.add(video._id));

        if (newVideos.length > 0) {
          setVideos((prev) => [...prev, ...newVideos]);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchVideos(0);
    setInitialLoad(false);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !initialLoad) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasMore, initialLoad]);

  useEffect(() => {
    if (page > 0) fetchVideos(page);
  }, [page]);

  return (
    <>
      <div className="mt-20">
        <Grid container spacing={1} justifyContent="center" marginTop={5}>
          <Grid item xs={11}>
            <Grid container justifyContent="center" spacing={4}>
              {videos.map((video, index) => (
                <Grid key={video._id} item xs={12} sm={6} md={4} lg={4}>
                  <Link href={`${gotoLink}/${video._id}`}>
                    <VideoComp
                      thumbnail={video.thumbnail}
                      title={video.title}
                      channelName={video.channelID.channelName}
                      channelIcon={video.channelID.channelIcon}
                    />
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        {hasMore && (
          <div
            ref={observerRef}
            style={{ height: "20px", marginBottom: "20px" }}
          />
        )}
      </div>
    </>
  );
}
