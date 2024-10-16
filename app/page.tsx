import Image from "next/image";
import Main from "./pages/Main";
import Format from "./pages/Format";
import Selfie from "./pages/Selfie";
import Quantity from "./pages/Quantity";
import Download from "./pages/Download";
import Save from "./pages/Save";

export default function Home() {
  return (
    <>
    <main className="app transition-all ease-in ">
      <Main />
      <Format />
      <Selfie />
      <Quantity />
      <Download />
      <Save />
    </main>
    </>
  );
}
