import BannerForm from "@/app/pages_admin/banner-form";
import Verify from "@/app/pages_admin/verify-form";

export default function AdminVerify(){
    return(
        <>
        <div className="grid grid-cols-10 w-full h-screen">
            <div className="md:col-span-6 col-span-0">
                <BannerForm />
            </div>
            <div className="md:col-span-4 col-span-10">
                <Verify />
            </div>
        </div>
        </>
    )
}