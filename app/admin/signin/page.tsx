import BannerForm from "@/app/pages_admin/banner-form"
import SignIn from "@/app/pages_admin/login-form"
export default function AdminLogin(){
    return(
        <>
        <div className="grid grid-cols-10 w-full h-screen">
            <div className="md:col-span-6 col-span-0">
                <BannerForm />
            </div>
            <div className="md:col-span-4 col-span-10">
                <SignIn />
            </div>
        </div>
        </>
    )
}