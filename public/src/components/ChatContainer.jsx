import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { getAllMessagesRoute, sendMessageRoute } from "../utils/APIRoutes";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'

export default function ChatContainer({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (currentChat) {
          const response = await axios.post(getAllMessagesRoute, {
            from: currentUser._id,
            to: currentChat._id,
          });
          setMessages(response.data);
        };
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    };
    if (currentChat) {
      fetchMessages();
    }
  }, [currentChat, currentUser]);

  const handleSendMsg = async (msg) => {
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    })
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      message: msg,
    });
    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  // useEffect(() => {
  //   if (socket.current) {
  //     socket.current.on("msg-receive", (msg) => {
  //       setArrivalMessage({ fromSelf: false, message: msg });
  //     });
  //   }
  // }, [socket]);

  useEffect(() => {
    if (socket.current && currentChat) {
      const currentSocket = socket.current;
      const displayNotification = (message) => {
        toast.info(message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "info",
        });
      };
      const handleMessageReceive = (msg) => {
        if (msg.from === currentChat._id) {
          setArrivalMessage({ fromSelf: false, message: msg.message });
        } else {
          displayNotification(`Bạn có tin nhắn mới.`);
        }
      };
      currentSocket.on("msg-receive", handleMessageReceive);
      return () => {
        currentSocket.off("msg-receive", handleMessageReceive);
      };
    }
  }, [socket, currentChat]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <ToastContainer />
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div className={`message ${message.fromSelf ? "sended" : "received"}`}>
                <div className="content">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 2rem;
    background-color: #6495ED;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 4rem;
        }
      }
      .username {
        h3 {
          color: white;
          font-size: 1.8rem;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    outline-style: solid;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.4rem;
      &-thumb {
        background-color: #696969;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #000000;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #1E90FF;
        color: #ffffff;
      }
    }
    .received {
      justify-content: flex-start;
      .content {
        background-color: #DCDCDC;
      }
    }
  }
`;
