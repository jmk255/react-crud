import ActivityCU from "../../components/activity/activityCU";
import DashboardLayout from "../../components/common/layout";
import { useAuth } from "../../components/hooks/hooks";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ActivityUpdatePage = () => {
  useAuth();
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const params = useParams(); // URL 파라미터를 가져오기 위한 훅
  const { accessToken } = useContext(UserContext);
  const [activity, setActivity] = useState(null);

  //게시글 조회하기 
  useEffect(() => {
    const tmp = async () => {
      if (accessToken === null) return;
      try {
        let res = await axios.get(`/api/activities/${params.id}`, { //🌟(몇번?)게시물 가져와줘 라고 하는것
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (res.data.owner === false) {
          alert('잘못된 접근입니다~! 사유:작성자가 아님');
          navigate('/activity', { replace: true });
          return;
        }
        setActivity(res.data); //🌟그결과는 activity에 설정
      } catch (err) {
        console.log(err);
        alert('오류가 발생했어요');
      }
    }

    tmp();
  }, [accessToken]);


  return (
    <DashboardLayout target="활동게시판">
      {activity ? <ActivityCU activity={activity} isEdit={true} activityId={params.id} />
        : <h1>로딩중</h1>}
    </DashboardLayout>
  );
}

export default ActivityUpdatePage;