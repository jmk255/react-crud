import {useContext, useEffect } from "react";
import {UserContext} from "../../App";
import { useNavigate } from "react-router-dom";

// accessToken이 있는지 없는지 검사하는 hook함수
export const useAuth = ()=>{  //다른데서 사용가능하게 export해줌
  //전역 state변수 가져오기(App.js에서)
  const {accessToken, setAccessToken} = useContext(UserContext);
  const navigate = useNavigate();
  useEffect(()=>{
    //1. 로그인이 안된 상태 localStorage의 accessToken null, 
    //    전역 상태변수 accessToken null
    if(localStorage.getItem('accessToken') === null){
      alert('로그인이 필요한 페이지 입니다!');
      navigate('/login', {replace : true});
      return;
    }

    // 2. 로그인은 되었으나 새로고침한 상태 accessToken 있음,
    //    전역 상태변수 accessToken null
    if(accessToken === null){
      setAccessToken(localStorage.getItem('accessToken'));
      return;
    }

    // 3. 로그인 되었고, 새로고침도 안함
    // localStorage에 accessToken 있음,
    //  전역 상태변수 accessToken 있음
    
  }, [accessToken, setAccessToken, navigate]); //accessToken, setAccessToken, navigate 바뀌면 실행시켜줘
}