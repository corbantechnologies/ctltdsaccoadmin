import GuideView from "@/components/guide/GuideView";
import adminGuide from "@/content/adminGuide";

export const metadata = { title: "Help & Guide" };

export default function AdminGuidePage() {
  return <GuideView markdown={adminGuide} />;
}
