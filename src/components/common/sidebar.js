import { AsideLogo, AsideMenuItem, DashboardAside, LogoText, Menu } from "../../styles/common/sidebar.styles";
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
//import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useNavigate } from "react-router-dom";

const DashboardSidebar = (props) => {
  //props.isOpen
  const navigate = useNavigate();

  let items = [
    { icon: <DashboardOutlinedIcon />, title: 'Overview', path: '/overview' },
    { icon: <AssignmentIndOutlinedIcon />, title: '경력', path: '/career' },
    { icon: <TopicOutlinedIcon />, title: '활동게시판', path: '/activity' },
  ];

  return (
    <DashboardAside isOpen={props.isOpen}>
      <AsideLogo>
        <img src={'/logo.svg'} alt="logo" />
        <LogoText>Portfolio For</LogoText>
      </AsideLogo>
      <nav>
        <Menu>
          {items.map((el) =>
            <li key={el.title} onClick={() => { navigate(el.path) }}>
              <AsideMenuItem active={el.title === props.target}>
                {el.icon}
                <p>{el.title}</p>
                <KeyboardArrowRightOutlinedIcon />
              </AsideMenuItem>
            </li>
          )}
        </Menu>
      </nav>
    </DashboardAside>
  );
}

export default DashboardSidebar;