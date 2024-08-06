import { AddBox } from "../../styles/dashboard/career.styles";
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../App";
import CareerRow from "./careerRow";

const CareerViewTable = () => {
  const [careerList, setCareerList] = useState([]);
  //2 state 변수 4개, 사용자가 input 태그에 입력한 값을 기억 용도
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { accessToken, setAccessToken } = useContext(UserContext);

  //전체 체크가 되었는지 아닌지 확인하기 위한 state변수
  const [isSelectAll, setIsSelectAll] = useState(false);

  const [checkedRowId, setCheckedRowId] = useState([]); //체크된 행의 id를 담을 배열. 처음에는 빈배열 (체크된게없음 아직) 

  useEffect(() => {
    //CareerViewTable 컴포넌트가 화면에 보여질 때 실행되는 코드 
    const fetchCareerList = async () => {
      if (accessToken === null) return;
      try {
        let res = await axios.get('/api/career',
          { headers: { Authorization: `Bearer ${accessToken}` } }//토큰을 보내줘야한다.
        );
        setCareerList(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchCareerList();
  }, [accessToken]);

  const onAddCareer = async () => {
    // console.log(company, position, startDate, endDate);
    if (company === '') {
      alert('회사명을 입력해주세요');
      return; //company가 비어있으면 (return으로 바로 종료시키고 alert창이 뜬다)
    }

    if (position === '') {
      alert('직책을 입력해주세요');
      return;
    }

    if (startDate === '') {
      alert('시작일을 입력해주세요');
      return;
    }

    const today = new Date('');
    const targetStartDate = new Date(startDate);
    if (targetStartDate > today) {
      alert('시작일은 오늘 날짜보다 늦을 수 없습니다.');
      return;
    }

    //종료일은 비어있어도 됨
    if (endDate === '') { //🌟 invalid date, 오류 발생을 방지하기 위해서, "종료일이 비어있으면", 이라는 코드도 작성 중요! 
      const targetEndDate = new Date(endDate);
      if (targetEndDate < targetStartDate) {
        alert('종료일은 시작일보다 빠를 수 없습니다.');
        return;
      }
      if (targetEndDate > today) {
        alert('종료일은 오늘 날짜보다 늦을 수 없습니다.');
        return;
      }
    }
    try {
      let res = await axios.post('/api/career',
        {
          company, position, startDate, endDate
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      //res.data에는 방금 추가한 "객체"가 들어있음
      //4개의 데이터를 담아서 줘야함
      //성공했을때 뭔가 할것
      alert('추가 완료!');
      //window.location.reload(); //새로고침
      //console.log(res.data)
      setCareerList([...careerList, res.data]);
      console.log([...careerList, res.data]);
    } catch (err) {
      console.log(err);
    }
  }

  const onDeleteCareer = async (id) => {
    //id를 가지고 express한테 삭제 요청
    //id에는 몇번 객체가 삭제되는지에 대한 정보가 들어있음
    try {
      //id를 {}로 감싸서 body에다가 담아줌
      let res = await axios.delete('/api/career/', { data: { id } });
      alert('삭제 완료!');

      //삭제한 id를 제외한 나머지 요소들만 뽑아서 새로운 배열을 만들어서
      //careerList state 변수에 넣어준다.
      let newCareerList = careerList.filter((e) => e.id !== id);
      setCareerList(newCareerList);
    } catch (err) {
      alert('삭제 실패!');
    }
  }

  const deleteAll = async () => {
    //기본 careerList 에서 삭제한 요소들을 제외한 배열 만들기
    let cpy = [...careerList];

    try {
      for (let i = 0; i < checkedRowId.length; i++) {//삭제가 체크된 체크박스 만큼 반복이 된다
        let id = checkedRowId[i];
        await axios.delete('/api/career', { data: { id: id } })
        console.log(cpy)
        cpy = cpy.filter((row) => row.id !== id);
      }
      setCareerList(cpy); //반복이 다 끝나면,  setCareerList(cpy)로 "한번"에 마지막 상태를 5번 삭제해준다.
      alert('삭제 완료!')
    } catch (err) {
      console.log(err)
      alert('삭제 하는 도중 문제가 발생하였습니다. ');
    }
  }

  //전체선택 (표의 헤더부분에 있는 체크박스 클릭시 실행)
  const onSelectedAll = (e) => {
    // console.log(e.target.checked); //클릭하면 true가 나옴 
    // setIsSelectAll(e.target.checked);
    if (e.target.checked) { //전체선택이 되었으면
      setCheckedRowId(careerList.map((e) => e.id));
      setIsSelectAll(true); //🌟 ture 일때 
    } else { //체크 해제되어 실행된다면
      setCheckedRowId([]); //배열을 비워준다.
      setIsSelectAll(false); //🌟 false 일때 
    }
    console.log(isSelectAll);
  }

  const onSelect = (e, id) => {
    console.log(e.target.checked);
    console.log(id);
    //체크가 되었으면 배열에 id를 추가
    //체크가 해제되었으면 배열에서 id를 제거
    if (e.target.checked) {
      //배열에 id를 추가
      setCheckedRowId([...checkedRowId, id]); //기존에 배열에 추가한 id를 넣어줘
    } else {
      // 배열에서 id를 제거
      let newCheckedRowId = checkedRowId.filter((e) => e !== id);
      setCheckedRowId(newCheckedRowId);
    }
  }

  return (
    <section>
      <AddBox style={{ marginBottom: '50px' }}>
        <thead>
          <tr>
            <th rowSpan={2}>회사명(활동)</th>
            <th rowSpan={2}>직책(활동내용)</th>
            <th colSpan={2}>활동 일자</th>
          </tr>
          <tr>
            <th>시작일</th>
            <th>종료일</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {/* 값이 변경될때마다 setCompany안에 저장된다.*/}
            <td><input onChange={e => setCompany(e.target.value)} /></td>
            <td><input onChange={e => setPosition(e.target.value)} /></td>
            <td><input onChange={e => setStartDate(e.target.value)} type="date" /></td>
            <td><input onChange={e => setEndDate(e.target.value)} type="date" /></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>
              {/* 추가버튼을 클릭하면 onAddCareer function이 실행됨 */}
              <button onClick={onAddCareer}>추가하기</button>
            </td>
          </tr>
        </tfoot>
      </AddBox>
      <AddBox>
        <thead>
          <tr>
            <th><input
              type="checkbox"
              onClick={onSelectedAll}
              checked={isSelectAll}
            /></th>
            <th>회사명</th>
            <th>직책</th>
            <th>일자</th>
            <th onClick={deleteAll}><DeleteSweepIcon /></th>
          </tr>
        </thead>
        <tbody>
          {careerList.map((e) =>
            <CareerRow
              key={e.id}
              career={e}
              checkedRowId={checkedRowId}
              onDeleteRow={onDeleteCareer}
              onSelect={onSelect}
            />)}
        </tbody>
      </AddBox>
    </section>
  )
}

export default CareerViewTable;