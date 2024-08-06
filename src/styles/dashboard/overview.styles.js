import styled from '@emotion/styled';

export const Container = styled.div`
display: flex;
flex-direction: column;
align-items: center;
padding: 20px;
background-color: #f0f2f5;
`;

export const ProfileCard = styled.div`
background: white;
padding: 20px;
border-radius: 8px;
box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
width: 80%;
max-width: 600px;
text-align: center;
`;

export const ProfileImage = styled.img`
width: 120px;
height: 120px;
border-radius: 50%;
object-fit: cover;
border: 3px solid #007bff;
`;

export const Info = styled.div`
margin-top: 20px;
font-size: 16px;
line-height: 1.5;
`;

export const Label = styled.div`
font-weight: bold;
`;