import { useState, useEffect, useContext } from "react";
import { BoardContent, BoardDetailWrap, BoardInfoWrap, BoardTitle, WriteBtn } from "../../styles/dashboard/activityDetail.styles";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from "axios";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";

const ActivityDetailSection = (props) => { //props받고 (activityDetail에서)
  const navigate = useNavigate();
  // const params = useParams();
  //const [isLiked, setIsLiked] = useState(false); //좋아요 여부
  const { accessToken } = useContext(UserContext);

  //게시글 정보
  const [activity, setActivity] = useState({
    id: 0,
    title: '제목이 올 자리',
    content: '내용이 올 자리',
    writer_email: '이메일이 올 자리',
    created_date: '작성일이 올 자리',
    updated_date: '수정일이 올 자리',
    activity_view: 0,
    activity_like: 0,
    liked: '',
    img_url: [],
    owner: false // 초기값 false로 설정
  });

  useEffect(() => {
    let tmp = async () => {
      if (accessToken === null) return;
      try {
        let res = await axios.get(`/api/activities/${props.activityId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        //console.log(res.data)
        setActivity(res.data); //조회수증가
        // setIsLiked(res.data.liked === 'yes');
      } catch (err) {
        console.log(err);
        alert('오류가 발생했어요.')
      }
    }
    tmp();
  }, [props.activityId, accessToken]);

  const onLikeClick = async () => {
    if (activity.liked === 'yes') {
      try {
        let res = await axios.delete('/api/like', {
          data: { id: activity.id },
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setActivity({ ...activity, liked: 'no', activity_like: activity.activity_like - 1 });
        console.log(res.data);
      } catch (err) {
        console.log(err);
        alert('좋아요 현재 수정 불가');
      }
    } else {
      try {
        let res = await axios.post('/api/like',
          { id: activity.id },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setActivity({ ...activity, liked: 'yes', activity_like: activity.activity_like + 1 });
        console.log(res.data);
      } catch (err) {
        console.log(err);
        alert('좋아요 오류');
      }
    }
  }

  const onUpdate = () => {
    navigate(`/activityUpdate/${activity.id}`, { replace: true });
  }

  const onDeleteClick = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/activities/${props.activityId}`, {
          //  게시글 id 는 props로 받아옴
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        navigate('/activity', { replace: true });
      } catch (err) {
        console.log(err);
        alert('삭제 오류');
      }
    }
  }

  return (
    <section>
      <BoardDetailWrap>
        <BoardTitle>
          {activity.title}
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span>좋아요:{activity.activity_like}</span>
            <span onClick={onLikeClick}>
              {activity.liked === 'yes' ? <FavoriteIcon style={{ color: 'red' }} /> : <FavoriteBorderIcon />}
            </span>
          </div>
        </BoardTitle>
        <BoardInfoWrap>
          <p>작성자</p>
          <p>{activity.writer_email}</p>
          <p>조회수</p>
          <p>{activity.activity_view}</p>
        </BoardInfoWrap>
        <BoardInfoWrap>
          <p>작성일자</p>
          <p>{activity.created_date}</p>
          <p>수정일자</p>
          <p>{activity.updated_date}</p>
        </BoardInfoWrap>
        <BoardContent>
          {activity?.img_url.map((img) => <div>
            <img style={{ width: '100%' }} src={img} alt="이미지" />
          </div>)}
          {activity?.content}
        </BoardContent>
        {
          activity?.owner &&
          <div style={{
            alignSelf: 'flex-end',
            display: 'flex',
            columnGap: '10px'
          }}>
            <WriteBtn onClick={onUpdate}>수정하기</WriteBtn>
            <WriteBtn
              onClick={onDeleteClick}
              style={{ backgroundColor: 'red' }}>삭제하기
            </WriteBtn>
          </div>
        }
      </BoardDetailWrap>
    </section>
  )
}
export default ActivityDetailSection;