"use client"

import { useParams } from "next/navigation";

export default function OpeVideo(){
    const params = useParams();
    console.log("hello");
    console.log(params?.id);

    return <div>My Post:</div>
}