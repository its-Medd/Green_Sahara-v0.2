import AppLayout from "./AppLayout";
import { providerMenu } from "../features/navigation";

function ProviderLayout(props) {
  return <AppLayout {...props} menu={providerMenu} />;
}

export default ProviderLayout;
