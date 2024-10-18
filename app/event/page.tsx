import Main from "../pages_event/Main";
import Format from "../pages_event/Format";
import Selfie from "../pages_event/Selfie";
import Quantity from "../pages_event/Quantity";
import Download from "../pages_event/Download";
import Save from "../pages_event/Save";

export default function EventPage() {
    return (
      <main className="app transition-all ease-in">
        <Main />
        <Format />
        <Selfie />
        <Quantity />
        <Download />
        <Save />
      </main>
    );
  }