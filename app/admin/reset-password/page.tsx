import BannerForm from "@/app/pages_admin/banner-form"
import ResetPassword from "@/app/pages_admin/reset-form"
export default function AdminForgotPassword(){
    return(
        <>
        <div className="grid grid-cols-10 w-full h-screen">
            <div className="md:col-span-6 col-span-0">
                <BannerForm />
            </div>
            <div className="md:col-span-4 col-span-10">
                <ResetPassword />
            </div>
        </div>
        </>
    )
}