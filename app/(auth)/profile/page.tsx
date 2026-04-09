import { calc } from "@/lib/calc/calc.util";
import { withAuth } from "@/src/features/auth/components/HOCS/with-auth/with-auth.hoc";
import { ProfileView } from "./components/profile-view.component";

const Page = () => {
  console.log(
    calc({
      value: 10,
      formulas: [{ formula: "{init} + 5" }, { formula: "{step_0} + 5" }],
    }),
  ); // TODO: remove console.log
  return <ProfileView />;
};

export default withAuth(Page);
