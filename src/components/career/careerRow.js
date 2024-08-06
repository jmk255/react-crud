import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import { useState, useRef, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../App";



const CareerRow = (props) => {
  // 만일 isEdit에 true가 들어있으면 해당 행이 수정 상태임 을 의미하고
  // isEdit에 false가 들어있으면 해당 행이 수정상태가 아님 을 의미한다
  const [isEdit, setIsEdit] = useState(false);
  const companyInputRef = useRef();
  const positionInputRef = useRef();
  const startDateInputRef = useRef();
  const endDateInputRef = useRef();
  const { accessToken } = useContext(UserContext); //전역변수에 저장한거를 가져온다 accessToken안에 토큰이 들어있다. 
  
  // 상태를 수정상태로 변경해주는 함수
  const onEditState = () => {
    setIsEdit(true);
  };

  const dateFormat = (date) => {
    // '2023년10월01일' --> '2023-10-01'
    return date
      .replace("년", "-")
      .replace("월", "-")
      .replace("일", "")
      .replace(/ /g, "");  // / /g --> 모든 띄어쓰기 공백 을 의미
  };

  // props.career = e;
  // props.checkedRowId
  const e = props.career;
  const { checkedRowId, onSelect, onDeleteRow } = props;

  const onEditClick = async (id) => {
    // id에는 수정할 행의 id가 들어있음
    // 수정하기 버튼 클릭시 실행될 함수
    // 1. 사용자가 입력한 company, postion, startDate, endDate 가져오기
    const company = companyInputRef.current.value;
    const position = positionInputRef.current.value;
    const startDate = startDateInputRef.current.value;
    const endDate = endDateInputRef.current.value;

    // 유효성 검사
    if (company === '') {
      alert('회사명은 필수입력입니다');
      return;
    }
    if (position === '') {
      alert('직책은 필수입력 입니다');
      return;
    }
    if (startDate === '') {
      alert('시작일은 필수입력 입니다');
      return;
    }
    const today = new Date();
    const startDateTmp = new Date(startDate);

    if (startDateTmp > today) {
      alert('시작일은 오늘 날짜를 넘어가면 안됩니다');
      return;
    }

    if (endDate !== '') {
      const endDateTmp = new Date(endDate);
      if (endDateTmp < startDateTmp) {
        alert('종료일은 시작일보다 이전으로 설정할 수 없습니다')
        return;
      }

      if (endDateTmp > today) {
        alert('종료일은 오늘 날짜를 넘어가면 안됩니다');
        return;
      }
    }
    
    // 유효한 값들이 입력되었음을 확인한다면
    // express 서버에 입력한 값들을 전달하여 수정 요청하기
    try {
      await axios.put('/api/careers', { company, position, startDate, endDate, id }, // body에 넣어서
        { headers: { Authorization: `Bearer ${accessToken}` } } //로그인했을때만 사용할수있으니까, headers에 토큰 전달.
      )
      alert('수정완료~!');
      setIsEdit(false); // 수정이 완료된후, -> 수정상태를 false 로바꾸기
      // e 안에 있는 company, position , startDate, endDate 변경
      e.company = company;
      e.position = position;
      e.start_date = startDate;
      e.end_date = endDate;
    } catch (err) {
      console.log(err);
      alert('오류발생');
    }
  }

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={checkedRowId.includes(e.id)}
          onChange={(event) => onSelect(event, e.id)}
        />
      </td>
      <td onClick={onEditState}>
        {isEdit ? <input ref={companyInputRef} defaultValue={e.company} /> : e.company}
      </td>
      <td onClick={onEditState}>
        {isEdit ? <input ref={positionInputRef} defaultValue={e.position} /> : e.position}
      </td>
      <td onClick={onEditState} style={{ display: "flex" }}>
        {isEdit ? (
          <input ref={startDateInputRef} defaultValue={dateFormat(e.start_date)} type="date" />
        ) : (
          e.start_date
        )}
        -
        {isEdit ? (
          <input ref={endDateInputRef} type="date" defaultValue={dateFormat(e.end_date)} />
        ) : (
          e.end_date
        )}
      </td>
      <td onClick={() => {
        if (isEdit) {
          onEditClick(e.id);
        } else {
          onDeleteRow(e.id);
        }
      }}
        style={{
          cursor: "pointer",
        }}
      >
        {isEdit ? <EditIcon /> : <DeleteOutlineIcon />}
      </td>
    </tr>
  );
};

export default CareerRow;