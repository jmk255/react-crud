import styled from "@emotion/styled";

export const ActivityForm = styled.form`
  border: 1px solid silver;
  box-shadow: 2px 4px 2px rgba(0,0,0,0.08);
  padding: 50px;
  display: flex;
  flex-direction: column;
  row-gap: 30px;
`;

export const ActivityInputWrap = styled.div`
  display: flex;
  flex-direction: column;
  & label{
    margin-bottom: 5px;
  }

  & input{
    padding: 10px 15px;
    border: 1px solid silver;
  }

  & p{
    color: red;
    margin: 0;
    font-size: 12px;
    padding-left: 10px;
  }

  & textarea{
    height: 500px;
    padding: 10px;
    resize: none;
    border-color: silver;
  }
`;

export const ImgInputWrap = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  column-gap: 10px;

  & label{
    width: 300px;
    height: 400px;
    background-color: gray;

    display: flex;
    justify-content: center;
    align-items: center;

    color: white;
    font-size: 60px;
    cursor: pointer;

	border: 1px solid silver;
  }

  & label input{
    display: none;
  }
`;