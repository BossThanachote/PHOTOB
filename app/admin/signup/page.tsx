import BannerForm from "@/app/pages_admin/banner-form";
import SignUp from "@/app/pages_admin/regis-form";

export default function AdminRegis(){
    return(
        <>
        <div className="grid grid-cols-10 w-full h-screen">
            <div className="md:col-span-6 col-span-0">
                <BannerForm />
            </div>
            <div className="md:col-span-4 col-span-10">
                <SignUp />
            </div>
        </div>
        </>
    )
}