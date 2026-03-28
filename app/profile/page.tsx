import { withAuth } from "@/src/features/auth/components/with-auth.hoc";
import { ProfileView } from "./components/profile-view.component";

const Page = () => {
  return <ProfileView />;
};

export default withAuth(Page);
