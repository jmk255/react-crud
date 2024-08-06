import { CardLikeButton, CardImg, CardWrap, CardContent, CardTitle, CardDetail } from "../../styles/dashboard/activityCard.styles";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import axios from "axios";

const ActivityCard = (props) => {
    //console.log(props.activity);
    const [isLiked, setIsLiked] = useState(props.activity.liked === 'yes'); //좋아요 여부
    const navigate = useNavigate();
    const { accessToken } = useContext(UserContext);
    
    const onLikeClick = async () => {
        if (accessToken === null) {
            alert('로그인 후 이용해주세요');
            navigate('/login');
            return;
        }
        if (isLiked === false) {
            try{
                await axios.post('/api/like', 
                    {id:props.activity.id} , 
                    {headers:{Authorization:`Bearer ${accessToken}`}}
                );
                setIsLiked(true);
            }catch(err){
                console.log(err);
                alert('현재 서버에 문제가 있어요 잠시후 다시 시도하세요');
            }
        }else{ 
            try{
                await axios.delete('/api/like', {
                    data : {id:props.activity.id}, 
                    headers:{Authorization:`Bearer ${accessToken}`} 
                });
                setIsLiked(false);
            }catch(err){
                console.log(err);
                alert('잠시후 다시 실행하세요');
            }
        }
    }

    return (
        <CardWrap>
            <CardImg imgURL={props.activity.img_url[0]}>
                <CardLikeButton onClick={onLikeClick}>
                    {isLiked ? <FavoriteIcon style={{ color: 'red' }} /> : <FavoriteBorderIcon style={{ color: 'white' }} />}
                </CardLikeButton>
            </CardImg>
            <CardContent>
                <CardTitle>{props.activity.title}</CardTitle>
                <CardDetail>{props.activity.content}</CardDetail>
                <CardDetail>
                    작성자: {props.activity.writer_email}
                </CardDetail>
                <CardDetail>
                    작성일자: {props.activity.created_date}
                </CardDetail>
                <CardDetail>
                    좋아요: {props.activity.activity_like}
                </CardDetail>
                <CardDetail>
                    조회수: {props.activity.activity_view}
                </CardDetail>
                <button onClick={() => {
                        navigate(`/activity/${props.activity.id}`);
                    }}>자세히 보기
                </button>
            </CardContent>
        </CardWrap>
    );
}

export default ActivityCard;