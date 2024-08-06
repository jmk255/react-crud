import styled from "@emotion/styled";

export const DashboardAside = styled.aside`
  width: 240px;
  position: fixed;
  top: 0;
  left: ${(props)=> props.isOpen ? '0' : '-100%'};
  bottom: 0;
  overflow-y: scroll;
  transition: 300ms;

  display: flex;
  flex-direction: column;
  row-gap: 20px;
  padding: 0 20px;
  background-color: rgba(256, 256, 256, 0.8);

  &::-webkit-scrollbar{
    display: none;
  }
`;

export const AsideLogo = styled.div`
  height: 90px;
  /* margin-bottom: 50px; */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  column-gap: 10px;
  & > img{
    height: 100%;
  }
`;

export const AsideMenuItem = styled.div`
  cursor: pointer;
  transition: 500ms;
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 10px 20px;
  column-gap: 10px;
  font-size: 1rem;
  color: #18181B;
  position:relative;
  &:hover{
    background-color: #a2e9c1;
  }
  & > p{
    flex-grow: 1;
    margin: 0;
  }
  & > .sub-icon{
    position: absolute;
    left: -13px;
    top: 7px;
  }

  & > svg{
    font-size: 16px;
  }

  ${(props)=> props.active && 
    {backgroundColor : '#a2e9c1' }
  }

`;

export const Menu = styled.ul`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
`;

export const SubMenu = styled.ul`
  display: flex;
  flex-direction: column;
  row-gap: 3px;
  margin-top: 3px;
  padding-left: 35px;
`;

export const LogoText = styled.p`
  font-size: 1.7rem;
  font-weight: bold;
  color: #06b7db;
`;

export const UserText = styled.p`
  font-size: 1.7rem;
  font-weight: bold;
  color: #06b7db;
  & > span{
    color: #18181B;
    font-size: 0.8rem;
  }
`;