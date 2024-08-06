import { useEffect, useState, useContext } from "react";
import { ActivityInput, ActivitySectionHeader, ActivitySelect, ActivityWriteBtn, ActivityBody, ActivityFooter } from "../../styles/dashboard/activity.styles.js";
import ActivityCard from "./activityCard";
import { Pagination } from "@mui/material";
import axios from "axios";
import { debounce } from 'lodash';
import { UserContext } from "../../App.js";
import { useNavigate } from "react-router-dom";

const ActivitySection = () => {
  const { accessToken } = useContext(UserContext);
  const cntPerPage = 4; // 한 페이지당 몇개씩 보여줄지 설정가능.  (4개로 설정함)
  const [activityList, setActivityList] = useState([]);
  const [totalPage, setTotalPage] = useState(1); //마지막 페이지 저장 하기 위한 state
  const [currentPage, setCurrentPage] = useState(1);
  const [order, setOrder] = useState('dateDesc'); //날짜 내림차순으로
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let tmp = async () => {
      try {
        if (accessToken === null) {
          return; //accessToken 이 null값이면 바로 종료;
        }
        let res = await axios.get(
          `/api/activities?order=${order}&limit=${cntPerPage}&page=${currentPage}&q=${searchText}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setTotalPage(Math.ceil(res.data.total_cnt / cntPerPage));
        setActivityList(res.data.activityList); //🌟2.data 받은것, 여기에 설정됨.
      } catch (err) {
        console.log(err);
        alert('잠시 게시글을 불러오다 문제가 발생했습니다');
      }
    }
    tmp(); //함수를 실행시켜야 위에  tmp() 함수가 실행된다.
  }, [currentPage, order, searchText, accessToken]); //accessToken 바꼇을때 다시 실행 

  const onPageChange = async (e, value) => {//매개변수두개, (이벤트, 클릭한값)
    setCurrentPage(value);
  };

  const onOrderChange = (e) => {
    setOrder(e.target.value); //클릭되는 순, (최신순 누르면 최신순, 오래된순 누르면 오래된순...)
  }

  const onSearchChange = debounce((e) => {
    setSearchText(e.target.value);
  }, 500);

  const onActivityCreate = () => {
    navigate('/activityWrite', {replace : true});
  }

  return (
    <section>
      <ActivitySectionHeader>
        <ActivityInput
          onChange={onSearchChange}
          placeholder="제목으로 검색"
        />
        <ActivitySelect
          value={order}
          onChange={onOrderChange}>
          <option value="dateDesc">최신순</option>
          <option value="dateAsc">오래된순</option>
          <option value="like">좋아요순</option>
          <option value="view">조회수순</option>
        </ActivitySelect>
        <ActivityWriteBtn
          onClick={onActivityCreate}
        >글 쓰기</ActivityWriteBtn>
      </ActivitySectionHeader>
      <ActivityBody>
        {
          activityList.map((el) =>
            <ActivityCard
              key={el.id}
              activity={el}
            />
          )
        }
      </ActivityBody>
      <ActivityFooter >
        <Pagination
          onChange={onPageChange}
          page={currentPage}
          count={totalPage} />
      </ActivityFooter>
    </section>
  )
}

export default ActivitySection;