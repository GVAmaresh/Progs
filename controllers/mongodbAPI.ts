interface CreateChannelParams {
  key: string;
  channelName: string;
  channelDescription: string;
  email: string;
}

export const createChannelAPI = async ({
  key,
  channelName,
  email,
  channelDescription
}: CreateChannelParams): Promise<any> => {
  try {
    console.log(channelName, channelDescription, email);
    const response = await fetch(
      "http://localhost:4000/api/v1/channel/addChannel",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key,
          email,
          channelName,
          channelDescription
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating channel:", errorData);
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Channel created successfully:", data);

    return data;
  } catch (error) {
    console.error("Error creating channel:", error);
    throw error;
  }
};

export const getChannel = async ({ email }: { email: string }) => {
  try {
    console.log(email);
    const response = await fetch(
      `http://localhost:4000/api/v1/channel/getChannel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email
        })
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
      return null;
    }
    const data = response.json();
    return data;
  } catch (err: any) {
    console.log(err);
  }
};

interface IVideoData {
  key: string;
  email: string;
  channelName: string;
  videoName: string;
  videoDescription: string;
  thumbnail: string;
}

export const createVideoAPI = async (videoData: IVideoData) => {
  try {
    console.log(videoData);
    const response = await fetch(
      "http://localhost:4000/api/v1/videos/add-video",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(videoData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error creating video");
    }
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error creating video:", error);
    throw error;
  }
};

export const getVideoFromChannel = async ({
  channelName,
  email
}: {
  channelName: string;
  email: string;
}) => {
  try {
    const response = await fetch(
      "http://localhost:4000/api/v1/videos/get-video-channel",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ channelName, email })
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error creating video");
    }
    console.log(data);
    return data;
  } catch (err) {
    console.error("Error creating video:", err);
    throw err;
  }
};
