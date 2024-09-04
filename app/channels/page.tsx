import { Link } from "@mui/material";
import Grid from "@mui/material/Grid";

export default function Channel() {
  return (
    <>
      <div className="ml-12 lg:ml-32">
        <div className=" font-extrabold text-xl lg:text-3xl">Channel Page</div>
        <div className="bg-white h-1 mt-2 w-12 lg:w-20 rounded-xl"></div>
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
                  {Array.from({ length: 10 }, (_, index) => (
                    <Grid key={index} item xs={12} sm={6} md={4} lg={3} className=" justify-center">
                      <Link href={`/channels/id={data}`}>
                        <div className="h-36 w-44 bg-white rounded-3xl"></div>
                      </Link>
                    </Grid>
                  ))}
                  {/* {Object.values(data).map( index=> (
                <Grid key={index} item xs={6} sm={3}>
                  <VideoComp/>
                </Grid>
              ))} */}
                </Grid>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </>
  );
}
