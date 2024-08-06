import { Main, MainWrapper, Wrapper } from "../../styles/common/layout.styles";
import DashboardFooter from "./footer";
import DashboardHeader from "./header";
import DashboardSidebar from "./sidebar";
import { useState } from "react";

const DashboardLayout = (props)=>{
  // 사이드바가 열려있는지 닫혀있는지 확인하는 스테이트 변수
  const [isOpen , setIsOpen] = useState(true);
  //props.target -> 경력
  return(
    <Wrapper isOpen={isOpen}>
      <DashboardSidebar isOpen={isOpen} target={props.target} />
      <MainWrapper>
        <DashboardHeader isOpen={isOpen} setIsOpen={setIsOpen} />
        <Main>
            {props.children}
        </Main>
        <DashboardFooter/>
      </MainWrapper>
    </Wrapper>
  );
}

export default DashboardLayout;