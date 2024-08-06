import DashboardLayout from "../../components/common/layout";
import { useAuth } from "../../components/hooks/hooks";
import { Container, ProfileCard, ProfileImage, Info, Label } from '../../styles/dashboard/overview.styles';
import { UserContext } from "../../App";
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

const OverviewPage = () => {
  useAuth();
  const { accessToken } = useContext(UserContext);
  const [loggedInUser, setLoggedInUser] = useState({
    email: '',
    created_date: '',
    updated_date: '',
    profile_url: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let res = await axios.get('/api/loggedInEmail', { headers: { Authorization: `Bearer ${accessToken}` } });

        let res2 = await axios.get(`/api/users/${res.data}`);

        setLoggedInUser(res2.data);

      } catch (err) {
        console.log(err)
      }
    };

    fetchUser();
  }, [accessToken]);

  return (
    <DashboardLayout target="Overview">
      <Container>
        <ProfileCard>
          {loggedInUser.profile_url ? (
            <ProfileImage src={loggedInUser.profile_url} alt="Profile" />
          ) : (
            <ProfileImage src="https://via.placeholder.com/120" alt="Default Profile" />
          )}
          <Info>
            <div><Label>Email:</Label> {loggedInUser.email}</div>
            <div><Label>Created date:</Label> {loggedInUser.created_date}</div>
            <div><Label>Updated_date:</Label> {loggedInUser.updated_date}</div>
          </Info>
        </ProfileCard>
      </Container>
    </DashboardLayout>
  );
}

export default OverviewPage;