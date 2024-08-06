import { useContext, useEffect, useState } from "react";
import { CommentInput, CommentInputWrap, CommentListWrap, CommentWriteBtn } from "../../styles/dashboard/activityComment.styles";
import axios from "axios";
import { UserContext } from "../../App";
import CommentBlock from "./commentBlock";
import { useInView } from 'react-intersection-observer';

const ActivityCommentSection = (props) => {
  const [commentList, setCommentList] = useState([]);
  const { accessToken } = useContext(UserContext); //accessToken가져옴
  const [content, setContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 앞에있는 ref 는 우리가 관찰할 요소를 알려주는데 사용
  // 뒤에있는 useInView 는 관찰할 요소가 화면에 나타나면 true, 사라지면 false를 반환하는 변수 
  const [ref, inView] = useInView(); // useInView() 는 true or false 를 반환한다.

  // 댓글을 끝까지 다 가져왔다면 true 아니면 false
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    let tmp = async () => {
      if (accessToken === null) return;
      //inView가 false면 함수 종료
      if (inView === false) return;
      if (isEnd === true) return;

      try {
        // 3개씩 가져오기 
        let res = await axios.get(`/api/comments?activityId=${props.activityId}&limit=${3}&page=${currentPage}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })

        setCurrentPage(currentPage + 1);
        //댓글목록을 끝까지 다 가져온 상태라면 직접 화면에도 보이게 추가해준다.
        if (res.data.length === 0) {
          setIsEnd(true);
          return;
        }
        // 기존 댓글(commentList)과, 새로운 댓글을 추가해준다.
        setCommentList([...commentList, ...res.data]);
      } catch (err) {
        alert('댓글목록 오류');
      }
    }

    tmp();
  }, [props.activityId, accessToken, inView]);

  const onCommentClick = async () => {
    try {
      let res = await axios.post('/api/comments', {
        content,
        activityId: props.activityId
      },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (isEnd === true) {
        setCommentList([...commentList, res.data]);
      }

      alert('댓글작성 성공!');
      setContent('');
    } catch (err) {
      alert('댓글작성 오류');
    }
  }; //body에다가 content를 담아서 express로 보내준다.

  //댓글 id를 매개변수로 받아서 해당 id를 가진 댓글 삭제
  const onDeleteClick = async (commentId) => {
    let del = window.confirm('정말 삭제하시겠습니까?')
    //console.log(commentId) // true or false 로 나온다.  취소를 누르면 false 삭제를 누르면 true.
    if (del === false) return; // false 라면 삭제하지 않는다. 

    // true 라면 삭제한다. (확인버튼을 누르면 삭제)
    // express 에게 삭제할 댓글의 id를 보내준다.(삭제요청)
    try {
      let res = await axios.delete('/api/comments', { data: { commentId } });

      // commentList에서 comment.id가 commentId와 같지 않은 것들만 남긴다. (삭제된 댓글만 빼고 다시 commentList에 넣어준다.)  
      setCommentList(commentList.filter((comment) => comment.id !== commentId));
      alert(res.data);
    } catch (err) {
      alert('댓글삭제 오류');
    }
  }

  return (
    <section>
      <CommentInputWrap>
        <CommentInput onChange={(e) => { setContent(e.target.value) }} value={content} />
        <CommentWriteBtn onClick={onCommentClick}>댓글달기</CommentWriteBtn>
      </CommentInputWrap>
      <CommentListWrap>
        {
          commentList.map((comment) =>
            <CommentBlock
              key={comment.id}
              onDeleteClick={onDeleteClick}
              comment={comment}
            />)
        }
      </CommentListWrap>
      <div ref={ref}></div>
    </section>
  );
}

export default ActivityCommentSection;