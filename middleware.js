import { NextResponse } from "next/server";

export default function middleware(req){
    let verify = req.cookies.get("Explore");
    let url = req.url;

    if(!verify && url.includes('/dashboard')){
        return NextResponse.redirect('http://localhost:3000/');
    }

    if(verify && url === "http://localhost:3000/"){
        return NextResponse.redirect('http://localhost:3000/dashboard');
    }
}