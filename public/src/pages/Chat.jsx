import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

function Chat() {
  const socket = useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  useEffect(() => {
    const checkUser = async () => {
      if (!localStorage.getItem("chat-app-user")) {
        navigate("/login");
      } else {
        const user = await JSON.parse(localStorage.getItem("chat-app-user"));
        setCurrentUser(user);
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    
    if (currentUser && !socket.current) {
      socket.current = io(host);
      // socket.current.emit("add-user", currentUser._id);
      socket.current.on("connect", () => {
        console.log("Socket connected:", socket.current);
        socket.current.emit("add-user", currentUser._id);
      });
      console.log("Socket initialized:", socket.current);
      return () => {
        socket.current.disconnect();
      };
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          try {
            const { data } = await axios.get(
              `${allUsersRoute}/${currentUser._id}`
            );
            setContacts(data);
          } catch (error) {
            console.error("Lỗi khi lấy danh sách liên hệ:", error);
          }
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchContacts();
  }, [currentUser, navigate]);
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
      <div className="container">
        <Contacts
          contacts={contacts}
          currentUser={currentUser}
          currentChat={currentChat}
          changeChat={handleChatChange}
          socket={socket}
        />
        {currentChat === undefined ? (
          <Welcome />
        ) : (
          <ChatContainer 
          currentChat={currentChat}
          currentUser={currentUser} 
          socket={socket} />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #D3D3D3;
  .container {
    height: 95vh;
    width: 95vw;
    border: 5px solid;
    background-color: #ffffff;
    display: grid;
    grid-template-columns: 20% 80%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 30% 70%;
    }
  }
`;

export default Chat;
