import styled from "@emotion/styled";

export const Title = styled.h1`
    font-size: 20px;
    color: red;
`;

export const AddBox = styled.table`
    width: 100%;
    overflow: auto;
    border: 1px solid lightgrey;

    & > thead {
        background-color: lightgrey;
    }

    & > td {
        padding: 0;
    }

    & input {
        width: 100%;
        padding: 5px 10px;
        outline: none;
        border : 1px solid black;
    }

    & button {
        width: 100%;
        cursor: pointer;
        padding : 10px;
        font-size: 16px;
        border-radius: 10px;
        background-color: beige;
    }
`;