import SaccoSettingsManager from "@/components/settings/SaccoSettingsManager";

export const metadata = { title: "SACCO profile" };

export default function SaccoProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <SaccoSettingsManager mode="admin" />
    </div>
  );
}
