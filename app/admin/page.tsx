import BannerForm from "../pages_admin/banner-form"
import SignIn from "../pages_admin/register-form"
export default function AdminDashBoard(){
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