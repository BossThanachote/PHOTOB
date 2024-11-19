import Link from "next/link"
export default function BannerForm(){
    return(
        <>
            <div className="bg-border bg-[#9B1C27] h-full flex justify-center md:flex hidden select-none">
                <header className="flex flex-col w-[70%] justify-center items-center
                lg:h-[100%]  
                "
                >
                <div className="border-2 border-solid border-transparent w-full h-[0rem] bg-[#9B1C27] xl:h-[0rem]"></div>
                    <h1 className="text-[2.5rem] tracking-[1.5rem] text-white mb-10 ">LOGO</h1>
                    <h1 className="text-[2.5rem] tracking-[1.5rem] text-white mb-3">BANNER</h1>
                    <p className="text-base text-white text-center">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minus maxime id aspernatur iure.</p>
                    <div className="border-2 border-solid border-transparent w-full h-[10rem] bg-[#9B1C27] xl:h-[10rem]"></div>
                    <div className="flex flex-col justify-center items-center mt-[10rem]">
                        <p className="text-base text-white">Already a Member ? 
                            <Link href="/admin/signin">
                                <span className="font-bold"> Login</span>
                            </Link>
                        </p>

                        <p className="text-center text-white mt-20">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas sunt optio id 
                            veniam itaque tempora. Debitis temporibus possimus deserunt ut enim quidem 
                            doloremque. Animi ad dicta ex eveniet vero nisi.
                        </p>
                    </div>
                </header>
            </div>
        </>
    )
}