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
import Select from "../pages_booth/Select";
import Custom from "../pages_booth/Custom";

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
                <Select />
                <Custom />
                <Quantity />
                <Download />
                <Save />
            </main>
        </>
    )
}