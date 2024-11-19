'use client'

import AuthGuard from "@/app/components/AuthGuard";
import SideBar from "@/app/pages_admin/sidebar-form";
import FrameManagement from "@/app/pages_admin/frame-form";

export default function AdminFrame() {
  return (
    <AuthGuard>
      <div className="grid grid-cols-10 w-full h-screen">
        <div className="col-span-10 sm:col-span-3 xl:col-span-2 col-span-0">
          <SideBar />
        </div>
        <div className="sm:col-span-7 xl:col-span-8 col-span-10">
          <FrameManagement />
        </div>
      </div>
    </AuthGuard>
  );
}