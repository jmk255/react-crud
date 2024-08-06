import DashboardLayout from "../../components/common/layout";
import ActivitySection from "../../components/activity/activitySection";
import { useAuth } from "../../components/hooks/hooks";

const ActivityPage = ()=>{
  useAuth();
  return(
    <DashboardLayout target="활동게시판">
      <h1>활동 게시판 페이지 입니다</h1>
      <p>다양한 사람들의 다양한 활동을 경험해 보세요~</p>
      <ActivitySection />
    </DashboardLayout>
  );
}

export default ActivityPage;