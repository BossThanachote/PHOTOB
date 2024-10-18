import Alipay from "../pages_booth/Alipay";
import Coupon from "../pages_booth/Coupon";
import Download from "../pages_booth/Download";
import Format from "../pages_booth/Format";
import Main from "../pages_booth/Main";
import Payment from "../pages_booth/Payment";
import Quantity from "../pages_booth/Quantity";
import Save from "../pages_booth/Save";
import Selfie from "../pages_booth/Selfie";
import Thaiqr from "../pages_booth/Thaiqr";


export default function Store(){
    return(
        <>
            <main className="app transition-all ease-in ">
                <Main />
                <Format />
                <Payment />
                <Thaiqr />
                <Alipay />
                <Coupon />
                <Selfie />
                <Quantity />
                <Download />
                <Save />
            </main>
        </>
    )
}