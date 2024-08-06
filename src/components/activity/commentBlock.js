import { useState, useContext } from 'react';
import { CommentItem, CommentHeader, CommentWriter, CommentDate, CommentBtn, Comment } from '../../styles/dashboard/activityComment.styles';
import axios from 'axios';
import { UserContext } from '../../App';

const CommentBlock = (props) => {
  let onDeleteClick = props.onDeleteClick;

  const [comment, setComment] = useState(props.comment);
  const [isEdit, setIsEdit] = useState(false);
  const [content, setContent] = useState(comment.content);

  const { accessToken } = useContext(UserContext);

  const onEditClick = async () => {
    //express 에게 수정할 댓글의 id와 수정할 내용을 보내준다.(수정요청)
    try {
      let res = await axios.put('/api/comments', {
        commentId: comment.id,
        content
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      //res.data -> 수정된 댓글이 객체로 들어온다.
      setIsEdit(false);
      setComment(res.data);
      alert('댓글수정 성공');
    } catch (err) {
      alert('댓글수정 오류');
    }
  }

  return (
    <CommentItem key={comment.id}>
      <CommentHeader>
        <CommentWriter>
          작성자 id : {comment.writer_email}
        </CommentWriter>
        <CommentDate>(작성일){comment.created_date}</CommentDate>
        <CommentDate>(수정일){comment.updated_date}</CommentDate>
        {comment.owner &&
          <CommentBtn
            onClick={() => { onDeleteClick(comment.id) }}
          >삭제</CommentBtn>
        }
      </CommentHeader>
      {isEdit ? <input
        onBlur={onEditClick}
        onChange={(e) => { setContent(e.target.value); }}
        value={content} /> :
        <Comment onClick={() => {
          if (!comment.owner) return;
          setIsEdit(true)
        }} >{comment.content}</Comment>
      }
    </CommentItem>
  );
}
export default CommentBlock;