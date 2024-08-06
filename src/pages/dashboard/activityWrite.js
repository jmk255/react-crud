import ActivityCU from "../../components/activity/activityCU";
import DashboardLayout from "../../components/common/layout";
import { useAuth } from "../../components/hooks/hooks";

const ActivityWritePage = () => {
  useAuth();
  return (
      <DashboardLayout target="활동게시판">
        <ActivityCU isEdit={false}/>
      </DashboardLayout>
  );
}

export default ActivityWritePage;