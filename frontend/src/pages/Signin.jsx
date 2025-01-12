import { useNavigate } from "react-router-dom"
import { BottomWarning } from "../components/BottomWarning"
import { Button } from "../components/Button"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/InputBox"
import { useState } from "react"
import { SubHeading } from "../components/SubHeading"
import video_mount from '../assets/a_mount.mp4'
import google from '../assets/google.png'

export const Signin=()=>
{
    const navigate =useNavigate();
    const [userName,setUserName] = useState("");
    const [password,setPassword] = useState("");
    return <div className="relative h-screen w-screen">
            <video
                src={video_mount} 
                autoPlay
                loop
                muted
                className="absolute top-0 left-0 w-full h-full object-cover">
            </video>
            <div className="absolute top-0 left-0 w-1/3 h-full flex items-center justify-center flex-col">
                <div className="text-3xl font-extrabold text-[#12233D]">
                    Welcome to
                </div>
                <div className="text-5xl font-extrabold text-white">
                    Fantasy<span className="text-yellow-300">2</span>Reality
                </div>
            </div>
                <div className="absolute top-0 right-0 w-1/3 h-full flex items-center">
                    <div className="rounded-lg bg-white w-100 p-2 h-max px-6">
                        <Heading label={"Sign In"}></Heading>
                        <SubHeading label={"Enter your information to access your account"}></SubHeading>
                        <InputBox onChange={e=>{
                            setUserName(e.target.value);
                        }} label={"E-mail"} placeholder="snehachandna8@gmail.com"></InputBox>
                        <InputBox onChange={e=>{
                            setPassword(e.target.value);
                        }} label={"Password"} placeholder="123456789#@!"></InputBox>
                        <div className="pt-4">
                        <Button onClick={() => navigate("/dashboard")} label={"SignIn"}></Button>
                        </div>
                         <div className="pt-3 flex items-center justify-center">
                            <button
                                className="flex items-center justify-center w-full border rounded-md py-2 text-gray-700 hover:bg-gray-100 transition duration-200"
                                >
                                <img
                                    src={google}
                                    alt="Google Logo"
                                    className="w-5 h-5 mr-2"
                                />
                                    Sign Up with Google
                            </button>
                        </div>
                        <BottomWarning label={"Don't have an account?"} buttontext={"Sign Up"} to={"/signup"}></BottomWarning>
                    </div>
                </div>
            </div>
}