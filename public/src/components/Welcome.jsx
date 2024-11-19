import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";

export default function Welcome() {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const getUserName = async () => {
      const userData = await JSON.parse(localStorage.getItem("chat-app-user"));
      if(userData) setUserName(userData.username);
    };

    getUserName();
  }, []);

  return (
    <Container>
      <img src={Robot} alt="" />
      <h1>
        Xin Chào, <span>{userName}!</span>
      </h1>
      <h2>
        <br /> Bắt đầu trò chuyện thôi nào.
      </h2>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background-color: #6495ED;
  flex-direction: column;
  img {
    height: 35rem;
  }
  span {
    color: #98fbcb;
  }
`;
