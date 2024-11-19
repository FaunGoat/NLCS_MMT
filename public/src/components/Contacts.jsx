import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.png";
import Logout from "./Logout";

export default function Contacts({ contacts, currentUser, currentChat, changeChat, socket }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [unreadMessages, setUnreadMessages] = useState(() => {
    const savedUnreadMessages = localStorage.getItem("unreadMessages");
    return savedUnreadMessages ? JSON.parse(savedUnreadMessages) : {};
  });

  useEffect(() => {
    if (currentUser) {
      setCurrentUserImage(currentUser.avatarImage);
      setCurrentUserName(currentUser.username);
    }
  }, [currentUser]);

  useEffect(() => {
    if (socket.current && currentChat) {
      const handleMsgReceive = (msg) => {
        if (msg.from !== currentChat._id) {
          console.log(msg.from);
          console.log(currentChat._id);
          setUnreadMessages((prevUnread) => {
            const updatedUnread = { ...prevUnread, [msg.from]: true };
            localStorage.setItem("unreadMessages", JSON.stringify(updatedUnread));
            return updatedUnread;
          });
        }
      };
  
      socket.current.on("msg-receive", handleMsgReceive);
  
      return () => {
        socket.current.off("msg-receive", handleMsgReceive); // Cleanup để tránh thêm listener dư thừa
      };
    }
  }, [currentChat]); // Chỉ cần phụ thuộc vào currentChat
  


  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
    setUnreadMessages((prevUnread) => {
      const updatedUnread = { ...prevUnread };
      delete updatedUnread[contact._id]; // Xóa trạng thái chưa đọc khi mở cuộc trò chuyện
      localStorage.setItem("unreadMessages", JSON.stringify(updatedUnread)); // Cập nhật localStorage
      return updatedUnread;
    });
  };

  const reloadPage = () => {
    window.location.reload();
  };
  return <>
    {currentUserImage && currentUserName && (
      <Container>
        <div className="brand" onClick={reloadPage} style={{ cursor: 'pointer' }} title="Trang Chủ">
          <img src={Logo} alt="logo" />
          <h1>mintlow</h1>
        </div>
        <div className="contacts">
          {contacts.map((contact, index) => {
            return (
              <div key={contact._id} className={`contact ${index === currentSelected ? "selected" : ""}`}
                onClick={() => changeCurrentChat(index, contact)}>
                <div className="avatar">
                  <img src={`data:image/svg+xml;base64,${contact.avatarImage}`} alt="" />
                </div>
                <div className="username">
                  <h3>{contact.username}</h3>
                </div>
                {unreadMessages[contact._id] && <span className="new-message-dot"></span>}
              </div>
            );
          })}
        </div>
        <div className="current-user">
          <div className="avatar">
            <img src={`data:image/svg+xml;base64,${currentUserImage}`} alt="avatar" />
          </div>
          <div className="username">
            <h2>{currentUserName}</h2>
          </div>
          <Logout />
        </div>
      </Container>
    )
    }
  </>;
}

const Container = styled.div`
  display: grid;
  border-right: solid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #ffffff;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 3.5rem;
    }
    h1 {
      color: black;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.3rem;
      &-thumb {
        background-color: #696969;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #FFFAFA;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      .avatar {
        img {
          height: 3rem;
          
        }
      }
      .username {
        h3 {
          color: black;
        }
      }
      .new-message-dot {
        width: 10px;
        height: 10px;
        background-color: blue;
        border-radius: 50%;
        right: 1rem;
        top: 1.5rem;
      }
    }
    .selected {
      background-color: #87CEFA;
    }
  }

  .current-user {
    background-color: #6495ED;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;